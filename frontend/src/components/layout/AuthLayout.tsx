import { Link, Outlet } from 'react-router-dom';
import { Truck, CheckCircle } from 'lucide-react';

const FEATURES = [
  'Natural language shipment intake — no forms',
  'Ranked vehicle–driver matches with live ETAs',
  'Role-based access for dispatchers and admins',
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[480px_1fr]">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col bg-sidebar text-sidebar-foreground px-10 py-12 relative overflow-hidden">
        {/* subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--sidebar-foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--sidebar-foreground)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <Link to="/" className="relative flex items-center gap-2.5 z-10">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">FreightDispatch</span>
        </Link>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">Intelligent Dispatch</p>
          <h2 className="text-3xl font-bold leading-snug mb-4 text-sidebar-foreground">
            Find the right vehicle in seconds, not minutes.
          </h2>
          <p className="text-sidebar-foreground/60 text-sm leading-relaxed mb-10">
            A deterministic matching engine backed by AI — for freight teams
            that can't afford mismatches.
          </p>

          <ul className="space-y-4">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle className="h-4.5 w-4.5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-sidebar-foreground/80 leading-snug">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* bottom testimonial */}
        <div className="relative z-10 border-t border-sidebar-border pt-6">
          <p className="text-sm text-sidebar-foreground/70 italic leading-relaxed">
            "We cut dispatch decision time from 8 minutes to under 30 seconds."
          </p>
          <p className="text-xs text-sidebar-foreground/40 mt-2">— Logistics Manager, Mumbai</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col items-center justify-center px-4 py-12 bg-background">
        {/* mobile logo only */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">FreightDispatch</span>
          </Link>
        </div>
        <div className="w-full max-w-[420px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
