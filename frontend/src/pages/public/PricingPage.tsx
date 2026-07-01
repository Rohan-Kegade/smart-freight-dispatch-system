import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';

const plans = [
  {
    name: 'Starter',
    price: '₹4,999',
    period: '/month',
    description: 'Perfect for small fleets and single-depot operations.',
    features: [
      'Up to 25 vehicles',
      'Up to 20 drivers',
      'Unlimited dispatch requests',
      'AI matching & explanations',
      'Google Maps ETA',
      'SMS driver notifications',
      '2 dispatcher seats',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₹12,999',
    period: '/month',
    description: 'For growing freight companies with multiple depots.',
    features: [
      'Up to 100 vehicles',
      'Up to 75 drivers',
      'Unlimited dispatch requests',
      'AI matching & explanations',
      'Google Maps ETA',
      'SMS driver notifications',
      '10 dispatcher seats',
      'Knowledge assistant (RAG)',
      'Priority support',
      'Advanced analytics',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large fleets, custom integrations, and SLA requirements.',
    features: [
      'Unlimited vehicles & drivers',
      'Unlimited seats',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'SSO / SAML',
      'On-premise deployment option',
      '24/7 phone support',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <PageHeader title="Simple, transparent pricing" description="Start free. Scale as you grow. No hidden fees." className="justify-center flex-col items-center" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map(plan => (
            <Card key={plan.name} className={plan.highlighted ? 'border-primary shadow-lg relative' : ''}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3">Most popular</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'} asChild>
                  <Link to="/signup">{plan.cta} {plan.cta !== 'Contact sales' && <ArrowRight className="h-4 w-4" />}</Link>
                </Button>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>All plans include a 14-day free trial. No credit card required.</p>
          <p className="mt-2">
            Questions?{' '}
            <a href="mailto:hello@freightdispatch.in" className="text-primary hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}
