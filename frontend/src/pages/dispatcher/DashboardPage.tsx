import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi, fleetApi } from '@/api';
import type { Booking, Vehicle, Driver } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

const mono = "'IBM Plex Mono', monospace";
const heading = "'IBM Plex Mono', monospace";
const body = "'IBM Plex Mono', monospace";

export default function DashboardPage() {
  const { colors: C } = useTheme();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingsApi.list(),
      fleetApi.getVehicles().catch(() => ({ vehicles: [] as Vehicle[] })),
      fleetApi.getDrivers().catch(() => ({ drivers: [] as Driver[] })),
    ]).then(([b, v, d]) => {
      setBookings(b.bookings);
      setVehicles(v.vehicles);
      setDrivers(d.drivers);
    }).finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toDateString();
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
  const confirmedToday = bookings.filter(b => b.status === 'confirmed' && new Date(b.created_at).toDateString() === todayStr).length;
  const trucksActive = vehicles.filter(v => v.maintenance_status === 'active').length;
  const driversOnDuty = drivers.filter(d => !d.on_leave_until).length;
  const recent = bookings.slice(0, 6);

  const stats = [
    { label: 'Active bookings', value: loading ? '—' : String(activeBookings), color: C.accent, dim: C.accentDim },
    { label: 'Confirmed today', value: loading ? '—' : String(confirmedToday), color: C.success, dim: C.successDim },
    { label: 'Trucks available', value: loading ? '—' : `${trucksActive}/${vehicles.length}`, color: C.warn, dim: C.warnDim },
    { label: 'Drivers on duty', value: loading ? '—' : String(driversOnDuty), color: C.muted, dim: 'rgba(138,151,166,0.12)' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: body, color: C.text }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', color: s.color, lineHeight: 1 }}>
              {loading
                ? <span style={{ display: 'inline-block', width: 48, height: 28, borderRadius: 6, background: C.surface2 }} />
                : s.value
              }
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Recent bookings */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 15.5, color: C.text }}>Recent bookings</div>
              <div style={{ fontSize: 12.5, color: C.faint, marginTop: 2 }}>Your latest dispatch confirmations</div>
            </div>
            <button
              onClick={() => navigate('/app/bookings')}
              style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 12px', fontSize: 12.5, color: C.muted, cursor: 'pointer', fontFamily: body }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.accentLine)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
            >
              View all
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 54, borderRadius: 8, background: C.surface2, opacity: 0.7 }} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>No bookings yet</div>
              <button
                onClick={() => navigate('/app/request/new')}
                style={{ background: C.accent, color: C.accentText, border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: body }}
              >
                Create first dispatch
              </button>
            </div>
          ) : (
            <div>
              {recent.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/app/bookings/${b.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '14px 20px', background: 'transparent',
                    border: 'none', borderBottom: i < recent.length - 1 ? `1px solid ${C.border}` : 'none',
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
                      {b.vehicle_number} · {b.driver_name} · {formatDate(b.created_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 12, flexShrink: 0 }}>
                    {b.cost_estimate != null && (
                      <span style={{ fontFamily: mono, fontSize: 12.5, color: C.muted }}>{formatCurrency(b.cost_estimate)}</span>
                    )}
                    <StatusBadge status={b.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* New dispatch CTA */}
          <button
            onClick={() => navigate('/app/request/new')}
            style={{
              width: '100%', padding: '20px', background: C.accent, border: 'none', borderRadius: 14,
              cursor: 'pointer', textAlign: 'left', color: C.accentText, fontFamily: body,
              boxShadow: `0 8px 28px ${C.accentSoft}`,
            }}
          >
            <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 16, marginBottom: 5 }}>New dispatch</div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>Describe a shipment and get ranked matches instantly.</div>
          </button>

          {/* Bookings shortcut */}
          <button
            onClick={() => navigate('/app/bookings')}
            style={{ width: '100%', padding: '16px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', color: C.text, fontFamily: body }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.accentLine)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 14.5, color: C.text, marginBottom: 4 }}>All bookings</div>
            <div style={{ fontSize: 12.5, color: C.faint }}>Search, filter and manage every booking</div>
          </button>

          {/* Fleet mini-summary */}
          {!loading && vehicles.length > 0 && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px' }}>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 14 }}>Fleet status</div>
              {[
                { label: 'Available', count: vehicles.filter(v => v.maintenance_status === 'active').length, color: C.success },
                { label: 'Maintenance', count: vehicles.filter(v => v.maintenance_status === 'maintenance').length, color: C.warn },
                { label: 'Retired', count: vehicles.filter(v => v.maintenance_status === 'retired').length, color: C.faint },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.muted, flex: 1 }}>{row.label}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, fontFamily: heading, color: C.text }}>{row.count}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: C.surface2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: C.success,
                  width: `${vehicles.length > 0 ? Math.round((trucksActive / vehicles.length) * 100) : 0}%`,
                  borderRadius: 2,
                }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 11.5, fontFamily: mono, color: C.faint, textAlign: 'right' }}>
                {vehicles.length > 0 ? Math.round((trucksActive / vehicles.length) * 100) : 0}% available
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
