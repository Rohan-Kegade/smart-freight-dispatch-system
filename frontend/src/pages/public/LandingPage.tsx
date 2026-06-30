import { Link } from 'react-router-dom';
import { Truck, Zap, Brain, MapPin, ShieldCheck, BarChart3, ArrowRight, CheckCircle, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATS = [
  { value: '< 30 s', label: 'Average dispatch time' },
  { value: '99.8%', label: 'Match accuracy' },
  { value: '0', label: 'Manual data entry' },
  { value: '3×', label: 'Faster than spreadsheets' },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Intake',
    description: 'Describe your shipment in plain language. The LLM parser extracts pickup, drop, weight, cargo type, and deadline automatically.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Zap,
    title: 'Instant Matching Engine',
    description: 'A deterministic algorithm filters every vehicle and driver by capacity, license, availability, and working-hour limits in milliseconds.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: MapPin,
    title: 'Real-World ETAs',
    description: 'Deadhead distance and pickup ETA are calculated from live road data via Google Maps, not straight-line guesses.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Ranked Recommendations',
    description: 'Matches are scored by proximity, cost, overtime risk, and idle time. Your best option is always at the top.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Star,
    title: 'AI Explanations',
    description: 'Each recommendation comes with a plain-English reason — the LLM explains the algorithm\'s output, not the other way around.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description: 'Dispatchers handle the job flow. Admins manage the fleet. Permissions enforced at every layer.',
    color: 'bg-slate-100 text-slate-600',
  },
];

const steps = [
  { step: '01', title: 'Describe the shipment', body: 'Type a free-text request — cargo type, weight, pickup, drop, deadline.', icon: Brain },
  { step: '02', title: 'Review parsed details', body: 'The system extracts structured data. You confirm before proceeding.', icon: CheckCircle },
  { step: '03', title: 'See ranked matches', body: 'Top vehicle–driver pairs scored by distance, cost, and availability.', icon: BarChart3 },
  { step: '04', title: 'Confirm with one click', body: 'Booking created, driver notified via SMS, availability updated instantly.', icon: Clock },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-transparent pointer-events-none" />
        {/* subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(221 83% 53%) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-semibold mb-6 tracking-wide uppercase">
            <Zap className="h-3 w-3" />
            Intelligent freight dispatch
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 text-foreground leading-[1.1]">
            Find the right vehicle in{' '}
            <span className="text-primary">seconds,</span>
            {' '}not minutes.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            FreightDispatch uses a deterministic matching engine and AI to surface the
            best vehicle–driver combination for every ad-hoc cargo request.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="gap-2 px-6">
              <Link to="/signup">Start free trial <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-6">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Four steps from request to confirmed booking.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[55%] w-full h-px bg-border" />
                )}
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 relative z-10 border border-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-bold text-primary/40 mb-1.5 tracking-widest">{s.step}</p>
                <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/20 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything your team needs</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Built for freight companies that move fast and can't afford mismatches.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-background rounded-xl border p-5 hover:border-primary/30 hover:shadow-sm transition-all">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design philosophy */}
      <section className="py-20 px-4 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-xs font-semibold mb-6">
            <CheckCircle className="h-3 w-3" /> Trustworthy by design
          </div>
          <h2 className="text-3xl font-bold mb-4">Algorithm core. AI augmentation.</h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            The matching engine is deterministic and fully testable. The LLM is used only at the
            edges — to parse free-text input and explain the algorithm's ranked output in plain
            English.{' '}
            <strong className="text-foreground">The AI never decides who gets assigned.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {[
              'Zero invalid matches (hard constraints enforced)',
              'Ranked top-3 recommendations always returned',
              'Every decision explainable in plain English',
            ].map(t => (
              <div key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-sidebar text-sidebar-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Truck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to dispatch smarter?</h2>
          <p className="text-sidebar-foreground/60 mb-8 leading-relaxed">
            Join freight teams that use FreightDispatch to eliminate manual matching errors.
          </p>
          <Button size="lg" asChild className="gap-2 px-6">
            <Link to="/signup">Get started for free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
