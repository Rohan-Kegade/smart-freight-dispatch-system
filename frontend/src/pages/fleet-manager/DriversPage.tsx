import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Pencil, UserX, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { EmptyState } from '@/components/shared/EmptyState';
import { Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';

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
  const { colors: C } = useTheme();
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
      const matchLeave = leaveFilter === 'all'
        || (leaveFilter === 'available' && d.is_active && !onLeave)
        || (leaveFilter === 'leave' && d.is_active && onLeave)
        || (leaveFilter === 'inactive' && !d.is_active);
      const matchSearch = !q || [d.name, d.phone, d.current_location].some(s => s?.toLowerCase().includes(q));
      return matchLeave && matchSearch;
    });
  }, [drivers, search, leaveFilter]);

  async function toggleActive(d: Driver) {
    try {
      await fleetApi.updateDriver(d.id, { is_active: !d.is_active });
      setDrivers(prev => prev.map(x => x.id === d.id ? { ...x, is_active: !x.is_active } : x));
      toast({ title: d.is_active ? 'Driver deactivated' : 'Driver reactivated', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Failed to update driver.', variant: 'destructive' });
    }
  }

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
    <div className="p-6 space-y-6 mx-auto" style={{ maxWidth: 1600 }}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
            {[{ value: 'all', label: 'All' }, { value: 'available', label: 'Available' }, { value: 'leave', label: 'On leave' }, { value: 'inactive', label: 'Inactive' }].map(tab => (
              <button
                key={tab.value}
                onClick={() => setLeaveFilter(tab.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  leaveFilter === tab.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search by name, phone, location…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
        </div>
        <Button onClick={openAdd} style={{ background: C.accent, color: C.accentText, fontWeight: 600 }}>
          <Plus className="h-4 w-4" /> Add driver
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No drivers found" description="Add your first driver to enable dispatch matching." action={{ label: 'Add driver', onClick: openAdd }} />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Phone</TableHead>
                <TableHead className="font-semibold text-foreground">License</TableHead>
                <TableHead className="font-semibold text-foreground">Location</TableHead>
                <TableHead className="font-semibold text-foreground">Hours this week</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Edit</TableHead>
                <TableHead className="font-semibold text-foreground">Activate/Deactivate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id} className={!d.is_active ? 'opacity-60' : undefined}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.phone}</TableCell>
                  <TableCell className="text-sm">{d.license_type?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{d.current_location}</TableCell>
                  <TableCell className="text-sm">{d.hours_worked_this_week}h</TableCell>
                  <TableCell>
                    {!d.is_active ? (
                      <Badge variant="secondary">Deactivated</Badge>
                    ) : d.on_leave_until ? (
                      <Badge variant="warning">On leave</Badge>
                    ) : (
                      <Badge variant="success">Available</Badge>
                    )}
                  </TableCell>
                  {/* Edit Column */}
<TableCell>
  <Button
    variant="ghost"
    size="icon"
    onClick={() => openEdit(d)}
    title="Edit driver"
  >
    <Pencil className="h-4 w-4" />
  </Button>
</TableCell>

{/* Activate / Deactivate Column */}
<TableCell>
  <Button
    variant="ghost"
    size="icon"
    title={d.is_active ? "Deactivate driver" : "Reactivate driver"}
    onClick={() => toggleActive(d)}
  >
    {d.is_active ? (
      <UserX className="h-4 w-4 text-destructive" />
    ) : (
      <UserCheck className="h-4 w-4 text-emerald-600" />
    )}
  </Button>
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
