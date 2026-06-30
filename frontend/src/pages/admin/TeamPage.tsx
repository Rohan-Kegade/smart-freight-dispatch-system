import { Mail, Shield, UserCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { Separator } from '@/components/ui/separator';

const MOCK_TEAM = [
  { id: '1', name: 'Admin User', email: 'admin@freight.co', role: 'admin', status: 'active', joinedAt: '2025-01-15' },
  { id: '2', name: 'Dispatcher One', email: 'dispatch1@freight.co', role: 'dispatcher', status: 'active', joinedAt: '2025-02-20' },
  { id: '3', name: 'Dispatcher Two', email: 'dispatch2@freight.co', role: 'dispatcher', status: 'active', joinedAt: '2025-03-10' },
];

export default function TeamPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Team"
        description="Manage who has access to your FreightDispatch workspace."
        actions={
          <Button>
            <UserPlus className="h-4 w-4" /> Invite member
          </Button>
        }
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>{MOCK_TEAM.length} people in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {MOCK_TEAM.map(member => (
                <div key={member.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {member.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {member.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <UserCircle className="h-3 w-3 mr-1" />}
                      {member.role}
                    </Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Invite a team member</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dispatchers can submit requests and view bookings. Admins can manage the fleet and team.
              </p>
            </div>
            <Button variant="outline" size="sm"><UserPlus className="h-4 w-4" /> Send invite</Button>
          </CardContent>
        </Card>
      </div>

      <Separator />
      <div className="text-xs text-muted-foreground">
        <p>Team management API is coming soon. Currently showing sample data.</p>
      </div>
    </div>
  );
}
