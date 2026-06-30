import { Link } from 'react-router-dom';
import { Truck, Zap, Brain, MapPin, ShieldCheck, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Intake',
    description: 'Describe your shipment in plain language. Our LLM parser extracts pickup, drop, weight, cargo type, and deadline automatically.',
  },
  {
    icon: Zap,
    title: 'Instant Matching Engine',
    description: 'A deterministic algorithm filters every vehicle and driver by capacity, license, availability, and working-hour limits in milliseconds.',
  },
  {
    icon: MapPin,
    title: 'Real-World ETA via Google Maps',
    description: 'Deadhead distance and pickup ETA are calculated from live road data, not straight-line guesses.',
  },
  {
    icon: BarChart3,
    title: 'Ranked Recommendations',
    description: 'Matches are scored by proximity, cost, overtime risk, and idle time. Your best option is always at the top.',
  },
  {
    icon: Brain,
    title: 'AI Explanations',
    description: 'Each recommendation comes with a plain-English reason — the LLM explains the algorithm\'s output, not the other way around.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description: 'Dispatchers handle the job flow. Admins manage the fleet. Permissions enforced at every layer.',
  },
];

const steps = [
  { step: '01', title: 'Describe the shipment', body: 'Type a free-text request — cargo type, weight, pickup, drop, deadline.' },
  { step: '02', title: 'Review AI-parsed details', body: 'The system extracts structured data. You confirm before proceeding.' },
  { step: '03', title: 'See ranked matches', body: 'Top vehicle–driver pairs scored by distance, cost, and driver availability.' },
  { step: '04', title: 'Confirm with one click', body: 'Booking created, driver notified via SMS, availability updated instantly.' },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            Intelligent freight dispatch, built for teams
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Find the right vehicle in{' '}
            <span className="text-primary">seconds,</span>{' '}
            not minutes.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            FreightDispatch uses a deterministic matching engine and AI to surface the best vehicle–driver
            combination for every ad-hoc cargo request — automatically enforcing capacity, licensing, and
            availability rules.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">Start free trial <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Four steps from request to confirmed booking.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map(s => (
              <div key={s.step} className="text-center">
                <div className="text-4xl font-black text-primary/20 mb-3">{s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything your team needs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for freight companies that move fast and can't afford mismatches.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <Card key={f.title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Design philosophy callout */}
      <section className="py-20 px-4 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Algorithm core. AI augmentation.</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            The matching engine is deterministic and fully testable. The LLM is used only at the edges —
            to parse free-text input and explain the algorithm's ranked output in plain English.
            <strong className="text-foreground"> The AI never decides who gets assigned.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-muted-foreground">
            {['Zero invalid matches (hard constraints enforced)', 'Ranked top-3 recommendations always returned', 'Every decision explainable in plain English'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <Truck className="h-10 w-10 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to dispatch smarter?</h2>
          <p className="opacity-80 mb-8">Join freight teams that use FreightDispatch to eliminate manual matching errors.</p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signup">Get started for free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
