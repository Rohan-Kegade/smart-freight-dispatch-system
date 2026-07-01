import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Truck, User, Wrench } from 'lucide-react';
import { bookingsApi, fleetApi } from '@/api';
import type { Booking, Driver, Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn, formatDate } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(d: Date): Date { const c = new Date(d); c.setHours(0, 0, 0, 0); return c; }
function isSameDay(a: Date, b: Date): boolean { return startOfDay(a).getTime() === startOfDay(b).getTime(); }
function addDays(d: Date, n: number): Date { const c = new Date(d); c.setDate(c.getDate() + n); return c; }
function addMonths(d: Date, n: number): Date { return new Date(d.getFullYear(), d.getMonth() + n, 1); }

// 6 rows x 7 cols starting from the Sunday on/before the 1st of the month —
// enough to always cover the full month with a stable grid height.
function buildMonthGrid(monthStart: Date): Date[] {
  const gridStart = addDays(monthStart, -monthStart.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

const ACTIVE_STATUSES = new Set(['proposed', 'confirmed', 'completed']);

export default function CalendarPage() {
  const { colors: C } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState(() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1); });
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    Promise.all([bookingsApi.list(), fleetApi.getVehicles(), fleetApi.getDrivers()])
      .then(([b, v, d]) => { setBookings(b.bookings); setVehicles(v.vehicles); setDrivers(d.drivers); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const today = startOfDay(new Date());

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (!ACTIVE_STATUSES.has(b.status)) continue;
      const key = startOfDay(new Date(b.start_time)).toDateString();
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    return map;
  }, [bookings]);

  function leaveOverlapping(day: Date): Driver[] {
    return drivers.filter(d => d.on_leave_until && startOfDay(new Date(d.on_leave_until)) >= day);
  }

  const maintenanceVehicles = vehicles.filter(v => v.maintenance_status === 'maintenance');
  const onLeaveDrivers = drivers.filter(d => d.on_leave_until && new Date(d.on_leave_until) >= today);
  const selectedDayBookings = bookingsByDay.get(selectedDay.toDateString()) ?? [];
  const selectedDayLeave = leaveOverlapping(selectedDay);

  if (loading) {
    return (
      <div className="p-6 space-y-3 mx-auto" style={{ maxWidth: 1200 }}>
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 mx-auto" style={{ maxWidth: 1200 }}>
      {(maintenanceVehicles.length > 0 || onLeaveDrivers.length > 0) && (
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Currently unavailable</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-4 pt-0">
            {maintenanceVehicles.map(v => (
              <div key={v.id} className="flex items-center gap-2 text-sm">
                <Wrench className="h-4 w-4 text-amber-600" /> {v.vehicle_number} <span className="text-muted-foreground">in maintenance</span>
              </div>
            ))}
            {onLeaveDrivers.map(d => (
              <div key={d.id} className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-amber-600" /> {d.name} <span className="text-muted-foreground">on leave until {formatDate(d.on_leave_until!)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Month grid */}
        <div className="rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <h2 className="text-sm font-semibold">
              {viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setViewMonth(m => addMonths(m, -1))}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="sm" onClick={() => { const t = new Date(); setViewMonth(new Date(t.getFullYear(), t.getMonth(), 1)); setSelectedDay(startOfDay(t)); }}>Today</Button>
              <Button variant="outline" size="sm" onClick={() => setViewMonth(m => addMonths(m, 1))}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground border-b">
            {WEEKDAYS.map(w => <div key={w} className="py-2">{w}</div>)}
          </div>

          <div className="grid grid-cols-7">
            {grid.map(day => {
              const inMonth = day.getMonth() === viewMonth.getMonth();
              const dayBookings = bookingsByDay.get(day.toDateString()) ?? [];
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(startOfDay(day))}
                  className="border-b border-r p-1.5 text-left align-top last:border-r-0"
                  style={{
                    minHeight: 92,
                    background: isSelected ? C.accentDim : 'transparent',
                    opacity: inMonth ? 1 : 0.4,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center text-xs font-medium"
                    style={{
                      width: 22, height: 22, borderRadius: 999,
                      background: isToday ? C.accent : 'transparent',
                      color: isToday ? C.accentText : undefined,
                    }}
                  >
                    {day.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 2).map(b => (
                      <div
                        key={b.id}
                        className="truncate text-[10.5px] rounded px-1 py-0.5"
                        style={{ background: C.accentDim, color: C.accent }}
                        title={`${b.pickup_location} → ${b.drop_location}`}
                      >
                        {b.vehicle_number}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-[10.5px] text-muted-foreground px-1">+{dayBookings.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day detail panel */}
        <Card className="h-fit">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              {selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {selectedDayBookings.length === 0 && selectedDayLeave.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
            )}
            {selectedDayBookings.map(b => (
              <div key={b.id} className="rounded-md bg-muted/40 p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{b.pickup_location} → {b.drop_location}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{b.vehicle_number} · {b.driver_name}</span>
                  <span>{new Date(b.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {selectedDayLeave.map(d => (
              <div key={d.id} className={cn('flex items-center gap-2 text-sm rounded-md bg-amber-500/10 p-2.5')}>
                <User className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>{d.name} on leave until {formatDate(d.on_leave_until!)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
