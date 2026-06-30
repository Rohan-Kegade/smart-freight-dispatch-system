import { Router } from 'express';
import { DatabaseError } from 'pg';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { sendSms } from '../services/sms';

const router = Router();

// ── POST /api/bookings ────────────────────────────────────────────────────────
// Body: { requestId, vehicleId, driverId, startTime, endTime,
//         score?, deadheadKm?, costEstimate? }
//
// Uses SERIALIZABLE isolation so concurrent booking attempts for the same
// vehicle or driver are detected and rejected — no btree_gist required.
// The request row is locked with FOR UPDATE to prevent double-booking the
// same request when two dispatchers act simultaneously.
router.post(
  '/',
  authenticate,
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
      const { rows: vehicleConflict } = await client.query(
        `SELECT id FROM bookings
         WHERE vehicle_id = $1 AND status = 'confirmed'
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
         WHERE driver_id = $1 AND status = 'confirmed'
           AND start_time < $2 AND end_time > $3
         LIMIT 1`,
        [driverId, end, start],
      );
      if (driverConflict.length > 0) {
        await client.query('ROLLBACK');
        res.status(409).json({ error: 'Driver is already assigned during this time window' });
        return;
      }

      // ── 4. Create the booking ─────────────────────────────────────────────
      const { rows: bookingRows } = await client.query(
        `INSERT INTO bookings
           (request_id, vehicle_id, driver_id, start_time, end_time,
            status, score, deadhead_km, cost_estimate)
         VALUES ($1, $2, $3, $4, $5, 'confirmed', $6, $7, $8)
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
            `Hi ${name}, booking confirmed! Pickup ${req.cargo_type} from ${req.pickup_location} → ${req.drop_location}. ` +
              `Start: ${start.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`,
          );
        })
        .catch(err => console.error('SMS notification failed:', err));

      res.status(201).json({ booking: bookingRows[0] });
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
router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(`
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
      ORDER BY b.created_at DESC
    `);
    res.json({ bookings: rows });
  }),
);

// ── GET /api/bookings/:id ─────────────────────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT
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
       WHERE b.id = $1`,
      [req.params.id],
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json({ booking: rows[0] });
  }),
);

// ── PATCH /api/bookings/:id ───────────────────────────────────────────────────
// Admin only. status: 'cancelled' | 'completed'
// Cancelling a booking returns the request to 'confirmed' so it can be rebooked.
router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
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
      if (bookingRows[0].status !== 'confirmed') {
        await client.query('ROLLBACK');
        res.status(409).json({
          error: `Cannot update a booking that is already ${bookingRows[0].status}`,
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

export default router;
