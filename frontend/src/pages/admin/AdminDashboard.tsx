import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, BookOpen, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { fleetApi, bookingsApi } from '@/api';
import type { Vehicle, Driver, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate, formatCurrency } from '@/lib/utils';

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
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const recentBookings = bookings.slice(0, 5);

  const stats = [
    { title: 'Active vehicles', value: activeVehicles, total: vehicles.length, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Active drivers', value: drivers.filter(d => !d.on_leave_until).length, total: drivers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Live bookings', value: confirmedBookings, total: bookings.length, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Fleet utilisation', value: `${vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0}%`, total: null, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Admin dashboard"
        description="Fleet utilisation and recent activity at a glance."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/app/admin/vehicles')}><Plus className="h-4 w-4" /> Add vehicle</Button>
            <Button variant="outline" onClick={() => navigate('/app/admin/drivers')}><Plus className="h-4 w-4" /> Add driver</Button>
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-[88px]" />) : stats.map(s => (
          <Card key={s.title} className="relative overflow-hidden">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.title}</p>
                  <p className="text-3xl font-bold mt-1.5 tracking-tight">{s.value}</p>
                  {s.total !== null && <p className="text-xs text-muted-foreground mt-0.5">of {s.total} total</p>}
                </div>
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {!loading && maintenanceVehicles > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <span className="font-medium">{maintenanceVehicles} vehicle{maintenanceVehicles > 1 ? 's' : ''} in maintenance</span> — not available for dispatch until cleared.{' '}
              <button className="underline" onClick={() => navigate('/app/admin/vehicles')}>View fleet</button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fleet snapshot */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Fleet snapshot</CardTitle>
              <CardDescription>Status breakdown of all vehicles</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/admin/vehicles')}>Manage</Button>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40" /> : vehicles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No vehicles added yet.</p>
                <Button variant="link" onClick={() => navigate('/app/admin/vehicles')}>Add your first vehicle</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Active', count: vehicles.filter(v => v.maintenance_status === 'active').length, color: 'bg-emerald-500' },
                  { label: 'In maintenance', count: vehicles.filter(v => v.maintenance_status === 'maintenance').length, color: 'bg-amber-500' },
                  { label: 'Retired', count: vehicles.filter(v => v.maintenance_status === 'retired').length, color: 'bg-gray-400' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${color} shrink-0`} />
                    <span className="text-sm flex-1">{label}</span>
                    <span className="text-sm font-semibold">{count}</span>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${vehicles.length > 0 ? (count / vehicles.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent bookings</CardTitle>
              <CardDescription>Last 5 confirmed bookings</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/bookings')}>View all</Button>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40" /> : recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No bookings yet.</p>
            ) : (
              <div className="divide-y">
                {recentBookings.map(b => (
                  <button key={b.id} onClick={() => navigate(`/app/bookings/${b.id}`)} className="w-full flex items-center justify-between py-2.5 text-left hover:bg-muted/40 px-1 rounded transition-colors">
                    <div>
                      <p className="text-sm font-medium">{b.pickup_location} → {b.drop_location}</p>
                      <p className="text-xs text-muted-foreground">{b.driver_name} · {formatDate(b.start_time)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {b.cost_estimate && <span className="text-sm">{formatCurrency(b.cost_estimate)}</span>}
                      <StatusBadge status={b.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
