import { Client, TravelMode } from '@googlemaps/google-maps-services-js';

export interface DistanceResult {
  distance_km: number;
  duration_hours: number;
}

// ── Cache ─────────────────────────────────────────────────────────────────────
// Repeated calls for the same location pair (e.g. the same pickup→drop for
// every candidate in a batch) are served from cache to avoid redundant API
// spend. TTL of 1 hour is appropriate: road distances don't change in real time.
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
  result: DistanceResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(origin: string, destination: string): string {
  return `${origin.trim().toLowerCase()}::${destination.trim().toLowerCase()}`;
}

// ── Client ────────────────────────────────────────────────────────────────────
const mapsClient = new Client({});

// ── Public API ────────────────────────────────────────────────────────────────
export async function getDistanceAndDuration(
  origin: string,
  destination: string,
): Promise<DistanceResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Fallback to mock data when no real key is configured (local dev without key).
  // The matching algorithm still runs correctly — distances will be uniform across
  // candidates, so scoring reflects only overtime risk and idle-gap factors.
  if (!apiKey || apiKey === 'placeholder') {
    return { distance_km: 50, duration_hours: 1.5 };
  }

  const key = cacheKey(origin, destination);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.result;
  }

  const response = await mapsClient.directions({
    params: {
      origin,
      destination,
      mode: TravelMode.driving,
      key: apiKey,
    },
  });

  const routes = response.data.routes;
  if (!routes || routes.length === 0) {
    throw new Error(`No route found from "${origin}" to "${destination}"`);
  }

  const leg = routes[0].legs[0];
  const result: DistanceResult = {
    distance_km:   leg.distance.value / 1000,   // metres → km
    duration_hours: leg.duration.value / 3600,   // seconds → hours
  };

  cache.set(key, { result, expiresAt: now + CACHE_TTL_MS });
  return result;
}
