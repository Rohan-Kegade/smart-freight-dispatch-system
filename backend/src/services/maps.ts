// Step 5 will replace this with a real Google Maps Directions API call.
// The interface is fixed — only the implementation changes.

export interface DistanceResult {
  distance_km: number;
  duration_hours: number;
}

export async function getDistanceAndDuration(
  _origin: string,
  _destination: string,
): Promise<DistanceResult> {
  // Placeholder — returns mock values so the matching route is exercisable
  // before the Maps API key is configured.
  return { distance_km: 50, duration_hours: 1.5 };
}
