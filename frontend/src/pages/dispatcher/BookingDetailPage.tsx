import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Truck, User, MapPin, Clock, DollarSign, Phone, Loader2 } from 'lucide-react';
import { bookingsApi } from '@/api';
import { ApiError } from '@/api';
import type { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatCurrency, capitalise } from '@/lib/utils';

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    bookingsApi.get(id)
      .then(({ booking }) => setBooking(booking))
      .catch(() => navigate('/app/bookings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleStatus(status: 'cancelled' | 'completed') {
    if (!id) return;
    setUpdating(true);
    try {
      await bookingsApi.update(id, status);
      setBooking(prev => prev ? { ...prev, status } : prev);
      toast({ title: `Booking ${status}`, variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Failed to update booking.', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
    </div>
  );

  if (!booking) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/bookings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <StatusBadge status={booking.status} />
          <p className="text-sm text-muted-foreground mt-1">{booking.pickup_location} → {booking.drop_location}</p>
        </div>
      </div>

      {/* Route */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Route</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <InfoRow icon={MapPin} label="Pickup" value={booking.pickup_location} />
          <InfoRow icon={MapPin} label="Drop-off" value={booking.drop_location} />
          <InfoRow icon={Clock} label="Start time" value={formatDate(booking.start_time)} />
          <InfoRow icon={Clock} label="End time" value={formatDate(booking.end_time)} />
          <InfoRow icon={Truck} label="Cargo type" value={capitalise(booking.cargo_type)} />
          {booking.cost_estimate != null && <InfoRow icon={DollarSign} label="Est. cost" value={formatCurrency(booking.cost_estimate)} />}
        </CardContent>
      </Card>

      {/* Vehicle */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Vehicle</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <InfoRow icon={Truck} label="Vehicle number" value={booking.vehicle_number} />
          <InfoRow icon={Truck} label="Vehicle type" value={booking.vehicle_type} />
          {booking.deadhead_km != null && <InfoRow icon={MapPin} label="Deadhead distance" value={`${booking.deadhead_km} km`} />}
          {booking.score != null && <InfoRow icon={DollarSign} label="Match score" value={booking.score.toFixed(1)} />}
        </CardContent>
      </Card>

      {/* Driver */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Driver</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <InfoRow icon={User} label="Driver name" value={booking.driver_name} />
          <InfoRow icon={Phone} label="Phone" value={booking.driver_phone} />
        </CardContent>
      </Card>

      {/* Admin actions */}
      {user?.role === 'admin' && booking.status === 'confirmed' && (
        <>
          <Separator />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleStatus('completed')}
              disabled={updating}
              className="flex-1"
            >
              {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark completed
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatus('cancelled')}
              disabled={updating}
              className="flex-1"
            >
              {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancel booking
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
