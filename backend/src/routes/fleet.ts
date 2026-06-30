import { Router, Request, Response } from 'express';
import { DatabaseError } from 'pg';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ── Shared helpers ────────────────────────────────────────────────────────────

const VEHICLE_STATUSES = ['active', 'maintenance', 'retired'] as const;
type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

function isVehicleStatus(v: unknown): v is VehicleStatus {
  return VEHICLE_STATUSES.includes(v as VehicleStatus);
}

// Converts known pg constraint errors to client-friendly HTTP responses.
// Returns true if the error was handled, false if the caller should re-throw.
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
  if (err.code === '22P02') {
    res.status(400).json({ error: 'Invalid UUID format' });
    return true;
  }
  return false;
}

// ── Vehicles ──────────────────────────────────────────────────────────────────

// GET /api/fleet/vehicles — Admin + Dispatcher (read-only)
router.get(
  '/vehicles',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const { rows } = await pool.query(`
      SELECT
        v.id, v.vehicle_number, v.capacity_kg, v.maintenance_status, v.current_location,
        v.created_at, v.updated_at,
        json_build_object(
          'id',                    vt.id,
          'name',                  vt.name,
          'compatible_cargo_types',vt.compatible_cargo_types,
          'is_refrigerated',       vt.is_refrigerated,
          'is_hazmat_certified',   vt.is_hazmat_certified,
          'required_license_type', lt.name
        ) AS type
      FROM vehicles v
      JOIN vehicle_types vt ON v.type_id = vt.id
      JOIN license_types lt ON vt.required_license_type_id = lt.id
      ORDER BY v.vehicle_number
    `);
    res.json({ vehicles: rows });
  }),
);

// POST /api/fleet/vehicles — Admin only
router.post(
  '/vehicles',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { vehicle_number, type_id, capacity_kg, current_location, maintenance_status = 'active' } =
      req.body as Record<string, unknown>;

    if (!vehicle_number || !type_id || capacity_kg == null || !current_location) {
      res.status(400).json({
        error: 'vehicle_number, type_id, capacity_kg, and current_location are required',
      });
      return;
    }
    if (typeof capacity_kg !== 'number' || capacity_kg <= 0) {
      res.status(400).json({ error: 'capacity_kg must be a positive number' });
      return;
    }
    if (!isVehicleStatus(maintenance_status)) {
      res.status(400).json({ error: 'maintenance_status must be active, maintenance, or retired' });
      return;
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO vehicles (vehicle_number, type_id, capacity_kg, current_location, maintenance_status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [vehicle_number, type_id, capacity_kg, current_location, maintenance_status],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (
        !handlePgError(err, res, {
          vehicles_vehicle_number_key: 'A vehicle with that number already exists',
        })
      )
        throw err;
    }
  }),
);

// PATCH /api/fleet/vehicles/:id — Admin only
router.patch(
  '/vehicles/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;

    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (body.capacity_kg !== undefined) {
      if (typeof body.capacity_kg !== 'number' || body.capacity_kg <= 0) {
        res.status(400).json({ error: 'capacity_kg must be a positive number' });
        return;
      }
      setClauses.push(`capacity_kg = $${setClauses.length + 1}`);
      values.push(body.capacity_kg);
    }
    if (body.maintenance_status !== undefined) {
      if (!isVehicleStatus(body.maintenance_status)) {
        res.status(400).json({ error: 'maintenance_status must be active, maintenance, or retired' });
        return;
      }
      setClauses.push(`maintenance_status = $${setClauses.length + 1}`);
      values.push(body.maintenance_status);
    }
    if (body.current_location !== undefined) {
      setClauses.push(`current_location = $${setClauses.length + 1}`);
      values.push(body.current_location);
    }
    if (body.type_id !== undefined) {
      setClauses.push(`type_id = $${setClauses.length + 1}`);
      values.push(body.type_id);
    }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No updatable fields provided' });
      return;
    }

    values.push(id);
    try {
      const { rows } = await pool.query(
        `UPDATE vehicles SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values,
      );
      if (rows.length === 0) {
        res.status(404).json({ error: 'Vehicle not found' });
        return;
      }
      res.json(rows[0]);
    } catch (err) {
      if (!handlePgError(err, res, {})) throw err;
    }
  }),
);

// ── Drivers ───────────────────────────────────────────────────────────────────

// GET /api/fleet/drivers — Admin + Dispatcher (read-only)
router.get(
  '/drivers',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const { rows } = await pool.query(`
      SELECT
        d.id, d.name, d.phone, d.hours_worked_this_week, d.on_leave_until,
        d.current_location, d.created_at, d.updated_at,
        json_build_object(
          'id',   lt.id,
          'name', lt.name
        ) AS license_type
      FROM drivers d
      JOIN license_types lt ON d.license_type_id = lt.id
      ORDER BY d.name
    `);
    res.json({ drivers: rows });
  }),
);

// POST /api/fleet/drivers — Admin only
router.post(
  '/drivers',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      phone,
      license_type_id,
      current_location,
      hours_worked_this_week = 0,
      on_leave_until = null,
    } = req.body as Record<string, unknown>;

    if (!name || !phone || !license_type_id || !current_location) {
      res.status(400).json({
        error: 'name, phone, license_type_id, and current_location are required',
      });
      return;
    }
    if (typeof hours_worked_this_week !== 'number' || hours_worked_this_week < 0) {
      res.status(400).json({ error: 'hours_worked_this_week must be a non-negative number' });
      return;
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO drivers
           (name, phone, license_type_id, current_location, hours_worked_this_week, on_leave_until)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, phone, license_type_id, current_location, hours_worked_this_week, on_leave_until],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (
        !handlePgError(err, res, {
          drivers_phone_key: 'A driver with that phone number already exists',
        })
      )
        throw err;
    }
  }),
);

// PATCH /api/fleet/drivers/:id — Admin only
router.patch(
  '/drivers/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;

    const setClauses: string[] = [];
    const values: unknown[] = [];

    const stringFields = ['name', 'phone', 'current_location', 'license_type_id'] as const;
    for (const field of stringFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = $${setClauses.length + 1}`);
        values.push(body[field]);
      }
    }
    if (body.hours_worked_this_week !== undefined) {
      if (
        typeof body.hours_worked_this_week !== 'number' ||
        body.hours_worked_this_week < 0
      ) {
        res.status(400).json({ error: 'hours_worked_this_week must be a non-negative number' });
        return;
      }
      setClauses.push(`hours_worked_this_week = $${setClauses.length + 1}`);
      values.push(body.hours_worked_this_week);
    }
    // on_leave_until: null clears leave, a date string sets it
    if (body.on_leave_until !== undefined) {
      setClauses.push(`on_leave_until = $${setClauses.length + 1}`);
      values.push(body.on_leave_until ?? null);
    }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No updatable fields provided' });
      return;
    }

    values.push(id);
    try {
      const { rows } = await pool.query(
        `UPDATE drivers SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values,
      );
      if (rows.length === 0) {
        res.status(404).json({ error: 'Driver not found' });
        return;
      }
      res.json(rows[0]);
    } catch (err) {
      if (
        !handlePgError(err, res, {
          drivers_phone_key: 'A driver with that phone number already exists',
        })
      )
        throw err;
    }
  }),
);

export default router;
