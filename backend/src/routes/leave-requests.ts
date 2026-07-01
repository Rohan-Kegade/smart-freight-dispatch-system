import { Router } from 'express';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { recordAudit } from '../services/auditLog';

const router = Router();

const LEAVE_SELECT = `
  SELECT lr.*, d.name AS driver_name
  FROM leave_requests lr
  JOIN drivers d ON lr.driver_id = d.id
`;

// ── POST /api/leave-requests ──────────────────────────────────────────────────
// Driver submits their own request; Fleet Manager may proxy-submit for a driver.
// Body: { driverId? (required for fleet_manager), startDate, endDate, reason? }
router.post(
  '/',
  authenticate,
  requireRole('driver', 'fleet_manager'),
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const { startDate, endDate, reason } = body;

    let driverId: string;
    if (req.user!.role === 'driver') {
      driverId = req.user!.driverId!;
    } else {
      if (typeof body.driverId !== 'string') {
        res.status(400).json({ error: 'driverId is required when submitted by a fleet manager' });
        return;
      }
      driverId = body.driverId;
    }

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO leave_requests (driver_id, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [driverId, startDate, endDate, typeof reason === 'string' ? reason : null],
    );

    await recordAudit(pool, {
      actorUserId: req.user!.id,
      actorRole: req.user!.role,
      action: 'leave.requested',
      entityType: 'leave_request',
      entityId: rows[0].id,
      metadata: { driverId },
    });

    res.status(201).json({ leaveRequest: rows[0] });
  }),
);

// ── GET /api/leave-requests ────────────────────────────────────────────────────
// Driver: own requests only. Fleet Manager: all requests, optional ?driverId=&status=
router.get(
  '/',
  authenticate,
  requireRole('driver', 'fleet_manager'),
  asyncHandler(async (req, res) => {
    if (req.user!.role === 'driver') {
      const { rows } = await pool.query(
        `${LEAVE_SELECT} WHERE lr.driver_id = $1 ORDER BY lr.created_at DESC`,
        [req.user!.driverId],
      );
      res.json({ leaveRequests: rows });
      return;
    }

    const { driverId, status } = req.query as { driverId?: string; status?: string };
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (driverId) { conditions.push(`lr.driver_id = $${values.length + 1}`); values.push(driverId); }
    if (status) { conditions.push(`lr.status = $${values.length + 1}`); values.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `${LEAVE_SELECT} ${where} ORDER BY lr.created_at DESC`,
      values,
    );
    res.json({ leaveRequests: rows });
  }),
);

// ── GET /api/leave-requests/:id ────────────────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  requireRole('driver', 'fleet_manager'),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`${LEAVE_SELECT} WHERE lr.id = $1`, [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }
    if (req.user!.role === 'driver' && rows[0].driver_id !== req.user!.driverId) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }
    res.json({ leaveRequest: rows[0] });
  }),
);

// ── PATCH /api/leave-requests/:id/approve — Fleet Manager only ───────────────
router.patch(
  '/:id/approve',
  authenticate,
  requireRole('fleet_manager'),
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'SELECT driver_id, end_date, status FROM leave_requests WHERE id = $1 FOR UPDATE',
        [req.params.id],
      );
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Leave request not found' });
        return;
      }
      if (rows[0].status !== 'pending') {
        await client.query('ROLLBACK');
        res.status(409).json({ error: `Cannot approve — request is already ${rows[0].status}` });
        return;
      }

      await client.query(
        "UPDATE leave_requests SET status = 'approved', reviewed_by = $1, reviewed_at = now() WHERE id = $2",
        [req.user!.id, req.params.id],
      );
      await client.query('UPDATE drivers SET on_leave_until = $1 WHERE id = $2', [rows[0].end_date, rows[0].driver_id]);

      await recordAudit(client, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'leave.approved',
        entityType: 'leave_request',
        entityId: req.params.id,
      });

      await client.query('COMMIT');
      res.json({ message: 'Leave request approved' });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }),
);

// ── PATCH /api/leave-requests/:id/deny — Fleet Manager only ──────────────────
router.patch(
  '/:id/deny',
  authenticate,
  requireRole('fleet_manager'),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT status FROM leave_requests WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }
    if (rows[0].status !== 'pending') {
      res.status(409).json({ error: `Cannot deny — request is already ${rows[0].status}` });
      return;
    }

    await pool.query(
      "UPDATE leave_requests SET status = 'denied', reviewed_by = $1, reviewed_at = now() WHERE id = $2",
      [req.user!.id, req.params.id],
    );
    await recordAudit(pool, {
      actorUserId: req.user!.id,
      actorRole: req.user!.role,
      action: 'leave.denied',
      entityType: 'leave_request',
      entityId: req.params.id,
    });
    res.json({ message: 'Leave request denied' });
  }),
);

// ── PATCH /api/leave-requests/:id/end — Driver (own) or Fleet Manager (proxy) ─
// Return from leave early. Clears drivers.on_leave_until without mutating the
// historical leave_requests row.
router.patch(
  '/:id/end',
  authenticate,
  requireRole('driver', 'fleet_manager'),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT driver_id FROM leave_requests WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }
    if (req.user!.role === 'driver' && rows[0].driver_id !== req.user!.driverId) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }

    await pool.query('UPDATE drivers SET on_leave_until = NULL WHERE id = $1', [rows[0].driver_id]);
    await recordAudit(pool, {
      actorUserId: req.user!.id,
      actorRole: req.user!.role,
      action: 'leave.returned_early',
      entityType: 'leave_request',
      entityId: req.params.id,
    });
    res.json({ message: 'Returned from leave' });
  }),
);

export default router;
