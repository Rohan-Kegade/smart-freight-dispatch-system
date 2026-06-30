import { Router } from 'express';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import {
  filterCandidates,
  rankCandidates,
  type MatchVehicle,
  type MatchDriver,
  type MatchBooking,
  type PairWithDistance,
} from '../services/matching';
import { getDistanceAndDuration } from '../services/maps';

const router = Router();

// GET /api/matches?requestId=<uuid>
// Returns the top-3 ranked vehicle+driver combinations for a confirmed request.
// Step 7 will add LLM-generated explanations; for now each match carries a
// data-driven placeholder so the endpoint is fully usable end-to-end.
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { requestId } = req.query as { requestId?: string };
    if (!requestId) {
      res.status(400).json({ error: 'requestId query parameter is required' });
      return;
    }

    // ── 1. Load the request ─────────────────────────────────────────────────
    const { rows: reqRows } = await pool.query(
      `SELECT id, cargo_type, weight_kg, pickup_location, drop_location,
              deadline, special_handling, status
       FROM requests WHERE id = $1`,
      [requestId],
    );
    if (reqRows.length === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    const dbReq = reqRows[0];
    if (dbReq.status !== 'confirmed') {
      res.status(409).json({
        error: `Request must be in 'confirmed' status before matching (current: ${dbReq.status})`,
      });
      return;
    }

    const transportRequest = {
      id:               dbReq.id,
      cargo_type:       dbReq.cargo_type,
      weight_kg:        Number(dbReq.weight_kg),
      pickup_location:  dbReq.pickup_location,
      drop_location:    dbReq.drop_location,
      deadline:         new Date(dbReq.deadline),
      special_handling: dbReq.special_handling ?? [],
    };

    const windowStart = new Date();

    // ── 2. Load fleet data ──────────────────────────────────────────────────
    const { rows: vehicleRows } = await pool.query<MatchVehicle & { type: MatchVehicle['type'] }>(`
      SELECT
        v.id, v.vehicle_number, v.capacity_kg, v.maintenance_status, v.current_location,
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
    `);

    const { rows: driverRows } = await pool.query(`
      SELECT
        d.id, d.name, d.phone, d.hours_worked_this_week, d.on_leave_until,
        d.current_location, lt.name AS license_type
      FROM drivers d
      JOIN license_types lt ON d.license_type_id = lt.id
    `);

    const drivers: MatchDriver[] = driverRows.map(r => ({
      ...r,
      hours_worked_this_week: Number(r.hours_worked_this_week),
      on_leave_until: r.on_leave_until ? new Date(r.on_leave_until) : null,
    }));

    // ── 3. Load active bookings for overlap detection ────────────────────────
    const { rows: bookingRows } = await pool.query(`
      SELECT vehicle_id, driver_id, start_time, end_time, status
      FROM bookings
      WHERE status = 'confirmed' AND end_time > $1
    `, [windowStart]);

    const bookings: MatchBooking[] = bookingRows.map(r => ({
      ...r,
      start_time: new Date(r.start_time),
      end_time:   new Date(r.end_time),
    }));

    // ── 4. Filter candidates ────────────────────────────────────────────────
    // Placeholder trip estimate (50km at 40km/h ≈ 1.25h); Step 5 replaces with real value.
    const PLACEHOLDER_TRIP_HOURS = 1.25;
    const pairs = filterCandidates(
      vehicleRows as MatchVehicle[],
      drivers,
      bookings,
      transportRequest,
      windowStart,
      PLACEHOLDER_TRIP_HOURS,
    );

    if (pairs.length === 0) {
      res.json({ matches: [] });
      return;
    }

    // ── 5. Fetch distances (deduplicated by location pair) ──────────────────
    // Parallelized so each unique driver-location → pickup pair is one Maps call.
    const uniqueDriverLocations = [...new Set(pairs.map(p => p.driver.current_location))];

    const [deadheadMap, tripInfo] = await Promise.all([
      Promise.all(
        uniqueDriverLocations.map(async loc => {
          const result = await getDistanceAndDuration(loc, transportRequest.pickup_location);
          return [loc, result] as const;
        }),
      ).then(entries => new Map(entries)),

      getDistanceAndDuration(transportRequest.pickup_location, transportRequest.drop_location),
    ]);

    const pairsWithDistances: PairWithDistance[] = pairs.map(p => {
      const dh = deadheadMap.get(p.driver.current_location)!;
      return {
        ...p,
        distance: {
          deadhead_km:           dh.distance_km,
          eta_to_pickup_minutes: Math.round((dh.distance_km / 40) * 60),
          trip_km:               tripInfo.distance_km,
          trip_duration_hours:   tripInfo.duration_hours,
        },
      };
    });

    // ── 6. Score and rank ───────────────────────────────────────────────────
    const ranked = rankCandidates(pairsWithDistances, bookings, windowStart);

    // ── 7. Shape response ───────────────────────────────────────────────────
    // Step 7 (LLM explainer) will replace the placeholder explanation.
    const matches = ranked.map(m => ({
      vehicle_id:            m.vehicle.id,
      vehicle_number:        m.vehicle.vehicle_number,
      driver_id:             m.driver.id,
      driver_name:           m.driver.name,
      score:                 m.score,
      deadhead_km:           m.deadhead_km,
      eta_to_pickup_minutes: m.eta_to_pickup_minutes,
      trip_km:               m.trip_km,
      cost_estimate:         m.cost_estimate,
      overtime_risk_hours:   m.overtime_risk_hours,
      explanation:           null, // populated by LLM in Step 7
    }));

    res.json({ matches });
  }),
);

export default router;
