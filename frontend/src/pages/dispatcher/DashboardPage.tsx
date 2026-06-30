import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { bookingsApi } from '@/api';
import type { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  color: 'emerald' | 'amber' | 'blue' | 'violet';
}

const colorMap: Record<StatCardProps['color'], string> = {
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
};

function StatCard({ title, value, description, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold mt-1.5 tracking-tight">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', colorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.list()
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = bookings.filter(b => b.status === 'confirmed').length;
  const today = bookings.filter(b => new Date(b.created_at).toDateString() === new Date().toDateString()).length;
  const recent = bookings.slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0]}`}
        description="Here's what's happening with your dispatches today."
        actions={
          <Button onClick={() => navigate('/app/request/new')} className="gap-1.5">
            <PlusCircle className="h-4 w-4" /> New Request
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-[88px]" />)
        ) : (
          <>
            <StatCard title="Active bookings" value={active} description="Confirmed, in progress" icon={TrendingUp} color="emerald" />
            <StatCard title="Bookings today" value={today} description="Created in the last 24 h" icon={Clock} color="amber" />
            <StatCard title="Total bookings" value={bookings.length} description="All time" icon={BookOpen} color="blue" />
          </>
        )}
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent bookings</CardTitle>
            <CardDescription>Your 5 most recent dispatch confirmations</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/bookings')} className="gap-1 text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <BookOpen className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No bookings yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1 mb-4">Create your first dispatch request to get started</p>
              <Button size="sm" onClick={() => navigate('/app/request/new')} className="gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" /> New Request
              </Button>
            </div>
          ) : (
            <div className="divide-y -mx-1">
              {recent.map(b => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/app/bookings/${b.id}`)}
                  className="w-full flex items-center justify-between py-3 px-3 text-left hover:bg-muted/40 rounded-lg transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.pickup_location} → {b.drop_location}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.vehicle_number} · {b.driver_name} · {formatDate(b.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {b.cost_estimate != null && <span className="text-sm font-semibold tabular-nums">{formatCurrency(b.cost_estimate)}</span>}
                    <StatusBadge status={b.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/app/request/new')}
          className="group text-left rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
        >
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
            <PlusCircle className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="font-semibold text-sm">New dispatch request</p>
          <p className="text-xs text-muted-foreground mt-0.5">Describe your shipment in plain language</p>
        </button>
        <button
          onClick={() => navigate('/app/bookings')}
          className="group text-left rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
        >
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <BookOpen className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <p className="font-semibold text-sm">View all bookings</p>
          <p className="text-xs text-muted-foreground mt-0.5">Search, filter, and manage bookings</p>
        </button>
      </div>
    </div>
  );
}
