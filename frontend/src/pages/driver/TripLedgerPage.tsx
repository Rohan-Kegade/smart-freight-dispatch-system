import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, AlertTriangle } from 'lucide-react';
import { bookingsApi } from '@/api';
import type { Booking } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn, formatDate } from '@/lib/utils';

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
] as const;

const UPCOMING_STATUSES = ['proposed', 'confirmed'];

export default function TripLedgerPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('upcoming');

  useEffect(() => {
    bookingsApi.list()
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => bookings
      .filter(b => tab === 'upcoming' ? UPCOMING_STATUSES.includes(b.status) : !UPCOMING_STATUSES.includes(b.status))
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
    [bookings, tab],
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              tab === t.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Truck} title="No trips" description={tab === 'upcoming' ? 'New trip proposals will show up here.' : 'Completed and past trips will show up here.'} />
      ) : (
        <div className="space-y-2">
          {filtered.map(b => (
            <button
              key={b.id}
              onClick={() => navigate(`/app/driver/trips/${b.id}`)}
              className="w-full text-left rounded-xl border p-3 space-y-2 bg-card"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {b.is_emergency && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                  <span className="font-medium text-sm truncate">{b.pickup_location} → {b.drop_location}</span>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{b.vehicle_number}</span>
                <span>{formatDate(b.start_time)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
