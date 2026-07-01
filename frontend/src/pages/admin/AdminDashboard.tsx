import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fleetApi, bookingsApi } from '@/api';
import type { Vehicle, Driver, Booking } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';

const C = {
  bg: '#090d13',
  surface: '#11171f',
  surface2: '#18212c',
  surface3: '#232f3c',
  border: 'rgba(255,255,255,.08)',
  text: '#eaf0f6',
  muted: '#8a97a6',
  faint: '#5c6875',
  accent: '#5aa2f0',
  accentDim: 'rgba(90,162,240,0.14)',
  accentLine: 'rgba(90,162,240,0.45)',
  success: '#4fca8b',
  successDim: 'rgba(79,202,139,0.15)',
  warn: '#e0a35e',
  warnDim: 'rgba(224,163,94,0.15)',
};

const mono = "'IBM Plex Mono', monospace";
const heading = "'Space Grotesk', sans-serif";
const body = "'IBM Plex Sans', system-ui, sans-serif";

function Skeleton({ w = '100%', h = 20 }: { w?: string | number; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: C.surface3, opacity: 0.7 }} />;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fleetApi.getVehicles(), fleetApi.getDrivers(), bookingsApi.list()])
      .then(([{ vehicles }, { drivers }, { bookings }]) => {
        setVehicles(vehicles); setDrivers(drivers); setBookings(bookings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeVehicles = vehicles.filter(v => v.maintenance_status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.maintenance_status === 'maintenance').length;
  const activeDrivers = drivers.filter(d => !d.on_leave_until).length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const utilisation = vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0;
  const recentBookings = bookings.slice(0, 5);

  const todayStr = new Date().toDateString();
  const bookingsToday = bookings.filter(b => new Date(b.created_at).toDateString() === todayStr).length;

  const stats = [
    { label: 'Fleet size', value: loading ? null : vehicles.length, sub: `${activeVehicles} active`, color: C.accent },
    { label: 'Active drivers', value: loading ? null : activeDrivers, sub: `of ${drivers.length} total`, color: C.success },
    { label: 'Bookings today', value: loading ? null : bookingsToday, sub: `${confirmedBookings} confirmed`, color: C.warn },
    { label: 'Utilisation', value: loading ? null : `${utilisation}%`, sub: `${maintenanceVehicles} in maint.`, color: C.muted },
  ];

  const fleetRows = [
    { label: 'Active', count: activeVehicles, color: C.success },
    { label: 'Maintenance', count: maintenanceVehicles, color: C.warn },
    { label: 'Retired', count: vehicles.filter(v => v.maintenance_status === 'retired').length, color: C.faint },
  ];

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto', fontFamily: body, color: C.text }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontFamily: heading, fontWeight: 600, fontSize: 24, letterSpacing: '-0.01em', margin: '0 0 5px', color: C.text }}>
            Fleet at a glance
          </h1>
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Live utilisation and activity across your workspace.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/app/admin/vehicles')}
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 16px', fontSize: 13.5, color: C.muted, cursor: 'pointer', fontFamily: body, fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.accentLine)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            + Vehicle
          </button>
          <button
            onClick={() => navigate('/app/admin/drivers')}
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 16px', fontSize: 13.5, color: C.muted, cursor: 'pointer', fontFamily: body, fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.accentLine)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            + Driver
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px' }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 10 }}>{s.label}</div>
            {s.value === null
              ? <Skeleton w={60} h={32} />
              : <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em', color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
            }
            <div style={{ fontSize: 12, color: C.faint }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Maintenance alert */}
      {!loading && maintenanceVehicles > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: C.warnDim, border: `1px solid rgba(224,163,94,0.3)`,
          borderRadius: 10, padding: '12px 18px', marginBottom: 24,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.warn, flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: C.warn }}>
            <strong>{maintenanceVehicles} vehicle{maintenanceVehicles > 1 ? 's' : ''}</strong> currently in maintenance — not available for dispatch.
          </span>
          <button
            onClick={() => navigate('/app/admin/vehicles')}
            style={{ marginLeft: 'auto', background: 'transparent', border: `1px solid rgba(224,163,94,0.4)`, borderRadius: 6, padding: '5px 12px', fontSize: 12.5, color: C.warn, cursor: 'pointer', fontFamily: mono, flexShrink: 0 }}
          >
            View fleet
          </button>
        </div>
      )}

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Fleet by status */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 15.5, color: C.text }}>Fleet snapshot</div>
              <div style={{ fontSize: 12.5, color: C.faint, marginTop: 2 }}>Vehicle status breakdown</div>
            </div>
            <button
              onClick={() => navigate('/app/admin/vehicles')}
              style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 12px', fontSize: 12.5, color: C.muted, cursor: 'pointer', fontFamily: body }}
            >
              Manage
            </button>
          </div>
          <div style={{ padding: '20px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => <Skeleton key={i} h={18} />)}
              </div>
            ) : vehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 14, color: C.muted, marginBottom: 14 }}>No vehicles yet</div>
                <button
                  onClick={() => navigate('/app/admin/vehicles')}
                  style={{ background: C.accent, color: '#071019', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: body }}
                >
                  Add first vehicle
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {fleetRows.map(row => (
                  <div key={row.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13.5, color: C.muted, flex: 1 }}>{row.label}</span>
                      <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 15, color: C.text }}>{row.count}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: C.surface2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: row.color,
                        width: `${vehicles.length > 0 ? Math.round((row.count / vehicles.length) * 100) : 0}%`,
                        borderRadius: 3, opacity: 0.85,
                        transition: 'width .4s ease',
                      }} />
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, fontFamily: mono, color: C.faint, textAlign: 'right' }}>
                      {vehicles.length > 0 ? Math.round((row.count / vehicles.length) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live status panel */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 15.5, color: C.text }}>Live status</div>
              <div style={{ fontSize: 12.5, color: C.faint, marginTop: 2 }}>Vehicles and drivers right now</div>
            </div>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              [1,2,3,4].map(i => <Skeleton key={i} h={44} />)
            ) : (
              <>
                {[
                  { label: 'Vehicles on job', value: String(confirmedBookings), sub: 'confirmed bookings active', color: C.success, dim: C.successDim },
                  { label: 'Vehicles available', value: String(Math.max(0, activeVehicles - confirmedBookings)), sub: 'ready to dispatch', color: C.accent, dim: C.accentDim },
                  { label: 'In maintenance', value: String(maintenanceVehicles), sub: 'not available', color: C.warn, dim: C.warnDim },
                  { label: 'Drivers active', value: String(activeDrivers), sub: `of ${drivers.length} on roster`, color: C.muted, dim: 'rgba(138,151,166,0.1)' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: row.dim, border: `1px solid ${row.color}22`,
                    borderRadius: 9, padding: '11px 14px',
                  }}>
                    <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 22, color: row.color, minWidth: 36 }}>{row.value}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{row.label}</div>
                      <div style={{ fontSize: 11.5, color: C.faint, marginTop: 1 }}>{row.sub}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Recent bookings — full width */}
        <div style={{ gridColumn: '1 / -1', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 15.5, color: C.text }}>Recent bookings</div>
              <div style={{ fontSize: 12.5, color: C.faint, marginTop: 2 }}>Last 5 bookings across all dispatchers</div>
            </div>
            <button
              onClick={() => navigate('/app/bookings')}
              style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 12px', fontSize: 12.5, color: C.muted, cursor: 'pointer', fontFamily: body }}
            >
              View all
            </button>
          </div>
          {loading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <Skeleton key={i} h={48} />)}
            </div>
          ) : recentBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', fontSize: 14, color: C.muted }}>No bookings yet.</div>
          ) : (
            recentBookings.map((b, i) => (
              <button
                key={b.id}
                onClick={() => navigate(`/app/bookings/${b.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '14px 20px', background: 'transparent',
                  border: 'none', borderBottom: i < recentBookings.length - 1 ? `1px solid ${C.border}` : 'none',
                  cursor: 'pointer', textAlign: 'left', color: C.text, fontFamily: body,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.pickup_location} → {b.drop_location}
                  </div>
                  <div style={{ fontSize: 12, color: C.faint, marginTop: 3 }}>
                    {b.driver_name} · {b.vehicle_number} · {formatDate(b.start_time)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 16, flexShrink: 0 }}>
                  {b.cost_estimate != null && (
                    <span style={{ fontFamily: mono, fontSize: 12.5, color: C.muted }}>{formatCurrency(b.cost_estimate)}</span>
                  )}
                  <StatusBadge status={b.status} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
