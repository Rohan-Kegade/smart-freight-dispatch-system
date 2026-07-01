import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Truck, DollarSign, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { bookingsApi, ApiError } from '@/api';
import type { Booking, TripMilestone } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

const MILESTONES: { value: TripMilestone; label: string }[] = [
  { value: 'at_pickup', label: 'At Pickup' },
  { value: 'loaded', label: 'Loaded' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
];

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

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [emergencyNote, setEmergencyNote] = useState('');

  useEffect(() => {
    if (!id) return;
    bookingsApi.get(id)
      .then(({ booking }) => setBooking(booking))
      .catch(() => navigate('/app/driver/trips'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleAccept() {
    if (!id) return;
    setUpdating(true);
    try {
      await bookingsApi.accept(id);
      setBooking(prev => prev ? { ...prev, status: 'confirmed' } : prev);
      toast({ title: 'Trip accepted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Failed to accept trip.', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeny() {
    if (!id) return;
    setUpdating(true);
    try {
      await bookingsApi.deny(id);
      setBooking(prev => prev ? { ...prev, status: 'rejected' } : prev);
      toast({ title: 'Trip denied', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Failed to deny trip.', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  async function handleMilestone(milestone: TripMilestone) {
    if (!id) return;
    setUpdating(true);
    try {
      await bookingsApi.updateMilestone(id, milestone);
      setBooking(prev => prev ? { ...prev, trip_milestone: milestone } : prev);
      toast({ title: `Milestone updated: ${milestone.replace('_', ' ')}`, variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Failed to update milestone.', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  async function handleEmergency(mark: boolean) {
    if (!id) return;
    setUpdating(true);
    try {
      await bookingsApi.setEmergency(id, { is_emergency: mark, note: mark ? emergencyNote : undefined });
      setBooking(prev => prev ? { ...prev, is_emergency: mark, emergency_note: mark ? emergencyNote : null } : prev);
      setEmergencyNote('');
      toast({ title: mark ? 'Emergency marked' : 'Emergency resolved', variant: mark ? 'destructive' : 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Failed to update emergency status.', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      {[1, 2].map(i => <Skeleton key={i} className="h-28" />)}
    </div>
  );

  if (!booking) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/driver/trips')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <StatusBadge status={booking.status} />
          {booking.trip_milestone && <StatusBadge status={booking.trip_milestone} />}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{booking.pickup_location} → {booking.drop_location}</p>

      <Card>
        <CardHeader className="py-3"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Trip</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <InfoRow icon={MapPin} label="Pickup" value={booking.pickup_location} />
          <InfoRow icon={MapPin} label="Drop-off" value={booking.drop_location} />
          <InfoRow icon={Clock} label="Start time" value={formatDate(booking.start_time)} />
          <InfoRow icon={Truck} label="Vehicle" value={booking.vehicle_number} />
          {booking.cost_estimate != null && <InfoRow icon={DollarSign} label="Est. cost" value={formatCurrency(booking.cost_estimate)} />}
        </CardContent>
      </Card>

      {booking.status === 'proposed' && (
        <div className="flex gap-3">
          <Button onClick={handleAccept} disabled={updating} className="flex-1">
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Accept
          </Button>
          <Button variant="destructive" onClick={handleDeny} disabled={updating} className="flex-1">
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Deny
          </Button>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Trip status</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {MILESTONES.map(m => (
              <Button
                key={m.value}
                variant={booking.trip_milestone === m.value ? 'default' : 'outline'}
                size="sm"
                disabled={updating}
                onClick={() => handleMilestone(m.value)}
              >
                {m.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {(booking.status === 'confirmed' || booking.is_emergency) && (
        <Card className={booking.is_emergency ? 'border-destructive' : undefined}>
          <CardHeader className="py-3"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Emergency</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {booking.is_emergency ? (
              <>
                {booking.emergency_note && <p className="text-sm">{booking.emergency_note}</p>}
                <Button variant="outline" disabled={updating} onClick={() => handleEmergency(false)}>
                  {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Mark resolved
                </Button>
              </>
            ) : (
              <>
                <Input placeholder="What happened? (optional)" value={emergencyNote} onChange={e => setEmergencyNote(e.target.value)} />
                <Button variant="destructive" disabled={updating} onClick={() => handleEmergency(true)}>
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                  Mark emergency
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
