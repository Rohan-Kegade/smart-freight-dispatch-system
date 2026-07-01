import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { hexToRgba } from '@/lib/theme';

const mono = "'IBM Plex Mono', monospace";
const heading = "'IBM Plex Mono', monospace";
const bodyFont = "'IBM Plex Mono', monospace";

function LogoIcon({ size = 26 }: { size?: number }) {
  const { colors: C } = useTheme();
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 7,
        background: C.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 14px ${C.accentSoft}`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: size * 0.346,
          height: size * 0.346,
          background: C.accentText,
          transform: 'rotate(45deg)',
          borderRadius: 1,
        }}
      />
    </span>
  );
}

const FOOTER_LINKS = [
  { label: 'How it works', href: '/#how' },
  { label: 'Matching engine', href: '/#engine' },
  { label: 'Features', href: '/#features' },
  { label: 'Get started', href: '/#cta' },
];

const NAV_LINKS = [
  { label: 'Why Lodestar', href: '/#problem' },
  { label: 'How it works', href: '/#how' },
  { label: 'Matching engine', href: '/#engine' },
  { label: 'Features', href: '/#features' },
];

export default function PublicLayout() {
  const { colors: C } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: C.bg,
        color: C.text,
        fontFamily: bodyFont,
      }}
    >
      {/* ══ NAVBAR ═══════════════════════════════════════════ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: hexToRgba(C.bg, 0.82),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 32px',
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          {/* Brand */}
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: C.text }}
          >
            <LogoIcon size={26} />
            <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em' }}>
              Lodestar
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                style={{ color: C.muted, textDecoration: 'none', fontSize: 14, transition: 'color .15s' }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link
              to="/login"
              style={{ color: C.text, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              style={{
                background: C.accent,
                color: C.accentText,
                fontWeight: 600,
                fontSize: 14,
                padding: '10px 18px',
                borderRadius: 8,
                textDecoration: 'none',
                boxShadow: `0 4px 16px ${C.accentDim}`,
              }}
            >
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer style={{ padding: '44px 0', borderTop: `1px solid ${C.border}`, background: C.bg }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <LogoIcon size={24} />
            <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 16, color: C.text }}>Lodestar</span>
          </div>
          <div style={{ display: 'flex', gap: 26, fontSize: 13.5 }}>
            {FOOTER_LINKS.map(l => (
              <a key={l.label} href={l.href} style={{ color: C.muted, textDecoration: 'none' }}>
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, color: C.faint }}>
            © 2026 Lodestar Freight Systems
          </div>
        </div>
      </footer>

      <style>{`
        header a:hover { color: ${C.text} !important; }
        footer a:hover { color: ${C.text} !important; }
        header nav a { transition: color .15s; }
      `}</style>
    </div>
  );
}
