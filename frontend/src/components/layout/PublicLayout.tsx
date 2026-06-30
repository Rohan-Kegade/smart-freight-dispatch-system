import { Link, Outlet } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Shared logomark ─────────────────────────────────────────── */
function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #1e40af 100%)',
        boxShadow: '0 2px 12px rgba(37,99,235,0.35)',
      }}
    >
      {/* Custom route-dispatch icon */}
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 20 20" fill="none">
        {/* Origin dot */}
        <circle cx="4" cy="14.5" r="2.2" fill="white" fillOpacity="0.55" />
        {/* Curved route arc */}
        <path
          d="M5.8 13.2 C7 9 13 7 14.5 7.5"
          stroke="white"
          strokeOpacity="0.38"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2.2 1.6"
          fill="none"
        />
        {/* Destination dot — brighter, larger */}
        <circle cx="16" cy="6" r="2.6" fill="white" />
        {/* Vehicle on route */}
        <circle cx="10.2" cy="9.8" r="1.6" fill="white" fillOpacity="0.88" />
      </svg>
    </div>
  );
}

function LogoType({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={
        size === 'sm'
          ? 'text-[13px] font-black tracking-tight'
          : 'text-[15px] font-black tracking-tight'
      }
    >
      <span className="text-white">Freight</span>
      <span className="text-amber-400">Dispatch</span>
    </span>
  );
}

/* ─── Nav link columns for footer ────────────────────────────── */
const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  },
  {
    heading: 'Resources',
    links: ['Documentation', 'API Reference', 'Status', 'Blog'],
  },
  {
    heading: 'Company',
    links: ['About', 'Privacy policy', 'Terms of service', 'Contact'],
  },
];

/* ─── Component ──────────────────────────────────────────────── */
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ══ NAVBAR ═══════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#07091a]/92 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between gap-8">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <LogoMark size={36} />
            <div className="flex flex-col leading-none gap-0.5">
              <LogoType size="md" />
              <span className="text-[9.5px] text-white/28 uppercase tracking-[0.16em] font-semibold">
                Intelligent Dispatch
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium flex-1 justify-center">
            {[
              { label: 'Features',    href: '/#features' },
              { label: 'How it works', href: '/#how-it-works' },
              { label: 'Pricing',     href: '/pricing' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="text-white/48 hover:text-white transition-colors duration-150 whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              asChild
              className="text-white/55 hover:text-white hover:bg-white/[0.07] text-sm font-medium"
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 h-9 gap-1.5"
            >
              <Link to="/signup">
                Get started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer className="bg-[#07091a] border-t border-white/[0.06]">

        {/* Main grid */}
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-10 grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand column — spans 2 of 5 */}
          <div className="col-span-2 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-3 w-fit">
              <LogoMark size={38} />
              <LogoType size="md" />
            </Link>

            <p className="text-sm text-white/50 leading-relaxed max-w-[230px]">
              Intelligent freight dispatch for teams that move cargo fast and
              can't afford mismatches.
            </p>

            {/* System status */}
            <div className="inline-flex w-fit items-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/[0.15] rounded-full px-3.5 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">All systems operational</span>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(col => (
            <div key={col.heading} className="flex flex-col gap-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.16em]">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[13px] text-white/55 hover:text-white transition-colors duration-150"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="border-t border-white/[0.05] px-6 py-5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[12px] text-white/35">
              © 2026 FreightDispatch, Inc. All rights reserved.
            </p>
            <p className="text-[12px] text-white/28 italic">
              Built for logistics teams that can't afford mismatches.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
