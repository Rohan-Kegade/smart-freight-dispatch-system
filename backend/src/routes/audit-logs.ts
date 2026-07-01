import { Router } from 'express';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ── GET /api/audit-logs — System Admin only ───────────────────────────────────
// Query params: actorUserId?, entityType?, action?, limit? (default 50), offset?
router.get(
  '/',
  authenticate,
  requireRole(),
  asyncHandler(async (req, res) => {
    const { actorUserId, entityType, action } = req.query as Record<string, string | undefined>;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const conditions: string[] = [];
    const values: unknown[] = [];
    if (actorUserId) { conditions.push(`al.actor_user_id = $${values.length + 1}`); values.push(actorUserId); }
    if (entityType) { conditions.push(`al.entity_type = $${values.length + 1}`); values.push(entityType); }
    if (action) { conditions.push(`al.action = $${values.length + 1}`); values.push(action); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    values.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT al.*, u.name AS actor_name, u.email AS actor_email
       FROM audit_logs al
       LEFT JOIN users u ON al.actor_user_id = u.id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    res.json({ auditLogs: rows });
  }),
);

export default router;
