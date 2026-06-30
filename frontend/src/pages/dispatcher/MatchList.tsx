import { useEffect, useState } from 'react';
import { api, ApiError } from '../../api';
import type { Booking, FreightRequest, Match } from '../../types';

interface Props {
  request: FreightRequest;
  onBooked: (booking: Booking) => void;
  onBack: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? 'bg-green-100 text-green-700' :
    score >= 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900 text-sm">{value}</p>
    </div>
  );
}

export default function MatchList({ request, onBooked, onBack }: Props) {
  const [matches,  setMatches]  = useState<Match[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [booking,  setBooking]  = useState<string | null>(null); // vehicleId being booked

  useEffect(() => {
    api.getMatches(request.id)
      .then(({ matches }) => setMatches(matches))
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load matches'))
      .finally(() => setLoading(false));
  }, [request.id]);

  async function handleBook(match: Match) {
    setBooking(match.vehicle_id);
    setError('');
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + match.eta_to_pickup_minutes * 60_000);
      const endTime   = new Date(request.deadline);

      const { booking } = await api.createBooking({
        requestId:    request.id,
        vehicleId:    match.vehicle_id,
        driverId:     match.driver_id,
        startTime:    startTime.toISOString(),
        endTime:      endTime.toISOString(),
        score:        match.score,
        deadheadKm:   match.deadhead_km,
        costEstimate: match.cost_estimate,
      });
      onBooked(booking);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Booking failed');
    } finally {
      setBooking(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center gap-1"
      >
        ← Back to request
      </button>

      {/* Request summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm">
        <p className="font-semibold text-blue-900 mb-1">
          {Number(request.weight_kg).toLocaleString()} kg of{' '}
          <span className="capitalize">{request.cargo_type.replace('_', ' ')}</span>
        </p>
        <p className="text-blue-700">
          {request.pickup_location} → {request.drop_location}
        </p>
        <p className="text-blue-500 text-xs mt-1">
          Deadline:{' '}
          {new Date(request.deadline).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {loading ? 'Finding matches…' : `${matches.length} match${matches.length !== 1 ? 'es' : ''} found`}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && matches.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">
            No available vehicles match this request right now.
          </p>
          <button onClick={onBack} className="mt-4 text-blue-600 text-sm hover:underline">
            Modify the request
          </button>
        </div>
      )}

      <div className="space-y-4">
        {matches.map((match, i) => (
          <div
            key={match.vehicle_id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <span className="font-bold text-gray-900 text-base">{match.vehicle_number}</span>
                  <ScoreBadge score={match.score} />
                </div>
                <p className="text-sm text-gray-600 mt-0.5">Driver: {match.driver_name}</p>
              </div>
              <button
                onClick={() => handleBook(match)}
                disabled={booking !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {booking === match.vehicle_id ? 'Booking…' : 'Book'}
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 bg-gray-50 rounded-lg py-3 px-2 mb-3">
              <Stat label="ETA to pickup" value={`${match.eta_to_pickup_minutes} min`} />
              <Stat label="Deadhead" value={`${match.deadhead_km} km`} />
              <Stat label="Trip distance" value={`${match.trip_km} km`} />
              <Stat label="Est. cost" value={`₹${match.cost_estimate.toFixed(0)}`} />
            </div>

            {/* Overtime warning */}
            {match.overtime_risk_hours > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mb-3">
                ⚠ Driver overtime risk: {match.overtime_risk_hours.toFixed(1)}h over weekly limit
              </p>
            )}

            {/* LLM explanation */}
            {match.explanation && (
              <p className="text-sm text-gray-600 border-t border-gray-100 pt-3 leading-relaxed">
                {match.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
