import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Pencil } from 'lucide-react';
import { fleetApi } from '@/api';
import { ApiError } from '@/api';
import type { Driver } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LICENSE_OPTIONS = [
  { id: 'LMV', name: 'LMV (Light Motor Vehicle)' },
  { id: 'HMV', name: 'HMV (Heavy Motor Vehicle)' },
  { id: 'HTV', name: 'HTV (Heavy Transport Vehicle)' },
  { id: 'HGMV', name: 'HGMV (Heavy Goods Motor Vehicle)' },
];

interface DriverForm {
  name: string;
  phone: string;
  license_type_id: string;
  current_location: string;
  hours_worked_this_week: string;
  on_leave_until: string;
}

const emptyForm: DriverForm = { name: '', phone: '', license_type_id: '', current_location: '', hours_worked_this_week: '0', on_leave_until: '' };

export default function DriversPage() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fleetApi.getDrivers()
      .then(({ drivers }) => setDrivers(drivers))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return drivers.filter(d => {
      const onLeave = !!d.on_leave_until;
      const matchLeave = leaveFilter === 'all' || (leaveFilter === 'active' && !onLeave) || (leaveFilter === 'leave' && onLeave);
      const matchSearch = !q || [d.name, d.phone, d.current_location].some(s => s?.toLowerCase().includes(q));
      return matchLeave && matchSearch;
    });
  }, [drivers, search, leaveFilter]);

  function openAdd() { setEditing(null); setForm(emptyForm); setFormError(''); setDialogOpen(true); }
  function openEdit(d: Driver) {
    setEditing(d);
    setForm({ name: d.name, phone: d.phone, license_type_id: d.license_type.id, current_location: d.current_location, hours_worked_this_week: String(d.hours_worked_this_week), on_leave_until: d.on_leave_until ?? '' });
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError('');
    const hours = Number(form.hours_worked_this_week);
    if (!form.name.trim()) return setFormError('Name is required');
    if (!form.phone.trim()) return setFormError('Phone is required');
    if (!editing && !form.license_type_id) return setFormError('License type is required');
    if (!form.current_location.trim()) return setFormError('Current location is required');
    if (isNaN(hours) || hours < 0) return setFormError('Hours must be a non-negative number');

    setSaving(true);
    try {
      if (editing) {
        await fleetApi.updateDriver(editing.id, {
          name: form.name, phone: form.phone, current_location: form.current_location,
          hours_worked_this_week: hours, on_leave_until: form.on_leave_until || null,
        });
        setDrivers(prev => prev.map(d => d.id === editing.id ? { ...d, name: form.name, phone: form.phone, current_location: form.current_location, hours_worked_this_week: hours, on_leave_until: form.on_leave_until || null } : d));
        toast({ title: 'Driver updated', variant: 'success' });
      } else {
        await fleetApi.createDriver({ name: form.name, phone: form.phone, license_type_id: form.license_type_id, current_location: form.current_location, hours_worked_this_week: hours, on_leave_until: form.on_leave_until || null });
        const { drivers } = await fleetApi.getDrivers();
        setDrivers(drivers);
        toast({ title: 'Driver added', variant: 'success' });
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Drivers"
        description="Manage your driver roster, licenses, and availability."
        actions={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add driver</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone, location…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={leaveFilter} onValueChange={setLeaveFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All drivers</SelectItem>
            <SelectItem value="active">Active (not on leave)</SelectItem>
            <SelectItem value="leave">On leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No drivers found" description="Add your first driver to enable dispatch matching." action={{ label: 'Add driver', onClick: openAdd }} />
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Hours this week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.phone}</TableCell>
                  <TableCell className="text-sm">{d.license_type?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{d.current_location}</TableCell>
                  <TableCell className="text-sm">{d.hours_worked_this_week}h</TableCell>
                  <TableCell>
                    {d.on_leave_until ? (
                      <Badge variant="warning">On leave</Badge>
                    ) : (
                      <Badge variant="success">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit driver' : 'Add driver'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {formError && <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{formError}</p>}
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input placeholder="Ramesh Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>License type</Label>
                <Select value={form.license_type_id} onValueChange={v => setForm(f => ({ ...f, license_type_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select license…" /></SelectTrigger>
                  <SelectContent>
                    {LICENSE_OPTIONS.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Current location</Label>
              <Input placeholder="e.g. Bhiwandi Depot" value={form.current_location} onChange={e => setForm(f => ({ ...f, current_location: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Hours worked this week</Label>
              <Input type="number" min="0" max="70" value={form.hours_worked_this_week} onChange={e => setForm(f => ({ ...f, hours_worked_this_week: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>On leave until (optional)</Label>
              <Input type="date" value={form.on_leave_until} onChange={e => setForm(f => ({ ...f, on_leave_until: e.target.value }))} />
              {form.on_leave_until && <button className="text-xs text-destructive hover:underline" onClick={() => setForm(f => ({ ...f, on_leave_until: '' }))}>Clear leave</button>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Add driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
