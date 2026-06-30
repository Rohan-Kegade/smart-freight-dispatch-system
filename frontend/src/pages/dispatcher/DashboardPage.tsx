import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { bookingsApi } from '@/api';
import type { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

function StatCard({ title, value, description, icon: Icon }: { title: string; value: string | number; description?: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
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

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user?.name?.split(' ')[0]}`}
        description="Here's what's happening with your fleet today."
        actions={<Button onClick={() => navigate('/app/request/new')}><PlusCircle className="h-4 w-4" /> New Request</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard title="Active bookings" value={active} description="Confirmed, in progress" icon={TrendingUp} />
            <StatCard title="Bookings today" value={today} description="Created in the last 24h" icon={Clock} />
            <StatCard title="Total bookings" value={bookings.length} description="All time" icon={BookOpen} />
          </>
        )}
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent bookings</CardTitle>
            <CardDescription>Your 5 most recent dispatch confirmations</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/app/bookings')}>View all</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : recent.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
              <Button variant="link" onClick={() => navigate('/app/request/new')}>Create your first request</Button>
            </div>
          ) : (
            <div className="divide-y">
              {recent.map(b => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/app/bookings/${b.id}`)}
                  className="w-full flex items-center justify-between py-3 text-left hover:bg-muted/40 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.pickup_location} → {b.drop_location}</p>
                    <p className="text-xs text-muted-foreground">{b.vehicle_number} · {b.driver_name} · {formatDate(b.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {b.cost_estimate != null && <span className="text-sm font-medium">{formatCurrency(b.cost_estimate)}</span>}
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
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/app/request/new')}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">New dispatch request</p>
              <p className="text-xs text-muted-foreground">Describe your shipment in plain language</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/app/bookings')}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">View all bookings</p>
              <p className="text-xs text-muted-foreground">Search, filter, and manage bookings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
