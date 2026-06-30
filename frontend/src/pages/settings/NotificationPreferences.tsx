import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/hooks/use-toast';

const PREFS = [
  { id: 'booking_confirmed', label: 'Booking confirmed', description: 'When a dispatch booking is created' },
  { id: 'booking_cancelled', label: 'Booking cancelled', description: 'When a booking is cancelled or fails' },
  { id: 'driver_unavailable', label: 'Driver unavailable', description: 'When a driver goes on leave or is over hours' },
  { id: 'vehicle_maintenance', label: 'Vehicle maintenance alert', description: 'When a vehicle status changes to maintenance' },
  { id: 'new_request', label: 'New dispatch request', description: 'When a new request is submitted (admin only)' },
];

export default function NotificationPreferences() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map(p => [p.id, true])),
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast({ title: 'Notification preferences saved', variant: 'success' });
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Notification preferences" description="Choose which events you want to be notified about." />

      <Card>
        <CardHeader>
          <CardTitle>In-app notifications</CardTitle>
          <CardDescription>These appear in the notification bell in the sidebar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {PREFS.map(pref => (
              <div key={pref.id} className="flex items-center justify-between py-4">
                <div>
                  <Label htmlFor={pref.id} className="text-sm font-medium cursor-pointer">{pref.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                </div>
                <Switch
                  id={pref.id}
                  checked={prefs[pref.id]}
                  onCheckedChange={v => setPrefs(p => ({ ...p, [pref.id]: v }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <CardDescription>Daily summaries and critical alerts sent to your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {[
              { id: 'email_daily', label: 'Daily booking summary', description: 'End-of-day summary of all confirmed bookings' },
              { id: 'email_critical', label: 'Critical alerts', description: 'Immediate email for cancellations or conflicts' },
            ].map(pref => (
              <div key={pref.id} className="flex items-center justify-between py-4">
                <div>
                  <Label htmlFor={pref.id} className="text-sm font-medium cursor-pointer">{pref.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                </div>
                <Switch id={pref.id} defaultChecked={pref.id === 'email_critical'} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save preferences
      </Button>
    </div>
  );
}
