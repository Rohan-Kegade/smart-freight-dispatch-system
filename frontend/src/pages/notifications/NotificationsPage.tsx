import { BookOpen, Truck, AlertTriangle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'booking' | 'vehicle' | 'alert';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'booking', title: 'Booking confirmed', body: 'Vehicle MH-12-AB-1234 assigned to Ramesh Kumar for Bhiwandi → Andheri route.', time: '2 min ago', read: false },
  { id: '2', type: 'booking', title: 'Booking completed', body: 'Trip TRK-0042 has been marked as completed by Admin User.', time: '1 hr ago', read: false },
  { id: '3', type: 'vehicle', title: 'Vehicle in maintenance', body: 'MH-14-CD-5678 has been moved to maintenance status.', time: '3 hrs ago', read: true },
  { id: '4', type: 'alert', title: 'Driver overtime risk', body: 'Suresh Nair has 42h logged this week. Approaching 48h legal limit.', time: 'Yesterday', read: true },
  { id: '5', type: 'booking', title: 'Booking cancelled', body: 'Booking for Thane → Pune route was cancelled. Request is available for rebooking.', time: 'Yesterday', read: true },
];

const iconMap = {
  booking: BookOpen,
  vehicle: Truck,
  alert: AlertTriangle,
};

const colorMap = {
  booking: 'text-blue-600 bg-blue-50',
  vehicle: 'text-amber-600 bg-amber-50',
  alert: 'text-red-600 bg-red-50',
};

export default function NotificationsPage() {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        <Button variant="ghost" size="sm" className="text-muted-foreground">Mark all as read</Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {MOCK_NOTIFICATIONS.map(n => {
              const Icon = iconMap[n.type];
              return (
                <div key={n.id} className={cn('flex items-start gap-3 px-6 py-4 transition-colors', !n.read && 'bg-primary/5')}>
                  <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0', colorMap[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.read && <Badge variant="default" className="text-[10px] h-4 px-1.5">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground py-4 flex items-center justify-center gap-1.5">
        <Bell className="h-3.5 w-3.5" />
        Real-time notifications coming with WebSocket support. Currently showing sample data.
      </div>
    </div>
  );
}
