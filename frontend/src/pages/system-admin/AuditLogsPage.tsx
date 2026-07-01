import { useEffect, useState } from 'react';
import { Search, FileClock } from 'lucide-react';
import { auditLogsApi } from '@/api';
import type { AuditLog } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';

const PAGE_SIZE = 50;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setLoading(true);
    auditLogsApi.list({ limit: PAGE_SIZE, offset })
      .then(({ auditLogs }) => setLogs(auditLogs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [offset]);

  const q = search.toLowerCase();
  const filtered = logs.filter(l => !q || [l.action, l.entity_type, l.actor_name, l.actor_email].some(s => s?.toLowerCase().includes(q)));

  return (
    <div className="p-6 space-y-6 mx-auto" style={{ maxWidth: 1600 }}>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search action, entity, actor…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileClock} title="No audit entries found" description="System activity will appear here as users take actions." />
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-foreground">When</TableHead>
                  <TableHead className="font-semibold text-foreground">Actor</TableHead>
                  <TableHead className="font-semibold text-foreground">Action</TableHead>
                  <TableHead className="font-semibold text-foreground">Entity</TableHead>
                  <TableHead className="font-semibold text-foreground">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(l.created_at)}</TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium">{l.actor_name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{l.actor_role ?? ''}</div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{l.action}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.entity_type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {l.metadata ? JSON.stringify(l.metadata) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}>Newer</Button>
            <Button variant="outline" size="sm" disabled={logs.length < PAGE_SIZE} onClick={() => setOffset(o => o + PAGE_SIZE)}>Older</Button>
          </div>
        </>
      )}
    </div>
  );
}
