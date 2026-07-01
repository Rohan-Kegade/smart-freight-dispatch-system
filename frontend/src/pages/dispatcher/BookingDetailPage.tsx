import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Truck, User, MapPin, Clock, DollarSign, Phone, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { bookingsApi } from '@/api';
import { ApiError } from '@/api';
import type { Booking, TripMilestone } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatCurrency, capitalise } from '@/lib/utils';

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

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [emergencyNote, setEmergencyNote] = useState('');

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
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
    </div>
  );

  if (!booking) return null;

  // System Admin has universal access — it can see and act on every control
  // below, in addition to whatever its own role would normally allow.
  const isSystemAdmin = user?.role === 'system_admin';
  const canManage = user?.role === 'fleet_manager' || user?.role === 'dispatcher' || isSystemAdmin;
  const canProxy = user?.role === 'fleet_manager' || isSystemAdmin;
  const isDriver = user?.role === 'driver';
  const canHandshake = isDriver || isSystemAdmin;
  const canActOnTrip = isDriver || canProxy;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/bookings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <StatusBadge status={booking.status} />
          {booking.trip_milestone && <StatusBadge status={booking.trip_milestone} />}
          {booking.is_emergency && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> Emergency
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">{booking.pickup_location} → {booking.drop_location}</p>

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

      {/* Job Dispatch Handshake — driver (own trip) or System Admin (universal access) */}
      {canHandshake && booking.status === 'proposed' && (
        <>
          <Separator />
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
        </>
      )}

      {/* Trip milestone tracking — driver (own) or fleet manager (proxy) */}
      {canActOnTrip && booking.status === 'confirmed' && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Trip status</CardTitle></CardHeader>
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

      {/* Emergency mark/resolve — driver (own) or fleet manager (proxy). Manual only, no live alerting. */}
      {canActOnTrip && (booking.status === 'confirmed' || booking.is_emergency) && (
        <Card className={booking.is_emergency ? 'border-destructive' : undefined}>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Emergency</CardTitle></CardHeader>
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
                <Input
                  placeholder="What happened? (optional)"
                  value={emergencyNote}
                  onChange={e => setEmergencyNote(e.target.value)}
                />
                <Button variant="destructive" disabled={updating} onClick={() => handleEmergency(true)}>
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                  Mark emergency
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fleet Manager / Dispatcher actions */}
      {canManage && booking.status === 'confirmed' && (
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
