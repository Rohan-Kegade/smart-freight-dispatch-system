import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Pencil, ShieldCheck } from 'lucide-react';
import { usersApi, fleetApi, ApiError } from '@/api';
import type { AdminUser } from '@/api/users';
import type { Driver, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'system_admin', label: 'System Admin' },
  { value: 'fleet_manager', label: 'Fleet Manager' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'driver', label: 'Driver' },
];

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
  driverId: string;
}

const emptyForm: UserForm = { name: '', email: '', password: '', role: 'dispatcher', driverId: '' };

export default function UsersPage() {
  const { colors: C } = useTheme();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    Promise.all([usersApi.list(), fleetApi.getDrivers()])
      .then(([{ users }, { drivers }]) => { setUsers(users); setDrivers(drivers); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unlinkedDrivers = useMemo(() => drivers.filter(d => !d.user_id), [drivers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => !q || [u.name, u.email, u.role].some(s => s?.toLowerCase().includes(q)));
  }, [users, search]);

  function openAdd() { setEditing(null); setForm(emptyForm); setFormError(''); setDialogOpen(true); }
  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, driverId: u.driver_id ?? '' });
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.name.trim()) return setFormError('Name is required');
    if (!editing && !form.email.trim()) return setFormError('Email is required');
    if (!editing && !form.password.trim()) return setFormError('Password is required');
    if (form.role === 'driver' && !editing && !form.driverId) return setFormError('Select a driver to link this login to');

    setSaving(true);
    try {
      if (editing) {
        await usersApi.update(editing.id, { name: form.name, role: form.role });
        setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, name: form.name, role: form.role } : u));
        toast({ title: 'User updated', variant: 'success' });
      } else {
        await usersApi.create({
          name: form.name, email: form.email, password: form.password, role: form.role,
          driverId: form.role === 'driver' ? form.driverId : undefined,
        });
        const { users } = await usersApi.list();
        setUsers(users);
        toast({ title: 'User created', variant: 'success' });
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: AdminUser) {
    try {
      await usersApi.update(u.id, { is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x));
      toast({ title: u.is_active ? 'User disabled' : 'User enabled', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof ApiError ? err.message : 'Failed to update user.', variant: 'destructive' });
    }
  }

  return (
    <div className="p-6 space-y-6 mx-auto" style={{ maxWidth: 1400 }}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search by name, email, role…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <Button onClick={openAdd} style={{ background: C.accent, color: C.accentText, fontWeight: 600 }}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No users found" description="Provision your first user to grant portal access." action={{ label: 'Add user', onClick: openAdd }} />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Email</TableHead>
                <TableHead className="font-semibold text-foreground">Role</TableHead>
                <TableHead className="font-semibold text-foreground">Linked driver</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{u.role.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-sm">{u.driver_id ? drivers.find(d => d.id === u.driver_id)?.name ?? '—' : '—'}</TableCell>
                  <TableCell>
                    {u.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Disabled</Badge>}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(u)}>
                      {u.is_active ? 'Disable' : 'Enable'}
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
          <DialogHeader><DialogTitle>{editing ? 'Edit user' : 'Add user'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {formError && <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{formError}</p>}
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            {!editing && (
              <>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Temporary password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as Role }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!editing && form.role === 'driver' && (
              <div className="space-y-1.5">
                <Label>Link to driver roster record</Label>
                <Select value={form.driverId} onValueChange={v => setForm(f => ({ ...f, driverId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select driver…" /></SelectTrigger>
                  <SelectContent>
                    {unlinkedDrivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.phone})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Add user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
