import type { Booking, Driver, FreightRequest, Match, User, Vehicle } from './types';

const TOKEN_KEY = 'freight_token';
const USER_KEY  = 'freight_user';

// ── Token storage ─────────────────────────────────────────────────────────────

export function getStoredAuth(): { token: string; user: User } | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw   = localStorage.getItem(USER_KEY);
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) as User };
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Error type ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Base fetch ────────────────────────────────────────────────────────────────

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const stored = getStoredAuth();
  if (stored) headers['Authorization'] = `Bearer ${stored.token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(
      (data.error as string) ?? `HTTP ${res.status}`,
      res.status,
      data,
    );
  }
  return data as T;
}

// ── Typed API calls ───────────────────────────────────────────────────────────

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('POST', '/auth/login', { email, password }),

  // Requests
  createRequest: (rawText: string) =>
    request<{ request: FreightRequest }>('POST', '/requests', { raw_text: rawText }),
  getRequests: () =>
    request<{ requests: FreightRequest[] }>('GET', '/requests'),

  // Matching
  getMatches: (requestId: string) =>
    request<{ matches: Match[] }>('GET', `/matches?requestId=${encodeURIComponent(requestId)}`),

  // Bookings
  createBooking: (payload: {
    requestId: string;
    vehicleId: string;
    driverId: string;
    startTime: string;
    endTime: string;
    score: number;
    deadheadKm: number;
    costEstimate: number;
  }) =>
    request<{ booking: Booking }>('POST', '/bookings', payload),
  getBookings: () =>
    request<{ bookings: Booking[] }>('GET', '/bookings'),
  updateBooking: (id: string, status: 'cancelled' | 'completed') =>
    request<{ message: string }>('PATCH', `/bookings/${id}`, { status }),

  // Fleet
  getVehicles: () =>
    request<{ vehicles: Vehicle[] }>('GET', '/fleet/vehicles'),
  getDrivers: () =>
    request<{ drivers: Driver[] }>('GET', '/fleet/drivers'),
};
