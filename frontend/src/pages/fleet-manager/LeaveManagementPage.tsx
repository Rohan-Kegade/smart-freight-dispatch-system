import { useEffect, useState, useMemo } from 'react';
import { CalendarClock, Check, X, Undo2 } from 'lucide-react';
import { leaveRequestsApi, ApiError } from '@/api';
import type { LeaveRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { cn, formatDate } from '@/lib/utils';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'all', label: 'All' },
] as const;

export default function LeaveManagementPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    leaveRequestsApi.list()
      .then(({ leaveRequests }) => setRequests(leaveRequests))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  const filtered = useMemo(
    () => tab === 'all' ? requests : requests.filter(r => r.status === tab),
    [requests, tab],
  );

  async function act(id: string, action: 'approve' | 'deny' | 'end') {
    setBusyId(id);
    try {
      if (action === 'approve') await leaveRequestsApi.approve(id);
      if (action === 'deny') await leaveRequestsApi.deny(id);
      if (action === 'end') await leaveRequestsApi.end(id);
      toast({ title: 'Leave request updated', variant: 'success' });
      refresh();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Action failed.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 space-y-6 mx-auto" style={{ maxWidth: 1400 }}>
      <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              tab === t.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No leave requests" description="Driver time-off requests will appear here for review." />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-foreground">Driver</TableHead>
                <TableHead className="font-semibold text-foreground">Dates</TableHead>
                <TableHead className="font-semibold text-foreground">Reason</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="w-56" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.driver_name ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(r.start_date)} – {formatDate(r.end_date)}
                  </TableCell>
                  <TableCell className="text-sm">{r.reason ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell>
                    {r.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" disabled={busyId === r.id} onClick={() => act(r.id, 'approve')}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" disabled={busyId === r.id} onClick={() => act(r.id, 'deny')}>
                          <X className="h-3.5 w-3.5" /> Deny
                        </Button>
                      </div>
                    )}
                    {r.status === 'approved' && (
                      <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => act(r.id, 'end')}>
                        <Undo2 className="h-3.5 w-3.5" /> End leave early
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
