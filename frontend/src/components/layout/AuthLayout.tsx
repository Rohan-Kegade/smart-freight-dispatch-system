import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

const mono = "'IBM Plex Mono', monospace";
const heading = "'IBM Plex Mono', monospace";

export default function AuthLayout() {
  const { colors: C } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>

      {/* ── Brand panel ──────────────────────────────────────── */}
      <div
        className="ld-brand-panel"
        style={{
          flex: '0 0 46%',
          position: 'relative',
          overflow: 'hidden',
          borderRight: `1px solid ${C.border}`,
          background: C.surface,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px 52px',
          minWidth: 0,
        }}
      >
        {/* Accent glow */}
        <div style={{ position: 'absolute', top: -160, left: -100, width: 520, height: 520, background: `radial-gradient(circle, ${C.accentDim}, transparent 68%)`, pointerEvents: 'none' }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize: '54px 54px',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 30% 20%, #000, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 90% 80% at 30% 20%, #000, transparent 80%)',
        }} />

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: C.text, position: 'relative', zIndex: 2, width: 'fit-content' }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${C.accentSoft}` }}>
            <span style={{ width: 10, height: 10, background: '#071019', transform: 'rotate(45deg)', borderRadius: 1 }} />
          </span>
          <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em' }}>Lodestar</span>
        </Link>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 440 }}>
          <h1 style={{ fontFamily: heading, fontWeight: 600, fontSize: 40, lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 18px' }}>
            Dispatch, decided in seconds.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: C.muted, margin: '0 0 30px' }}>
            Type a request in plain language and get a ranked, explained shortlist of the right vehicle, driver and time slot — with no invalid matches, ever.
          </p>
          {/* Mini match card */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '38%', height: 2, background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`, animation: 'lda-sweep 3.4s ease-in-out infinite' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: mono, fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.success }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.success }} />
                Best match
              </span>
              <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 16 }}>
                94<span style={{ fontSize: 10, color: C.faint }}>/100</span>
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>TN-09 CG 4521 · Reefer 6t</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>R. Kumar · 12 km deadhead · on-time</div>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 22, fontFamily: mono, fontSize: 11.5, color: C.faint }}>
          <span>✓ Role-based access</span>
          <span>✓ Deterministic core</span>
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────────── */}
      <div style={{ flex: '1 1 54%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @keyframes lda-sweep { 0%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }
        @media (max-width: 768px) { .ld-brand-panel { display: none !important; } }
        .lda-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 9px;
          border: 1px solid ${C.border};
          background: ${C.surface};
          color: ${C.text};
          font-size: 14.5px;
          font-family: 'IBM Plex Mono', monospace;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }
        .lda-input:focus {
          border-color: ${C.accent};
          box-shadow: 0 0 0 3px ${C.accentDim};
        }
        .lda-input::placeholder { color: ${C.faint}; }
        .lda-input-pw { padding-right: 62px; }
      `}</style>
    </div>
  );
}
