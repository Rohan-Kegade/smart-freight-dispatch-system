import { useEffect, useState } from 'react';
import { api, ApiError } from '../../api';
import type { Booking } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  confirmed:  'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-gray-100 text-gray-500',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [acting,   setActing]   = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError('');
    api.getBookings()
      .then(({ bookings }) => setBookings(bookings))
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking? The request will be available for rebooking.')) return;
    setActing(id);
    try {
      await api.updateBooking(id, 'cancelled');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to cancel booking');
    } finally {
      setActing(null);
    }
  }

  async function handleComplete(id: string) {
    setActing(id);
    try {
      await api.updateBooking(id, 'completed');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to complete booking');
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
        <button
          onClick={load}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Loading…</p>}

      {!loading && bookings.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No bookings yet.</p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Route', 'Cargo', 'Vehicle', 'Driver', 'Start', 'Cost', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900">
                    <span className="block font-medium truncate max-w-[180px]">{b.pickup_location}</span>
                    <span className="text-gray-500 text-xs">→ {b.drop_location}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 capitalize">{b.cargo_type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{b.vehicle_number}</td>
                  <td className="px-4 py-3 text-gray-700">{b.driver_name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(b.start_time).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {b.cost_estimate != null ? `₹${Number(b.cost_estimate).toFixed(0)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[b.status] ?? ''}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'confirmed' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleComplete(b.id)}
                          disabled={acting === b.id}
                          className="text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={acting === b.id}
                          className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
