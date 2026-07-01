// ── Types ─────────────────────────────────────────────────────────────────────

export interface MatchVehicleType {
  id: string;
  name: string;
  compatible_cargo_types: string[];
  is_refrigerated: boolean;
  is_hazmat_certified: boolean;
  required_license_type: string; // 'LMV' | 'HMV' | 'HGMV'
}

export interface MatchVehicle {
  id: string;
  vehicle_number: string;
  capacity_kg: number;
  maintenance_status: string;
  current_location: string;
  type: MatchVehicleType;
}

export interface MatchDriver {
  id: string;
  name: string;
  phone: string;
  license_type: string; // 'LMV' | 'HMV' | 'HGMV'
  hours_worked_this_week: number;
  on_leave_until: Date | null;
  current_location: string;
}

export interface MatchBooking {
  vehicle_id: string;
  driver_id: string;
  start_time: Date;
  end_time: Date;
  status: string;
}

export interface TransportRequest {
  id: string;
  cargo_type: string;
  weight_kg: number;
  pickup_location: string;
  drop_location: string;
  deadline: Date;
  special_handling: string[];
}

export interface DistanceInfo {
  deadhead_km: number;
  eta_to_pickup_minutes: number;
  trip_km: number;
  trip_duration_hours: number;
}

export interface CandidatePair {
  vehicle: MatchVehicle;
  driver: MatchDriver;
}

export interface PairWithDistance extends CandidatePair {
  distance: DistanceInfo;
}

export interface ScoredMatch {
  vehicle: MatchVehicle;
  driver: MatchDriver;
  score: number;
  deadhead_km: number;
  eta_to_pickup_minutes: number;
  trip_km: number;
  cost_estimate: number;
  overtime_risk_hours: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Legal weekly driving limit (India Motor Transport Workers Act)
export const LEGAL_WEEKLY_HOURS = 60;

// ₹ per km — blended fuel + wear estimate for freight vehicles
export const COST_PER_KM = 15;

export const TOP_N_MATCHES = 3;

// Scoring weights — W1+W2+W3+W4 must equal 1.0
// Documented here because these are a key design decision worth discussing.
export const WEIGHTS = {
  proximity: 0.4, // W1 — deadhead distance (biggest lever on cost + time)
  cost:      0.3, // W2 — total trip cost estimate
  overtime:  0.2, // W3 — driver overtime risk
  idle:      0.1, // W4 — vehicle idle gap before the job
} as const;

// ── License hierarchy ─────────────────────────────────────────────────────────
// Higher rank = more permissive license (HGMV drivers can drive HMV and LMV vehicles)
const LICENSE_RANK: Record<string, number> = { LMV: 1, HMV: 2, HGMV: 3 };

function isLicenseCompatible(driverLicense: string, requiredLicense: string): boolean {
  return (LICENSE_RANK[driverLicense] ?? 0) >= (LICENSE_RANK[requiredLicense] ?? 0);
}

// ── Overlap detection ─────────────────────────────────────────────────────────
// Two intervals [s1,e1] and [s2,e2] overlap iff s1 < e2 AND e1 > s2.
// Boundary: a booking that ends exactly at windowStart does NOT overlap → vehicle/driver is available.
function hasOverlap(
  bookings: MatchBooking[],
  entityId: string,
  field: 'vehicle_id' | 'driver_id',
  windowStart: Date,
  windowEnd: Date,
): boolean {
  return bookings
    .filter(b => b[field] === entityId && b.status === 'confirmed')
    .some(b => b.start_time < windowEnd && b.end_time > windowStart);
}

// ── Normalization ─────────────────────────────────────────────────────────────
// Maps raw values to [0, 1] where 1 = best (inverse: lower raw value is better).
function normalizeInverse(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 1); // all equal → all score full marks
  return values.map(v => 1 - (v - min) / (max - min));
}

// ── Idle gap ──────────────────────────────────────────────────────────────────
// Hours a vehicle sits idle between its last confirmed booking and the window start.
// A vehicle with no recent bookings gets 0 (not penalized for being fresh).
function computeIdleGap(vehicleId: string, bookings: MatchBooking[], windowStart: Date): number {
  const endTimes = bookings
    .filter(b => b.vehicle_id === vehicleId && b.status === 'confirmed' && b.end_time <= windowStart)
    .map(b => b.end_time.getTime());

  if (endTimes.length === 0) return 0;
  const lastEnd = Math.max(...endTimes);
  return (windowStart.getTime() - lastEnd) / (1000 * 60 * 60);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Filtering stage — eliminates candidates that violate hard constraints.
 *
 * @param estimatedTripHours  Used for the working-hours limit check. Pass the
 *   Maps API trip duration in Step 5; use a conservative estimate in Step 4.
 */
export function filterCandidates(
  vehicles: MatchVehicle[],
  drivers: MatchDriver[],
  bookings: MatchBooking[],
  request: TransportRequest,
  windowStart: Date,
  estimatedTripHours: number,
): CandidatePair[] {
  const windowEnd = request.deadline;
  const requiresRefrigeration = request.special_handling.includes('refrigerated');
  const requiresHazmat = request.special_handling.includes('hazmat');

  const validVehicles = vehicles.filter(v => {
    if (v.maintenance_status !== 'active') return false;
    if (v.capacity_kg < request.weight_kg) return false;
    if (!v.type.compatible_cargo_types.includes(request.cargo_type)) return false;
    if (requiresRefrigeration && !v.type.is_refrigerated) return false;
    if (requiresHazmat && !v.type.is_hazmat_certified) return false;
    if (hasOverlap(bookings, v.id, 'vehicle_id', windowStart, windowEnd)) return false;
    return true;
  });

  const validDrivers = drivers.filter(d => {
    if (d.on_leave_until !== null && d.on_leave_until >= windowStart) return false;
    if (d.hours_worked_this_week + estimatedTripHours > LEGAL_WEEKLY_HOURS) return false;
    if (hasOverlap(bookings, d.id, 'driver_id', windowStart, windowEnd)) return false;
    return true;
  });

  const pairs: CandidatePair[] = [];
  for (const vehicle of validVehicles) {
    for (const driver of validDrivers) {
      if (isLicenseCompatible(driver.license_type, vehicle.type.required_license_type)) {
        pairs.push({ vehicle, driver });
      }
    }
  }
  return pairs;
}

/**
 * Scoring stage — ranks valid candidates using the weighted formula.
 * Pure function: accepts pre-fetched distance data so it contains no I/O.
 * Scores are 0–100 (higher = better match).
 */
export function rankCandidates(
  pairsWithDistances: PairWithDistance[],
  bookings: MatchBooking[],
  windowStart: Date,
): ScoredMatch[] {
  if (pairsWithDistances.length === 0) return [];

  // Compute raw factor values for every candidate
  const raw = pairsWithDistances.map(({ vehicle, driver, distance }) => ({
    vehicle,
    driver,
    distance,
    costEstimate: (distance.deadhead_km + distance.trip_km) * COST_PER_KM,
    overtimeRisk: Math.max(
      0,
      driver.hours_worked_this_week + distance.trip_duration_hours - LEGAL_WEEKLY_HOURS,
    ),
    idleGap: computeIdleGap(vehicle.id, bookings, windowStart),
  }));

  // Min-max normalize each factor across all candidates (inverse: lower = better)
  const normDeadhead  = normalizeInverse(raw.map(r => r.distance.deadhead_km));
  const normCost      = normalizeInverse(raw.map(r => r.costEstimate));
  const normOvertime  = normalizeInverse(raw.map(r => r.overtimeRisk));
  const normIdle      = normalizeInverse(raw.map(r => r.idleGap));

  const scored: ScoredMatch[] = raw.map((r, i) => ({
    vehicle: r.vehicle,
    driver:  r.driver,
    score: Math.round(
      (WEIGHTS.proximity * normDeadhead[i] +
        WEIGHTS.cost     * normCost[i] +
        WEIGHTS.overtime * normOvertime[i] +
        WEIGHTS.idle     * normIdle[i]) * 10000,
    ) / 100, // → 0.00 – 100.00
    deadhead_km:          r.distance.deadhead_km,
    eta_to_pickup_minutes: r.distance.eta_to_pickup_minutes,
    trip_km:              r.distance.trip_km,
    cost_estimate:        Math.round(r.costEstimate * 100) / 100,
    overtime_risk_hours:  Math.round(r.overtimeRisk * 100) / 100,
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, TOP_N_MATCHES);
}
