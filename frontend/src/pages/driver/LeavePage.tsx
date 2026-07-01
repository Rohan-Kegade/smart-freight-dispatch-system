import { useEffect, useState } from 'react';
import { CalendarClock, Undo2 } from 'lucide-react';
import { leaveRequestsApi, fleetApi, ApiError } from '@/api';
import type { LeaveRequest, Driver } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export default function LeavePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [ownDriver, setOwnDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  function refresh() {
    setLoading(true);
    Promise.all([leaveRequestsApi.list(), fleetApi.getDrivers()])
      .then(([{ leaveRequests }, { drivers }]) => {
        setRequests(leaveRequests);
        setOwnDriver(drivers.find(d => d.id === user?.driverId) ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [user?.driverId]);

  async function handleSubmit() {
    setFormError('');
    if (!startDate || !endDate) return setFormError('Start and end dates are required');
    if (endDate < startDate) return setFormError('End date must be on or after start date');

    setSubmitting(true);
    try {
      await leaveRequestsApi.create({ startDate, endDate, reason: reason || undefined });
      toast({ title: 'Leave request submitted', variant: 'success' });
      setStartDate(''); setEndDate(''); setReason('');
      refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturnEarly() {
    const approved = requests.find(r => r.status === 'approved');
    if (!approved) return;
    setEnding(true);
    try {
      await leaveRequestsApi.end(approved.id);
      toast({ title: 'Returned from leave', variant: 'success' });
      refresh();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Failed to return from leave.', variant: 'destructive' });
    } finally {
      setEnding(false);
    }
  }

  const isOnLeave = !!ownDriver?.on_leave_until;

  if (loading) {
    return <div className="p-4 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {isOnLeave && (
        <Card className="border-amber-400">
          <CardContent className="py-4 flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-medium">On leave until {formatDate(ownDriver!.on_leave_until!)}</p>
            </div>
            <Button size="sm" variant="outline" disabled={ending} onClick={handleReturnEarly}>
              <Undo2 className="h-3.5 w-3.5" /> Return early
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="py-3"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Request time off</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {formError && <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reason (optional)</Label>
            <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. family event" />
          </div>
          <Button className="w-full" disabled={submitting} onClick={handleSubmit}>Submit request</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {requests.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No leave requests yet" description="Submitted requests will appear here." />
        ) : (
          requests.map(r => (
            <div key={r.id} className="rounded-xl border p-3 flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">{formatDate(r.start_date)} – {formatDate(r.end_date)}</p>
                {r.reason && <p className="text-xs text-muted-foreground">{r.reason}</p>}
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
