import { Router } from 'express';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { parseFreightRequest } from '../services/llm';

const router = Router();

// POST /api/requests
// Body: { raw_text: string, company_id?: string }
// Calls the LLM parser to extract structured fields, then persists the request.
// Returns 422 with a clarification prompt if the LLM cannot confidently parse.
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { raw_text, company_id } = req.body as { raw_text?: unknown; company_id?: unknown };

    if (!raw_text || typeof raw_text !== 'string' || raw_text.trim() === '') {
      res.status(400).json({ error: 'raw_text is required' });
      return;
    }

    const now = new Date();
    const parsed = await parseFreightRequest(raw_text.trim(), now);

    if (parsed.clarification_needed) {
      res.status(422).json({
        error: 'Request could not be fully parsed — please clarify',
        clarification_needed: parsed.clarification_needed,
      });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO requests
         (raw_text, cargo_type, weight_kg, pickup_location, drop_location,
          deadline, special_handling, status, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', $8)
       RETURNING *`,
      [
        raw_text.trim(),
        parsed.cargo_type,
        parsed.weight_kg,
        parsed.pickup_location,
        parsed.drop_location,
        parsed.deadline,
        parsed.special_handling,
        typeof company_id === 'string' ? company_id : null,
      ],
    );

    res.status(201).json({ request: rows[0] });
  }),
);

// GET /api/requests — list all, newest first
router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM requests ORDER BY created_at DESC',
    );
    res.json({ requests: rows });
  }),
);

// GET /api/requests/:id
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM requests WHERE id = $1',
      [req.params.id],
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    res.json({ request: rows[0] });
  }),
);

// PATCH /api/requests/:id
// Lets the dispatcher correct AI-parsed fields before running the match engine.
// Only allowed while the request hasn't been matched/booked/cancelled yet —
// editing after a match exists would silently invalidate that match's scoring.
// Body: any of cargo_type, weight_kg, pickup_location, drop_location, deadline, special_handling
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;

    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (body.cargo_type !== undefined) {
      setClauses.push(`cargo_type = $${setClauses.length + 1}`);
      values.push(body.cargo_type);
    }
    if (body.weight_kg !== undefined) {
      const weight = Number(body.weight_kg);
      if (isNaN(weight) || weight <= 0) {
        res.status(400).json({ error: 'weight_kg must be a positive number' });
        return;
      }
      setClauses.push(`weight_kg = $${setClauses.length + 1}`);
      values.push(weight);
    }
    if (body.pickup_location !== undefined) {
      setClauses.push(`pickup_location = $${setClauses.length + 1}`);
      values.push(body.pickup_location);
    }
    if (body.drop_location !== undefined) {
      setClauses.push(`drop_location = $${setClauses.length + 1}`);
      values.push(body.drop_location);
    }
    if (body.deadline !== undefined) {
      const deadline = new Date(body.deadline as string);
      if (isNaN(deadline.getTime())) {
        res.status(400).json({ error: 'deadline must be a valid ISO 8601 datetime string' });
        return;
      }
      setClauses.push(`deadline = $${setClauses.length + 1}`);
      values.push(deadline);
    }
    if (body.special_handling !== undefined) {
      if (!Array.isArray(body.special_handling)) {
        res.status(400).json({ error: 'special_handling must be an array of strings' });
        return;
      }
      setClauses.push(`special_handling = $${setClauses.length + 1}`);
      values.push(body.special_handling);
    }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No updatable fields provided' });
      return;
    }

    const { rows: existing } = await pool.query('SELECT status FROM requests WHERE id = $1', [req.params.id]);
    if (existing.length === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    if (!['pending_confirmation', 'confirmed'].includes(existing[0].status)) {
      res.status(409).json({
        error: `Cannot edit a request that has already been ${existing[0].status}`,
      });
      return;
    }

    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE requests SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    res.json({ request: rows[0] });
  }),
);

export default router;
