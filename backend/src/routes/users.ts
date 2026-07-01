import bcrypt from 'bcryptjs';
import { Router, Response } from 'express';
import { DatabaseError } from 'pg';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { recordAudit } from '../services/auditLog';
import type { Role } from '../types/express';

const router = Router();

const ROLES: Role[] = ['system_admin', 'fleet_manager', 'dispatcher', 'driver'];
function isRole(v: unknown): v is Role {
  return ROLES.includes(v as Role);
}

function handlePgError(err: unknown, res: Response, hints: Record<string, string>): boolean {
  if (!(err instanceof DatabaseError)) return false;
  if (err.code === '23505' && err.constraint && hints[err.constraint]) {
    res.status(409).json({ error: hints[err.constraint] });
    return true;
  }
  if (err.code === '23503') {
    res.status(400).json({ error: 'Invalid reference — related record not found' });
    return true;
  }
  return false;
}

// ── GET /api/users — System Admin only ────────────────────────────────────────
router.get(
  '/',
  authenticate,
  requireRole(),
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(`
      SELECT u.id, u.email, u.name, u.role, u.is_active, u.created_at, d.id AS driver_id
      FROM users u
      LEFT JOIN drivers d ON d.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ users: rows });
  }),
);

// ── POST /api/users — System Admin only ───────────────────────────────────────
// Body: { email, password, name, role, driverId? }
// When role='driver', driverId must reference an unlinked drivers row.
router.post(
  '/',
  authenticate,
  requireRole(),
  asyncHandler(async (req, res) => {
    const { email, password, name, role, driverId } = req.body as Record<string, unknown>;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'email, password, name, and role are required' });
      return;
    }
    if (!isRole(role)) {
      res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
      return;
    }
    if (role === 'driver' && typeof driverId !== 'string') {
      res.status(400).json({ error: 'driverId is required when role is "driver"' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (role === 'driver') {
        const { rows: driverRows } = await client.query(
          'SELECT id, user_id FROM drivers WHERE id = $1 FOR UPDATE',
          [driverId],
        );
        if (driverRows.length === 0) {
          await client.query('ROLLBACK');
          res.status(400).json({ error: 'Driver not found' });
          return;
        }
        if (driverRows[0].user_id) {
          await client.query('ROLLBACK');
          res.status(409).json({ error: 'That driver already has a linked login' });
          return;
        }
      }

      const passwordHash = await bcrypt.hash(password as string, 10);
      const { rows: userRows } = await client.query(
        `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *`,
        [email, passwordHash, name, role],
      );

      if (role === 'driver') {
        await client.query('UPDATE drivers SET user_id = $1 WHERE id = $2', [userRows[0].id, driverId]);
      }

      await recordAudit(client, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'user.created',
        entityType: 'user',
        entityId: userRows[0].id,
        metadata: { role },
      });

      await client.query('COMMIT');
      res.status(201).json({
        user: {
          id: userRows[0].id, email: userRows[0].email, name: userRows[0].name,
          role: userRows[0].role, is_active: userRows[0].is_active, driver_id: driverId ?? null,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      if (!handlePgError(err, res, { users_email_key: 'A user with that email already exists' })) throw err;
    } finally {
      client.release();
    }
  }),
);

// ── PATCH /api/users/:id — System Admin only ──────────────────────────────────
// Body may include any of: name, role, is_active, password, driverId
router.patch(
  '/:id',
  authenticate,
  requireRole(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;

    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (body.name !== undefined) {
      setClauses.push(`name = $${setClauses.length + 1}`);
      values.push(body.name);
    }
    if (body.role !== undefined) {
      if (!isRole(body.role)) {
        res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
        return;
      }
      setClauses.push(`role = $${setClauses.length + 1}`);
      values.push(body.role);
    }
    let isActiveChanged = false;
    if (body.is_active !== undefined) {
      if (typeof body.is_active !== 'boolean') {
        res.status(400).json({ error: 'is_active must be a boolean' });
        return;
      }
      setClauses.push(`is_active = $${setClauses.length + 1}`);
      values.push(body.is_active);
      isActiveChanged = true;
    }
    if (body.password !== undefined) {
      const hash = await bcrypt.hash(body.password as string, 10);
      setClauses.push(`password_hash = $${setClauses.length + 1}`);
      values.push(hash);
    }

    if (setClauses.length === 0 && body.driverId === undefined) {
      res.status(400).json({ error: 'No updatable fields provided' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (body.driverId !== undefined) {
        await client.query('UPDATE drivers SET user_id = NULL WHERE user_id = $1', [id]);
        if (body.driverId !== null) {
          const { rows: driverRows } = await client.query(
            'SELECT id, user_id FROM drivers WHERE id = $1 FOR UPDATE',
            [body.driverId],
          );
          if (driverRows.length === 0) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'Driver not found' });
            return;
          }
          if (driverRows[0].user_id) {
            await client.query('ROLLBACK');
            res.status(409).json({ error: 'That driver already has a linked login' });
            return;
          }
          await client.query('UPDATE drivers SET user_id = $1 WHERE id = $2', [id, body.driverId]);
        }
      }

      let userRows: Record<string, unknown>[] = [];
      if (setClauses.length > 0) {
        values.push(id);
        ({ rows: userRows } = await client.query(
          `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
          values,
        ));
        if (userRows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({ error: 'User not found' });
          return;
        }
      }

      await recordAudit(client, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: isActiveChanged
          ? (body.is_active ? 'user.enabled' : 'user.disabled')
          : 'user.updated',
        entityType: 'user',
        entityId: id,
        metadata: { changedFields: Object.keys(body) },
      });

      await client.query('COMMIT');
      res.json({ message: 'User updated' });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      if (!handlePgError(err, res, { users_email_key: 'A user with that email already exists' })) throw err;
    } finally {
      client.release();
    }
  }),
);

export default router;
