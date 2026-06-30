import { useEffect, useState } from 'react';
import { api, ApiError } from '../../api';
import type { Driver, Vehicle } from '../../types';

type Tab = 'vehicles' | 'drivers';

const STATUS_COLORS: Record<string, string> = {
  active:      'bg-green-100 text-green-700',
  maintenance: 'bg-amber-100 text-amber-700',
  retired:     'bg-gray-100 text-gray-500',
};

export default function FleetPage() {
  const [tab,      setTab]      = useState<Tab>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers,  setDrivers]  = useState<Driver[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const fetch = tab === 'vehicles'
      ? api.getVehicles().then(({ vehicles }) => { setVehicles(vehicles); })
      : api.getDrivers().then(({ drivers }) => { setDrivers(drivers); });

    fetch
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Fleet Management</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {(['vehicles', 'drivers'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Loading…</p>}

      {/* Vehicles table */}
      {!loading && tab === 'vehicles' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Vehicle No.', 'Type', 'Capacity', 'Status', 'Location'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{v.vehicle_number}</td>
                  <td className="px-4 py-3 text-gray-700 capitalize">
                    {v.type.name.replace('_', ' ')}
                    {v.type.is_refrigerated && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Ref</span>
                    )}
                    {v.type.is_hazmat_certified && (
                      <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Hazmat</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{Number(v.capacity_kg).toLocaleString()} kg</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[v.maintenance_status] ?? ''}`}>
                      {v.maintenance_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.current_location}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicles.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">No vehicles found</p>
          )}
        </div>
      )}

      {/* Drivers table */}
      {!loading && tab === 'drivers' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Phone', 'License', 'Hours / week', 'Status', 'Location'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.map(d => {
                const onLeave = d.on_leave_until && new Date(d.on_leave_until) > new Date();
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{d.phone}</td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded font-medium">
                        {d.license_type.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {Number(d.hours_worked_this_week).toFixed(1)}h
                      {Number(d.hours_worked_this_week) > 50 && (
                        <span className="ml-1 text-amber-500 text-xs">⚠</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        onLeave ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {onLeave ? 'On leave' : 'Available'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.current_location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {drivers.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">No drivers found</p>
          )}
        </div>
      )}
    </div>
  );
}
