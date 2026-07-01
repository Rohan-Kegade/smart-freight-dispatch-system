import { CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PLAN_FEATURES = [
  'Up to 25 vehicles',
  'Up to 20 drivers',
  'Unlimited dispatch requests',
  'AI matching & explanations',
  'SMS driver notifications',
  '2 dispatcher seats',
];

const INVOICES = [
  { id: 'INV-001', date: '2026-06-01', amount: '₹4,999', status: 'paid' },
  { id: 'INV-002', date: '2026-05-01', amount: '₹4,999', status: 'paid' },
  { id: 'INV-003', date: '2026-04-01', amount: '₹4,999', status: 'paid' },
];

export default function BillingPage() {
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Current plan */}
      <Card className="border-primary/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Starter plan</CardTitle>
            <CardDescription>Billed monthly · Next renewal July 1, 2026</CardDescription>
          </div>
          <Badge variant="success">Active</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">₹4,999</span>
            <span className="text-muted-foreground text-sm mb-1">/month</span>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {PLAN_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-1.5 text-sm">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{f}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" asChild><Link to="/pricing">Upgrade plan <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">Cancel subscription</Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader><CardTitle className="text-base">Payment method</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/27</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Invoice history */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invoice history</CardTitle><CardDescription>Download past invoices for your records.</CardDescription></CardHeader>
        <CardContent>
          <div className="divide-y">
            {INVOICES.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{inv.id}</p>
                  <p className="text-xs text-muted-foreground">{inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{inv.amount}</span>
                  <Badge variant="success" className="text-[10px]">Paid</Badge>
                  <Button variant="ghost" size="sm" className="text-xs">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
