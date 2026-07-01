import { Router } from 'express';
import { DatabaseError } from 'pg';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { sendSms } from '../services/sms';
import { recordAudit } from '../services/auditLog';

const router = Router();

const BOOKING_SELECT = `
  SELECT
    b.*,
    v.vehicle_number,
    vt.name AS vehicle_type,
    d.name  AS driver_name,
    d.phone AS driver_phone,
    r.cargo_type, r.pickup_location, r.drop_location
  FROM bookings b
  JOIN vehicles v     ON b.vehicle_id  = v.id
  JOIN vehicle_types vt ON v.type_id   = vt.id
  JOIN drivers d      ON b.driver_id   = d.id
  JOIN requests r     ON b.request_id  = r.id
`;

const TRIP_MILESTONES = ['at_pickup', 'loaded', 'in_transit', 'delivered'] as const;
type TripMilestone = (typeof TRIP_MILESTONES)[number];

function isTripMilestone(v: unknown): v is TripMilestone {
  return TRIP_MILESTONES.includes(v as TripMilestone);
}

// pg returns DECIMAL columns as strings — normalize to numbers so the
// frontend's arithmetic (.toFixed(), currency formatting) doesn't crash.
function normalizeBooking<T extends Record<string, unknown>>(row: T) {
  return {
    ...row,
    score: row.score != null ? Number(row.score) : null,
    deadhead_km: row.deadhead_km != null ? Number(row.deadhead_km) : null,
    cost_estimate: row.cost_estimate != null ? Number(row.cost_estimate) : null,
  };
}

// ── POST /api/bookings ────────────────────────────────────────────────────────
// Body: { requestId, vehicleId, driverId, startTime, endTime,
//         score?, deadheadKm?, costEstimate? }
// Dispatcher only. Creates a *proposed* booking — the assigned driver must
// accept it (PATCH /:id/accept) before it becomes 'confirmed'.
//
// Uses SERIALIZABLE isolation so concurrent booking attempts for the same
// vehicle or driver are detected and rejected — no btree_gist required.
// The request row is locked with FOR UPDATE to prevent double-booking the
// same request when two dispatchers act simultaneously.
router.post(
  '/',
  authenticate,
  requireRole('dispatcher'),
  asyncHandler(async (req, res) => {
    const {
      requestId, vehicleId, driverId,
      startTime, endTime,
      score, deadheadKm, costEstimate,
    } = req.body as Record<string, unknown>;

    if (!requestId || !vehicleId || !driverId || !startTime || !endTime) {
      res.status(400).json({
        error: 'requestId, vehicleId, driverId, startTime, and endTime are required',
      });
      return;
    }

    const start = new Date(startTime as string);
    const end   = new Date(endTime as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'startTime and endTime must be valid ISO 8601 datetime strings' });
      return;
    }
    if (end <= start) {
      res.status(400).json({ error: 'endTime must be after startTime' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE');

      // ── 1. Lock and validate the request ─────────────────────────────────
      const { rows: reqRows } = await client.query(
        `SELECT status, cargo_type, pickup_location, drop_location
         FROM requests WHERE id = $1 FOR UPDATE`,
        [requestId],
      );
      if (reqRows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Request not found' });
        return;
      }
      if (reqRows[0].status !== 'confirmed') {
        await client.query('ROLLBACK');
        res.status(409).json({
          error: `Request is not available for booking (status: ${reqRows[0].status})`,
        });
        return;
      }

      // ── 2. Check vehicle availability ─────────────────────────────────────
      // A pending proposal also blocks the window, not just a confirmed booking.
      const { rows: vehicleConflict } = await client.query(
        `SELECT id FROM bookings
         WHERE vehicle_id = $1 AND status IN ('proposed', 'confirmed')
           AND start_time < $2 AND end_time > $3
         LIMIT 1`,
        [vehicleId, end, start],
      );
      if (vehicleConflict.length > 0) {
        await client.query('ROLLBACK');
        res.status(409).json({ error: 'Vehicle is already booked during this time window' });
        return;
      }

      // ── 3. Check driver availability ──────────────────────────────────────
      const { rows: driverConflict } = await client.query(
        `SELECT id FROM bookings
         WHERE driver_id = $1 AND status IN ('proposed', 'confirmed')
           AND start_time < $2 AND end_time > $3
         LIMIT 1`,
        [driverId, end, start],
      );
      if (driverConflict.length > 0) {
        await client.query('ROLLBACK');
        res.status(409).json({ error: 'Driver is already assigned during this time window' });
        return;
      }

      // ── 4. Create the booking as a proposal ───────────────────────────────
      const { rows: bookingRows } = await client.query(
        `INSERT INTO bookings
           (request_id, vehicle_id, driver_id, start_time, end_time,
            status, score, deadhead_km, cost_estimate)
         VALUES ($1, $2, $3, $4, $5, 'proposed', $6, $7, $8)
         RETURNING *`,
        [
          requestId, vehicleId, driverId, start, end,
          score     ?? null,
          deadheadKm  ?? null,
          costEstimate ?? null,
        ],
      );

      // ── 5. Advance request to 'booked' ────────────────────────────────────
      await client.query(
        "UPDATE requests SET status = 'booked' WHERE id = $1",
        [requestId],
      );

      await recordAudit(client, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'booking.proposed',
        entityType: 'booking',
        entityId: bookingRows[0].id,
      });

      await client.query('COMMIT');

      // ── 6. Notify driver via SMS (fire-and-forget) ────────────────────────
      pool
        .query('SELECT phone, name FROM drivers WHERE id = $1', [driverId])
        .then(({ rows }) => {
          if (rows.length === 0) return;
          const { name, phone } = rows[0];
          const req = reqRows[0];
          return sendSms(
            phone,
            `Hi ${name}, you have a new trip proposal — open the app to accept or deny. ` +
              `Pickup ${req.cargo_type} from ${req.pickup_location} → ${req.drop_location}. ` +
              `Start: ${start.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`,
          );
        })
        .catch(err => console.error('SMS notification failed:', err));

      res.status(201).json({ booking: normalizeBooking(bookingRows[0]) });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      if (err instanceof DatabaseError && err.code === '40001') {
        // Serialization failure — a concurrent transaction conflicted
        res.status(409).json({ error: 'Booking conflict detected — please retry' });
        return;
      }
      if (err instanceof DatabaseError && err.code === '22P02') {
        res.status(400).json({ error: 'Invalid UUID format in one of the IDs' });
        return;
      }
      throw err;
    } finally {
      client.release();
    }
  }),
);

// ── GET /api/bookings ─────────────────────────────────────────────────────────
// Drivers only ever see their own bookings; every other role sees all of them.
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const isDriver = req.user!.role === 'driver';
    const { rows } = await pool.query(
      `${BOOKING_SELECT} ${isDriver ? 'WHERE b.driver_id = $1' : ''} ORDER BY b.created_at DESC`,
      isDriver ? [req.user!.driverId] : [],
    );
    res.json({ bookings: rows.map(normalizeBooking) });
  }),
);

// ── GET /api/bookings/:id ─────────────────────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    if (req.user!.role === 'driver' && rows[0].driver_id !== req.user!.driverId) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json({ booking: normalizeBooking(rows[0]) });
  }),
);

// ── PATCH /api/bookings/:id ───────────────────────────────────────────────────
// Fleet Manager or Dispatcher. status: 'cancelled' | 'completed'
// Cancelling a booking returns the request to 'confirmed' so it can be rebooked.
router.patch(
  '/:id',
  authenticate,
  requireRole('fleet_manager', 'dispatcher'),
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status?: string };
    if (status !== 'cancelled' && status !== 'completed') {
      res.status(400).json({ error: 'status must be "cancelled" or "completed"' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: bookingRows } = await client.query(
        'SELECT request_id, status FROM bookings WHERE id = $1 FOR UPDATE',
        [req.params.id],
      );
      if (bookingRows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      const currentStatus = bookingRows[0].status;
      const allowedFrom = status === 'completed' ? ['confirmed'] : ['proposed', 'confirmed'];
      if (!allowedFrom.includes(currentStatus)) {
        await client.query('ROLLBACK');
        res.status(409).json({
          error: `Cannot mark ${status} — booking is currently ${currentStatus}`,
        });
        return;
      }

      await client.query(
        'UPDATE bookings SET status = $1 WHERE id = $2',
        [status, req.params.id],
      );

      // Cancellation frees the request for rebooking
      if (status === 'cancelled') {
        await client.query(
          "UPDATE requests SET status = 'confirmed' WHERE id = $1",
          [bookingRows[0].request_id],
        );
      }

      await recordAudit(client, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: status === 'cancelled' ? 'booking.cancelled' : 'booking.completed',
        entityType: 'booking',
        entityId: req.params.id,
      });

      await client.query('COMMIT');
      res.json({ message: `Booking ${status}` });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }),
);

// ── PATCH /api/bookings/:id/accept ────────────────────────────────────────────
// Driver only — the Job Dispatch Handshake. Moves a proposal to 'confirmed'.
router.patch(
  '/:id/accept',
  authenticate,
  requireRole('driver'),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT driver_id, status FROM bookings WHERE id = $1',
      [req.params.id],
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    if (req.user!.role === 'driver' && rows[0].driver_id !== req.user!.driverId) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    if (rows[0].status !== 'proposed') {
      res.status(409).json({ error: `Cannot accept — booking is currently ${rows[0].status}` });
      return;
    }

    await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [req.params.id]);
    await recordAudit(pool, {
      actorUserId: req.user!.id,
      actorRole: req.user!.role,
      action: 'booking.accepted',
      entityType: 'booking',
      entityId: req.params.id,
    });
    res.json({ message: 'Booking accepted' });
  }),
);

// ── PATCH /api/bookings/:id/deny ──────────────────────────────────────────────
// Driver only. Denial frees the request so the dispatcher can re-run matching.
router.patch(
  '/:id/deny',
  authenticate,
  requireRole('driver'),
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        'SELECT driver_id, status, request_id FROM bookings WHERE id = $1 FOR UPDATE',
        [req.params.id],
      );
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Booking not found' });
        return;
      }
      if (req.user!.role === 'driver' && rows[0].driver_id !== req.user!.driverId) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Booking not found' });
        return;
      }
      if (rows[0].status !== 'proposed') {
        await client.query('ROLLBACK');
        res.status(409).json({ error: `Cannot deny — booking is currently ${rows[0].status}` });
        return;
      }

      await client.query("UPDATE bookings SET status = 'rejected' WHERE id = $1", [req.params.id]);
      await client.query("UPDATE requests SET status = 'confirmed' WHERE id = $1", [rows[0].request_id]);

      await recordAudit(client, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'booking.denied',
        entityType: 'booking',
        entityId: req.params.id,
      });

      await client.query('COMMIT');
      res.json({ message: 'Booking denied — request is available for re-matching' });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }),
);

// ── PATCH /api/bookings/:id/milestone ─────────────────────────────────────────
// Driver (own trip) or Fleet Manager (proxy, any trip). Body: { milestone }
router.patch(
  '/:id/milestone',
  authenticate,
  requireRole('driver', 'fleet_manager'),
  asyncHandler(async (req, res) => {
    const { milestone } = req.body as { milestone?: unknown };
    if (!isTripMilestone(milestone)) {
      res.status(400).json({ error: `milestone must be one of: ${TRIP_MILESTONES.join(', ')}` });
      return;
    }

    const { rows } = await pool.query(
      'SELECT driver_id, status FROM bookings WHERE id = $1',
      [req.params.id],
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    if (req.user!.role === 'driver' && rows[0].driver_id !== req.user!.driverId) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    if (rows[0].status !== 'confirmed') {
      res.status(409).json({ error: `Cannot update milestone — booking is currently ${rows[0].status}` });
      return;
    }

    await pool.query('UPDATE bookings SET trip_milestone = $1 WHERE id = $2', [milestone, req.params.id]);
    await recordAudit(pool, {
      actorUserId: req.user!.id,
      actorRole: req.user!.role,
      action: 'booking.milestone_updated',
      entityType: 'booking',
      entityId: req.params.id,
      metadata: { milestone },
    });
    res.json({ message: `Trip milestone updated to ${milestone}` });
  }),
);

// ── PATCH /api/bookings/:id/emergency ─────────────────────────────────────────
// Driver (own trip) or Fleet Manager (proxy, any trip). Manual mark/resolve only
// — no push notifications, this just flips a status field for the next dashboard load.
// Body: { is_emergency: boolean, note?: string }
router.patch(
  '/:id/emergency',
  authenticate,
  requireRole('driver', 'fleet_manager'),
  asyncHandler(async (req, res) => {
    const { is_emergency, note } = req.body as { is_emergency?: unknown; note?: unknown };
    if (typeof is_emergency !== 'boolean') {
      res.status(400).json({ error: 'is_emergency must be a boolean' });
      return;
    }

    const { rows } = await pool.query(
      'SELECT driver_id FROM bookings WHERE id = $1',
      [req.params.id],
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    if (req.user!.role === 'driver' && rows[0].driver_id !== req.user!.driverId) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (is_emergency) {
      await pool.query(
        `UPDATE bookings SET
           is_emergency = true,
           emergency_note = $1,
           emergency_marked_by = $2,
           emergency_marked_at = now()
         WHERE id = $3`,
        [typeof note === 'string' ? note : null, req.user!.id, req.params.id],
      );
    } else {
      await pool.query(
        `UPDATE bookings SET
           is_emergency = false,
           emergency_note = NULL,
           emergency_marked_by = NULL,
           emergency_marked_at = NULL
         WHERE id = $1`,
        [req.params.id],
      );
    }

    await recordAudit(pool, {
      actorUserId: req.user!.id,
      actorRole: req.user!.role,
      action: is_emergency ? 'booking.emergency_marked' : 'booking.emergency_resolved',
      entityType: 'booking',
      entityId: req.params.id,
      metadata: typeof note === 'string' ? { note } : undefined,
    });
    res.json({ message: is_emergency ? 'Emergency marked' : 'Emergency resolved' });
  }),
);

export default router;
