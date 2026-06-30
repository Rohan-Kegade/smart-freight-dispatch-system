import { Link } from 'react-router-dom';
import {
  Truck, Zap, Brain, MapPin, ShieldCheck, BarChart3,
  ArrowRight, CheckCircle, Navigation, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ─── Data ───────────────────────────────────────────────────── */

const STATS = [
  { value: '< 30 s', label: 'Avg. dispatch time' },
  { value: '99.8%', label: 'Match accuracy' },
  { value: '0', label: 'Manual data entry' },
  { value: '3×', label: 'Faster than spreadsheets' },
];

const CARGO_TAGS = [
  { label: 'Electronics', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { label: 'Steel Beams', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  { label: 'FMCG', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { label: 'Pharma', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { label: 'Refrigerated', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Machinery', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { label: 'Hazmat', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { label: 'Construction', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { label: 'Automotive', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { label: 'Textiles', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Intake',
    description: 'Describe your shipment in plain language. The LLM parser extracts pickup, drop, weight, cargo type, and deadline — no forms.',
    tag: 'NLP',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Zap,
    title: 'Instant Matching Engine',
    description: 'Deterministic algorithm filters every vehicle and driver by capacity, license, availability, and working-hour limits in milliseconds.',
    tag: 'Algorithm',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: MapPin,
    title: 'Real-World ETAs',
    description: 'Deadhead distance and pickup ETA calculated from live Google Maps road data — not straight-line approximations.',
    tag: 'Google Maps',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: BarChart3,
    title: 'Ranked Recommendations',
    description: 'Top-3 matches scored by proximity, cost, overtime risk, and idle time. Your best option is always at the top.',
    tag: 'Scoring',
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: MessageSquare,
    title: 'AI Explanations',
    description: 'Plain-English reasons for every recommendation. The LLM explains the algorithm output — not the other way around.',
    tag: 'Explainability',
    color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description: 'Dispatchers handle the job flow. Admins manage the fleet. Hard permissions enforced at every API layer.',
    tag: 'RBAC',
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  },
];

const steps = [
  { n: '01', title: 'Describe the shipment', body: 'Type a free-text request — cargo type, weight, pickup, drop, deadline. Like texting a colleague.', icon: MessageSquare },
  { n: '02', title: 'Review parsed details', body: 'AI extracts structured data. Confirm every field before the engine runs — zero ambiguity.', icon: CheckCircle },
  { n: '03', title: 'See ranked matches', body: 'Top vehicle–driver pairs ranked by distance, cost, and availability. Results in under a second.', icon: BarChart3 },
  { n: '04', title: 'Confirm with one click', body: 'Booking confirmed, driver notified by SMS, fleet availability updated in real time.', icon: Navigation },
];

/* ─── Cargo ticker (duplicated for seamless loop) ──────────── */
const TICKER_ITEMS = [...CARGO_TAGS, ...CARGO_TAGS];

/* ─── Component ─────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div>
      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="relative flex items-center justify-center overflow-hidden bg-[#07091a] px-4 py-28 min-h-[92vh]">

        {/* Blueprint grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,133,255,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,133,255,0.6) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Radial blue glow from top */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,rgba(37,99,235,0.22),transparent)]" />

        {/* Amber warm glow bottom-left */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_60%_60%_at_0%_100%,rgba(245,158,11,0.07),transparent)]" />

        <div className="relative max-w-5xl mx-auto w-full text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] mb-8">
            <Truck className="h-3.5 w-3.5" />
            Intelligent Freight Dispatch
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[5.5rem] font-black text-white leading-[1.0] tracking-tight mb-6">
            Right vehicle,<br />
            right driver,{' '}
            <span
              className="relative"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              30 seconds.
            </span>
          </h1>

          <p className="text-white/45 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Describe your shipment in plain language. The AI parses it, the engine
            matches it, your dispatcher confirms it. No spreadsheets. No calls.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Button
              size="lg"
              asChild
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2 px-8 h-12"
            >
              <Link to="/signup">Start free trial <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-white/15 text-white/75 hover:bg-white/[0.07] hover:text-white hover:border-white/25 px-8 h-12"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          {/* ── Dispatch preview card ─────────────────────────── */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/[0.035] border border-white/[0.09] rounded-2xl p-5 backdrop-blur-sm text-left shadow-2xl shadow-black/40">

              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-[0.14em] font-semibold">Live dispatch</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full px-2.5 py-0.5 font-bold tracking-wide">
                  ✓ Matched in 0.3 s
                </span>
              </div>

              {/* Route track */}
              <div className="relative flex items-center gap-3 mb-5">
                {/* From */}
                <div className="min-w-[128px] text-right">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.14em] mb-0.5">Pickup</p>
                  <p className="text-sm font-bold text-white leading-tight">Bhiwandi Depot</p>
                  <p className="text-[11px] text-white/40 mt-0.5">5,000 kg · Electronics</p>
                </div>

                {/* Animated route line */}
                <div className="flex-1 relative h-9">
                  {/* Dashed path */}
                  <div className="absolute top-1/2 left-2.5 right-2.5 border-t-2 border-dashed border-white/[0.12] -translate-y-1/2" />
                  {/* Origin dot */}
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20 z-10" />
                  {/* Animated truck */}
                  <div className="truck-animate z-20">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border border-primary/50">
                      <Truck className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  {/* Destination dot */}
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-blue-400 ring-4 ring-blue-400/20 z-10" />
                </div>

                {/* To */}
                <div className="min-w-[128px]">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.14em] mb-0.5">Drop</p>
                  <p className="text-sm font-bold text-white leading-tight">Andheri East</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Deadline 3:00 PM</p>
                </div>
              </div>

              {/* Match stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Vehicle',  value: 'MH-12-AB-1234', hi: false },
                  { label: 'Driver',   value: 'Ramesh Kumar',  hi: false },
                  { label: 'ETA',      value: '1 h 45 m',     hi: true  },
                  { label: 'Distance', value: '58 km',         hi: false },
                ].map(d => (
                  <div
                    key={d.label}
                    className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2.5"
                  >
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.12em] mb-1">{d.label}</p>
                    <p className={cn('text-[11px] font-bold truncate', d.hi ? 'text-amber-400' : 'text-white')}>
                      {d.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Score bar */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] text-white/30">
                  Match score
                  <span className="ml-2 text-white/70 font-semibold">98 / 100</span>
                </p>
                <div className="flex-1 mx-4 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-amber-500 to-blue-500" />
                </div>
                <p className="text-[10px] text-white/30">Best match #1 of 3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#07091a] to-transparent pointer-events-none" />
      </section>

      {/* ══ CARGO TICKER ════════════════════════════════════════ */}
      <div className="bg-[#07091a] border-b border-white/[0.07] py-4 overflow-hidden">
        <div className="ticker-track gap-3">
          {TICKER_ITEMS.map((t, i) => (
            <span
              key={i}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap mx-1.5',
                t.color,
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ════════════════════════════════════════════════ */}
      <section className="bg-[#07091a] border-b border-white/[0.07]">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.07]">
          {STATS.map(s => (
            <div key={s.label} className="text-center px-6">
              <p className="text-4xl md:text-5xl font-black text-white tracking-tight">{s.value}</p>
              <p className="text-[11px] text-white/35 mt-2 uppercase tracking-[0.1em]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-primary/60 uppercase tracking-[0.15em] mb-3">Process</p>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Four stops, one booking.</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              From raw text request to confirmed dispatch — in under 30 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <div key={s.n} className="relative group">
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[2.1rem] left-[calc(50%+2.5rem)] right-[-calc(50%-2.5rem)] h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center p-5 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                  {/* Icon + step number */}
                  <div className="relative mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/[0.07] transition-colors">
                      <s.icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-primary/40 tracking-[0.15em] mb-1.5">{s.n}</p>
                  <h3 className="font-bold text-sm mb-2">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 bg-muted/20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-primary/60 uppercase tracking-[0.15em] mb-3">Capabilities</p>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Everything your team needs</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Built for freight companies that move fast and can't afford mismatches.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map(f => (
              <div
                key={f.title}
                className="bg-background rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center border', f.color)}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className={cn('text-[9px] font-black uppercase tracking-[0.12em] px-2 py-1 rounded border font-mono', f.color)}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST SECTION ═══════════════════════════════════════ */}
      <section className="py-24 px-4 bg-background border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-border bg-muted/30 p-10 md:p-14 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3.5 py-1.5 text-xs font-bold mb-8">
              <ShieldCheck className="h-3.5 w-3.5" /> Trustworthy by design
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
              Algorithm core.{' '}
              <span className="text-muted-foreground font-medium">AI augmentation.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-2xl mx-auto">
              The matching engine is deterministic and fully testable. The LLM is used only at the
              edges — to parse free-text input and explain the algorithm's ranked output.{' '}
              <strong className="text-foreground font-semibold">The AI never decides who gets assigned.</strong>
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: CheckCircle, text: 'Zero invalid matches — hard constraints enforced', color: 'text-emerald-500' },
                { icon: BarChart3,   text: 'Ranked top-3 recommendations always returned',    color: 'text-blue-500' },
                { icon: Brain,       text: 'Every decision explainable in plain English',      color: 'text-violet-500' },
              ].map(p => (
                <div key={p.text} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-background border border-border">
                  <p.icon className={cn('h-6 w-6', p.color)} />
                  <p className="text-sm text-muted-foreground text-center leading-snug">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 bg-[#07091a] text-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,133,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,133,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(245,158,11,0.08),transparent)]" />

        <div className="relative max-w-2xl mx-auto text-center">
          {/* Truck icon in amber ring */}
          <div className="relative inline-flex mb-8">
            <div className="h-20 w-20 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
              <Truck className="h-9 w-9 text-amber-400" />
            </div>
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#07091a] flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">
            Ready to dispatch smarter?
          </h2>
          <p className="text-white/45 text-lg mb-10 leading-relaxed max-w-md mx-auto">
            Join freight teams that use FreightDispatch to eliminate manual matching errors
            and cut dispatch time by 3×.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2 px-8 h-12"
            >
              <Link to="/signup">Get started for free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-white/15 text-white/70 hover:bg-white/[0.07] hover:text-white hover:border-white/25 px-8 h-12"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          <p className="text-white/25 text-xs mt-8">No credit card required · Free 14-day trial</p>
        </div>
      </section>
    </div>
  );
}
