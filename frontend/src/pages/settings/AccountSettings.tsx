import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
});
const passwordSchema = z.object({
  current: z.string().min(1, 'Current password is required'),
  next: z.string().min(8, 'New password must be at least 8 characters'),
  confirm: z.string(),
}).refine(d => d.next === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const initials = user?.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) ?? '??';

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function saveProfile(_data: ProfileForm) {
    setProfileSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setProfileSaving(false);
    toast({ title: 'Profile updated', variant: 'success' });
  }

  async function savePassword(_data: PasswordForm) {
    setPasswordSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setPasswordSaving(false);
    passwordForm.reset();
    toast({ title: 'Password updated', variant: 'success' });
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Avatar */}
      <Card>
        <CardHeader><CardTitle>Profile picture</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">Upload photo</Button>
            <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or GIF · Max 2 MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Personal information</CardTitle><CardDescription>Update your name and email address.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input {...profileForm.register('name')} />
              {profileForm.formState.errors.name && <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email address</Label>
              <Input type="email" {...profileForm.register('email')} />
              {profileForm.formState.errors.email && <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={profileSaving}>
                {profileSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserCircle className="h-3.5 w-3.5" /> Role: <span className="capitalize font-medium text-foreground">{user?.role}</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Password */}
      <Card>
        <CardHeader><CardTitle>Change password</CardTitle><CardDescription>Use a strong password you don't use elsewhere.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input type="password" {...passwordForm.register('current')} />
              {passwordForm.formState.errors.current && <p className="text-xs text-destructive">{passwordForm.formState.errors.current.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" placeholder="Min. 8 characters" {...passwordForm.register('next')} />
              {passwordForm.formState.errors.next && <p className="text-xs text-destructive">{passwordForm.formState.errors.next.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm new password</Label>
              <Input type="password" {...passwordForm.register('confirm')} />
              {passwordForm.formState.errors.confirm && <p className="text-xs text-destructive">{passwordForm.formState.errors.confirm.message}</p>}
            </div>
            <Button type="submit" size="sm" disabled={passwordSaving}>
              {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />} Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
