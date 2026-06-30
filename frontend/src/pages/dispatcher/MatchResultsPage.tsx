import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, Truck, User, MapPin, Timer, DollarSign, Star } from 'lucide-react';
import { matchesApi, requestsApi, bookingsApi } from '@/api';
import { ApiError } from '@/api';
import type { FreightRequest, Match } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatWeight, formatCurrency, capitalise } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function ScoreBadge({ score }: { score: number }) {
  return (
    <Badge variant={score >= 75 ? 'success' : score >= 50 ? 'warning' : 'destructive'} className="font-mono">
      {score.toFixed(1)}
    </Badge>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className="h-4 w-4 text-muted-foreground mb-1" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function MatchResultsPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [request, setRequest] = useState<FreightRequest | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    Promise.all([requestsApi.list(), matchesApi.get(requestId)])
      .then(([{ requests }, { matches }]) => {
        const req = requests.find(r => r.id === requestId);
        if (req) setRequest(req);
        setMatches(matches);
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load matches'))
      .finally(() => setLoading(false));
  }, [requestId]);

  async function handleBook(match: Match) {
    if (!request) return;
    setBooking(match.vehicle_id);
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + match.eta_to_pickup_minutes * 60_000);
      const endTime = new Date(request.deadline);
      const { booking } = await bookingsApi.create({
        requestId: request.id,
        vehicleId: match.vehicle_id,
        driverId: match.driver_id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        score: match.score,
        deadheadKm: match.deadhead_km,
        costEstimate: match.cost_estimate,
      });
      toast({ title: 'Booking confirmed!', description: `${match.vehicle_number} assigned to ${match.driver_name}.`, variant: 'success' });
      navigate(`/app/bookings/${booking.id}`);
    } catch (err) {
      toast({ title: 'Booking failed', description: err instanceof ApiError ? err.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setBooking(null);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/request/new')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Match results</h1>
          <p className="text-sm text-muted-foreground">Ranked by score — best match first</p>
        </div>
      </div>

      {/* Request summary card */}
      {request && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-4">
            <p className="font-semibold text-sm">
              {formatWeight(request.weight_kg)} of {capitalise(request.cargo_type)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {request.pickup_location} → {request.drop_location}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Deadline: {formatDate(request.deadline)}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}</div>
      ) : matches.length === 0 && !error ? (
        <EmptyState
          icon={Truck}
          title="No matches found"
          description="No available vehicles satisfy all the constraints for this request. Try relaxing the deadline or check the fleet status."
          action={{ label: 'Edit request', onClick: () => navigate('/app/request/new') }}
        />
      ) : (
        <div className="space-y-4">
          {matches.map((match, i) => (
            <Card key={match.vehicle_id} className={cn('transition-all', i === 0 && 'ring-2 ring-primary/30')}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                      <span className="font-bold">{match.vehicle_number}</span>
                      <ScoreBadge score={match.score} />
                      {i === 0 && <Badge variant="default" className="text-[10px]"><Star className="h-2.5 w-2.5 mr-0.5" />Best match</Badge>}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {match.driver_name}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBook(match)}
                    disabled={booking !== null}
                    size="sm"
                    className="shrink-0"
                  >
                    {booking === match.vehicle_id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Book'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-4 gap-3 bg-muted/40 rounded-lg py-3 px-2">
                  <StatPill icon={Timer} label="ETA pickup" value={`${match.eta_to_pickup_minutes}m`} />
                  <StatPill icon={MapPin} label="Deadhead" value={`${match.deadhead_km}km`} />
                  <StatPill icon={MapPin} label="Trip" value={`${match.trip_km}km`} />
                  <StatPill icon={DollarSign} label="Cost est." value={formatCurrency(match.cost_estimate)} />
                </div>

                {match.overtime_risk_hours > 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Driver overtime risk: {match.overtime_risk_hours.toFixed(1)}h over weekly limit
                  </div>
                )}

                {match.explanation && (
                  <p className="text-sm text-muted-foreground border-t pt-3 leading-relaxed">{match.explanation}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
