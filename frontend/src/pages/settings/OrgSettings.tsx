import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  orgName: z.string().min(2, 'Organisation name is required'),
  primaryCity: z.string().min(2, 'City is required'),
  timezone: z.string().min(1),
  currency: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function OrgSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { orgName: 'Acme Freight Ltd.', primaryCity: 'Mumbai', timezone: 'Asia/Kolkata', currency: 'INR' },
  });

  async function onSubmit(_d: FormData) {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast({ title: 'Organisation settings saved', variant: 'success' });
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Organisation settings" description="Configure your company profile and regional preferences." />

      <Card>
        <CardHeader><CardTitle>Company details</CardTitle><CardDescription>This appears on reports and notifications.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Organisation name</Label>
              <Input {...register('orgName')} />
              {errors.orgName && <p className="text-xs text-destructive">{errors.orgName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Primary depot city</Label>
              <Input placeholder="Mumbai" {...register('primaryCity')} />
              {errors.primaryCity && <p className="text-xs text-destructive">{errors.primaryCity.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select defaultValue="Asia/Kolkata" onValueChange={v => setValue('timezone', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select defaultValue="INR" onValueChange={v => setValue('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="AED">AED (د.إ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
