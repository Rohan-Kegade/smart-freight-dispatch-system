import {
  filterCandidates,
  rankCandidates,
  LEGAL_WEEKLY_HOURS,
  WEIGHTS,
  COST_PER_KM,
  type MatchVehicle,
  type MatchDriver,
  type MatchBooking,
  type TransportRequest,
  type PairWithDistance,
} from '../services/matching';

// ── Fixed test timestamps ─────────────────────────────────────────────────────
const NOW      = new Date('2026-07-01T08:00:00Z');
const DEADLINE = new Date('2026-07-01T18:00:00Z');

// ── Mock data builders ────────────────────────────────────────────────────────

function mkVehicle(overrides: Partial<MatchVehicle> = {}): MatchVehicle {
  return {
    id: 'v1',
    vehicle_number: 'MH-TEST-0001',
    capacity_kg: 5000,
    maintenance_status: 'active',
    current_location: 'Bhiwandi',
    type: {
      id: 'vt1',
      name: 'mini_truck',
      compatible_cargo_types: ['general', 'fabric'],
      is_refrigerated: false,
      is_hazmat_certified: false,
      required_license_type: 'HMV',
    },
    ...overrides,
  };
}

function mkDriver(overrides: Partial<MatchDriver> = {}): MatchDriver {
  return {
    id: 'd1',
    name: 'Test Driver',
    phone: '+91-9999999999',
    license_type: 'HMV',
    hours_worked_this_week: 10,
    on_leave_until: null,
    current_location: 'Bhiwandi',
    ...overrides,
  };
}

function mkBooking(overrides: Partial<MatchBooking> = {}): MatchBooking {
  return {
    vehicle_id: 'v1',
    driver_id: 'd1',
    start_time: new Date('2026-07-01T12:00:00Z'),
    end_time:   new Date('2026-07-01T16:00:00Z'),
    status: 'confirmed',
    ...overrides,
  };
}

function mkRequest(overrides: Partial<TransportRequest> = {}): TransportRequest {
  return {
    id: 'req1',
    cargo_type: 'fabric',
    weight_kg: 3000,
    pickup_location: 'Bhiwandi',
    drop_location: 'Andheri, Mumbai',
    deadline: DEADLINE,
    special_handling: [],
    ...overrides,
  };
}

function mkPairWithDistance(
  vehicle: MatchVehicle,
  driver: MatchDriver,
  deadhead_km = 10,
  trip_km = 50,
): PairWithDistance {
  return {
    vehicle,
    driver,
    distance: {
      deadhead_km,
      eta_to_pickup_minutes: Math.round((deadhead_km / 40) * 60),
      trip_km,
      trip_duration_hours: trip_km / 40,
    },
  };
}

// ── filterCandidates — vehicle filters ────────────────────────────────────────

describe('filterCandidates — vehicle filters', () => {
  it('excludes vehicles with insufficient capacity', () => {
    const v = mkVehicle({ capacity_kg: 1000 });
    const d = mkDriver();
    const req = mkRequest({ weight_kg: 2000 });
    expect(filterCandidates([v], [d], [], req, NOW, 3)).toHaveLength(0);
  });

  it('includes vehicles at exactly matching capacity', () => {
    const v = mkVehicle({ capacity_kg: 2000 });
    const d = mkDriver();
    const req = mkRequest({ weight_kg: 2000 });
    expect(filterCandidates([v], [d], [], req, NOW, 3)).toHaveLength(1);
  });

  it('excludes vehicles not in active maintenance status', () => {
    const v = mkVehicle({ maintenance_status: 'maintenance' });
    const d = mkDriver();
    expect(filterCandidates([v], [d], [], mkRequest(), NOW, 3)).toHaveLength(0);
  });

  it('excludes vehicles with incompatible cargo type', () => {
    const v = mkVehicle();
    const d = mkDriver();
    const req = mkRequest({ cargo_type: 'perishable' }); // not in ['general','fabric']
    expect(filterCandidates([v], [d], [], req, NOW, 3)).toHaveLength(0);
  });

  it('excludes non-refrigerated vehicle when cargo requires refrigeration', () => {
    const v = mkVehicle({
      type: {
        id: 'vt1', name: 'mini_truck',
        compatible_cargo_types: ['perishable'],
        is_refrigerated: false,
        is_hazmat_certified: false,
        required_license_type: 'HMV',
      },
    });
    const d = mkDriver();
    const req = mkRequest({ cargo_type: 'perishable', special_handling: ['refrigerated'] });
    expect(filterCandidates([v], [d], [], req, NOW, 3)).toHaveLength(0);
  });

  it('includes refrigerated vehicle for perishable cargo', () => {
    const v = mkVehicle({
      type: {
        id: 'vt2', name: 'refrigerated_truck',
        compatible_cargo_types: ['perishable'],
        is_refrigerated: true,
        is_hazmat_certified: false,
        required_license_type: 'HMV',
      },
    });
    const d = mkDriver();
    const req = mkRequest({ cargo_type: 'perishable', special_handling: ['refrigerated'] });
    expect(filterCandidates([v], [d], [], req, NOW, 3)).toHaveLength(1);
  });

  it('excludes non-hazmat vehicle when cargo requires hazmat certification', () => {
    const v = mkVehicle({
      type: {
        id: 'vt3', name: 'container_trailer',
        compatible_cargo_types: ['hazardous'],
        is_refrigerated: false,
        is_hazmat_certified: false,
        required_license_type: 'HGMV',
      },
    });
    const d = mkDriver({ license_type: 'HGMV' });
    const req = mkRequest({ cargo_type: 'hazardous', special_handling: ['hazmat'] });
    expect(filterCandidates([v], [d], [], req, NOW, 3)).toHaveLength(0);
  });

  it('excludes vehicle with a confirmed overlapping booking', () => {
    const v = mkVehicle({ id: 'v1' });
    const d = mkDriver();
    // Booking covers [10:00, 14:00] — overlaps with window [08:00, 18:00]
    const b = mkBooking({ vehicle_id: 'v1', driver_id: 'other', start_time: new Date('2026-07-01T10:00:00Z'), end_time: new Date('2026-07-01T14:00:00Z') });
    expect(filterCandidates([v], [d], [b], mkRequest(), NOW, 3)).toHaveLength(0);
  });

  it('includes vehicle whose confirmed booking ends exactly at window start', () => {
    const v = mkVehicle({ id: 'v1' });
    const d = mkDriver();
    // Booking ends at exactly NOW (windowStart) — no overlap
    const b = mkBooking({ vehicle_id: 'v1', driver_id: 'other', start_time: new Date('2026-07-01T06:00:00Z'), end_time: NOW });
    expect(filterCandidates([v], [d], [b], mkRequest(), NOW, 3)).toHaveLength(1);
  });

  it('ignores cancelled bookings when checking vehicle availability', () => {
    const v = mkVehicle({ id: 'v1' });
    const d = mkDriver();
    const b = mkBooking({ vehicle_id: 'v1', status: 'cancelled' });
    expect(filterCandidates([v], [d], [b], mkRequest(), NOW, 3)).toHaveLength(1);
  });
});

// ── filterCandidates — driver filters ────────────────────────────────────────

describe('filterCandidates — driver filters', () => {
  it('excludes driver currently on leave', () => {
    const v = mkVehicle();
    const d = mkDriver({ on_leave_until: new Date('2026-07-02T00:00:00Z') }); // leave ends tomorrow
    expect(filterCandidates([v], [d], [], mkRequest(), NOW, 3)).toHaveLength(0);
  });

  it('includes driver whose leave ended before window start', () => {
    const v = mkVehicle();
    const d = mkDriver({ on_leave_until: new Date('2026-07-01T07:00:00Z') }); // ended 1h before NOW
    expect(filterCandidates([v], [d], [], mkRequest(), NOW, 3)).toHaveLength(1);
  });

  it('excludes driver who would exceed legal working hours', () => {
    const v = mkVehicle();
    // 58 worked + 3 estimated trip = 61 > 60
    const d = mkDriver({ hours_worked_this_week: 58 });
    expect(filterCandidates([v], [d], [], mkRequest(), NOW, 3)).toHaveLength(0);
  });

  it('includes driver whose hours stay within legal limit', () => {
    const v = mkVehicle();
    // 56 worked + 3 estimated = 59 <= 60
    const d = mkDriver({ hours_worked_this_week: 56 });
    expect(filterCandidates([v], [d], [], mkRequest(), NOW, 3)).toHaveLength(1);
  });

  it('excludes driver with confirmed overlapping booking', () => {
    const v = mkVehicle();
    const d = mkDriver({ id: 'd1' });
    const b = mkBooking({ driver_id: 'd1', vehicle_id: 'other' });
    expect(filterCandidates([v], [d], [b], mkRequest(), NOW, 3)).toHaveLength(0);
  });

  it('excludes LMV driver for an HMV vehicle', () => {
    const v = mkVehicle(); // requires HMV
    const d = mkDriver({ license_type: 'LMV' });
    expect(filterCandidates([v], [d], [], mkRequest(), NOW, 3)).toHaveLength(0);
  });

  it('includes HGMV driver for an HMV vehicle (higher license is compatible)', () => {
    const v = mkVehicle(); // requires HMV
    const d = mkDriver({ license_type: 'HGMV' });
    expect(filterCandidates([v], [d], [], mkRequest(), NOW, 3)).toHaveLength(1);
  });

  it('includes HMV driver for an LMV vehicle', () => {
    const v = mkVehicle({
      type: {
        id: 'vt-van', name: 'van',
        compatible_cargo_types: ['fabric'],
        is_refrigerated: false,
        is_hazmat_certified: false,
        required_license_type: 'LMV',
      },
    });
    const d = mkDriver({ license_type: 'HMV' });
    expect(filterCandidates([v], [d], [], mkRequest(), NOW, 3)).toHaveLength(1);
  });
});

// ── rankCandidates ────────────────────────────────────────────────────────────

describe('rankCandidates', () => {
  it('returns empty array when given no candidates', () => {
    expect(rankCandidates([], [], NOW)).toEqual([]);
  });

  it('returns at most TOP_N_MATCHES results', () => {
    const pairs: PairWithDistance[] = Array.from({ length: 6 }, (_, i) =>
      mkPairWithDistance(
        mkVehicle({ id: `v${i}`, vehicle_number: `MH-TEST-000${i}` }),
        mkDriver({ id: `d${i}`, phone: `+91-99999${i}000${i}` }),
        10 + i,
      ),
    );
    expect(rankCandidates(pairs, [], NOW)).toHaveLength(3);
  });

  it('returns results in descending score order', () => {
    const close = mkPairWithDistance(mkVehicle({ id: 'v1' }), mkDriver({ id: 'd1' }), 5);
    const far   = mkPairWithDistance(mkVehicle({ id: 'v2', vehicle_number: 'MH-2' }), mkDriver({ id: 'd2', phone: '+91-2' }), 100);
    const [first, second] = rankCandidates([far, close], [], NOW);
    expect(first.score).toBeGreaterThanOrEqual(second.score);
    expect(first.driver.id).toBe('d1'); // closer driver ranks higher
  });

  it('favors lower deadhead distance when all else is equal', () => {
    const near = mkPairWithDistance(mkVehicle({ id: 'v1' }), mkDriver({ id: 'd1', hours_worked_this_week: 10 }), 5,  50);
    const far  = mkPairWithDistance(mkVehicle({ id: 'v2', vehicle_number: 'MH-2' }), mkDriver({ id: 'd2', phone: '+91-2', hours_worked_this_week: 10 }), 100, 50);
    const [first] = rankCandidates([near, far], [], NOW);
    expect(first.deadhead_km).toBe(5);
  });

  it('penalizes drivers with overtime risk', () => {
    // Same deadhead, but d2 is near the legal hours limit
    const safe     = mkPairWithDistance(mkVehicle({ id: 'v1' }), mkDriver({ id: 'd1', hours_worked_this_week: 10 }), 10, 50);
    const overtime = mkPairWithDistance(mkVehicle({ id: 'v2', vehicle_number: 'MH-2' }), mkDriver({ id: 'd2', phone: '+91-2', hours_worked_this_week: 58 }), 10, 50);
    const [first] = rankCandidates([safe, overtime], [], NOW);
    expect(first.driver.id).toBe('d1');
  });

  it('computes cost_estimate as (deadhead_km + trip_km) * COST_PER_KM', () => {
    const pair = mkPairWithDistance(mkVehicle(), mkDriver(), 20, 80);
    const [match] = rankCandidates([pair], [], NOW);
    expect(match.cost_estimate).toBeCloseTo((20 + 80) * COST_PER_KM, 2);
  });

  it('produces score in range [0, 100]', () => {
    const pairs: PairWithDistance[] = [
      mkPairWithDistance(mkVehicle({ id: 'v1' }), mkDriver({ id: 'd1' }), 5,  40),
      mkPairWithDistance(mkVehicle({ id: 'v2', vehicle_number: 'MH-2' }), mkDriver({ id: 'd2', phone: '+91-2' }), 80, 40),
    ];
    for (const m of rankCandidates(pairs, [], NOW)) {
      expect(m.score).toBeGreaterThanOrEqual(0);
      expect(m.score).toBeLessThanOrEqual(100);
    }
  });

  it('gives a single candidate a score of 100 (all normalized values are 1)', () => {
    const pair = mkPairWithDistance(mkVehicle(), mkDriver(), 30, 60);
    const [match] = rankCandidates([pair], [], NOW);
    // All four normalized factors = 1 → score = (W1+W2+W3+W4)*100 = 100
    expect(match.score).toBe(
      Math.round((WEIGHTS.proximity + WEIGHTS.cost + WEIGHTS.overtime + WEIGHTS.idle) * 10000) / 100,
    );
  });

  it('overtime_risk_hours is 0 when driver is well within limits', () => {
    const pair = mkPairWithDistance(mkVehicle(), mkDriver({ hours_worked_this_week: 10 }), 10, 50);
    const [match] = rankCandidates([pair], [], NOW);
    // 10h worked + 50km/40kmh ≈ 1.25h trip → 11.25h total, well under 60h limit
    expect(match.overtime_risk_hours).toBe(0);
  });
});
