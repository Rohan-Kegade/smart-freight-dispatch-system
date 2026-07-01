import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fleetApi, bookingsApi } from '@/api';
import { ApiError } from '@/api';
import type { Vehicle, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const body = "'IBM Plex Mono', monospace";

const VEHICLE_TYPE_OPTIONS = [
  { id: '', name: 'Select type…' },
  { id: 'mini_truck', name: 'Mini Truck' },
  { id: 'flatbed', name: 'Flatbed Truck' },
  { id: 'refrigerated', name: 'Refrigerated Truck' },
  { id: 'container', name: 'Container Trailer' },
  { id: 'van', name: 'Van' },
];

interface VehicleFormData {
  vehicle_number: string;
  type_id: string;
  capacity_kg: string;
  current_location: string;
  maintenance_status: string;
}

const emptyForm: VehicleFormData = { vehicle_number: '', type_id: '', capacity_kg: '', current_location: '', maintenance_status: 'active' };

export default function VehiclesPage() {
  const { colors: C } = useTheme();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    Promise.all([
      fleetApi.getVehicles(),
      bookingsApi.list().catch(() => ({ bookings: [] as Booking[] })),
    ]).then(([{ vehicles }, { bookings }]) => {
      setVehicles(vehicles);
      setBookings(bookings);
    }).finally(() => setLoading(false));
  }, []);

  const assignedDriverByVehicle = useMemo(() => {
    const map: Record<string, string> = {};
    for (const b of bookings) {
      if (b.status === 'confirmed' && !map[b.vehicle_id]) map[b.vehicle_id] = b.driver_name;
    }
    return map;
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vehicles.filter(v => {
      const matchStatus = statusFilter === 'all' || v.maintenance_status === statusFilter;
      const matchSearch = !q || [v.vehicle_number, v.current_location, v.type?.name].some(s => s?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [vehicles, search, statusFilter]);

  function openAdd() { setEditing(null); setForm(emptyForm); setFormError(''); setDialogOpen(true); }
  function openEdit(v: Vehicle) {
    setEditing(v);
    setForm({ vehicle_number: v.vehicle_number, type_id: '', capacity_kg: String(v.capacity_kg), current_location: v.current_location, maintenance_status: v.maintenance_status });
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError('');
    const cap = Number(form.capacity_kg);
    if (!editing && !form.vehicle_number.trim()) return setFormError('Vehicle number is required');
    if (!editing && !form.type_id) return setFormError('Vehicle type is required');
    if (!form.current_location.trim()) return setFormError('Current location is required');
    if (!cap || cap <= 0) return setFormError('Capacity must be a positive number');

    setSaving(true);
    try {
      if (editing) {
        const updated = await fleetApi.updateVehicle(editing.id, {
          capacity_kg: cap,
          current_location: form.current_location,
          maintenance_status: form.maintenance_status,
        });
        setVehicles(prev => prev.map(v => v.id === editing.id ? { ...v, ...updated, type: v.type } : v));
        toast({ title: 'Vehicle updated', variant: 'success' });
      } else {
        await fleetApi.createVehicle({ vehicle_number: form.vehicle_number, type_id: form.type_id, capacity_kg: cap, current_location: form.current_location, maintenance_status: form.maintenance_status });
        const { vehicles } = await fleetApi.getVehicles();
        setVehicles(vehicles);
        toast({ title: 'Vehicle added', variant: 'success' });
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6 mx-auto" style={{ maxWidth: 1400, fontFamily: body }}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
            {(['all', 'active', 'maintenance', 'retired'] as const).map(v => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize',
                  statusFilter === v ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {v === 'all' ? 'All' : v === 'maintenance' ? 'Maintenance' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search by number, type, location…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
        </div>
        <Button onClick={openAdd} style={{ background: C.accent, color: C.accentText, fontWeight: 600 }}>
          <Plus className="h-4 w-4" /> Add vehicle
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Truck} title="No vehicles found" description="Add your first vehicle to start dispatching." action={{ label: 'Add vehicle', onClick: openAdd }} />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-foreground">Vehicle</TableHead>
                <TableHead className="font-semibold text-foreground">Type</TableHead>
                <TableHead className="font-semibold text-foreground">Capacity</TableHead>
                <TableHead className="font-semibold text-foreground">Location</TableHead>
                <TableHead className="font-semibold text-foreground">Assigned</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.vehicle_number}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.type?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{Number(v.capacity_kg).toLocaleString()} kg</TableCell>
                  <TableCell className="text-sm">{v.current_location}</TableCell>
                  <TableCell className="text-sm">{assignedDriverByVehicle[v.id] ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={v.maintenance_status} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit vehicle' : 'Add vehicle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {formError && <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{formError}</p>}
            {!editing && (
              <div className="space-y-1.5">
                <Label>Vehicle number</Label>
                <Input placeholder="e.g. MH-12-AB-1234" value={form.vehicle_number} onChange={e => setForm(f => ({ ...f, vehicle_number: e.target.value }))} />
              </div>
            )}
            {!editing && (
              <div className="space-y-1.5">
                <Label>Vehicle type</Label>
                <Select value={form.type_id} onValueChange={v => setForm(f => ({ ...f, type_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPE_OPTIONS.filter(t => t.id).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Capacity (kg)</Label>
              <Input type="number" placeholder="e.g. 5000" value={form.capacity_kg} onChange={e => setForm(f => ({ ...f, capacity_kg: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Current location</Label>
              <Input placeholder="e.g. Bhiwandi Depot" value={form.current_location} onChange={e => setForm(f => ({ ...f, current_location: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.maintenance_status} onValueChange={v => setForm(f => ({ ...f, maintenance_status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">In maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Add vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
