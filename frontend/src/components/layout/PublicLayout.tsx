import { Link, Outlet } from 'react-router-dom';

const accent = '#5aa2f0';
const bg = '#090d13';
const surface = '#11171f';
const border = 'rgba(255,255,255,.08)';
const border2 = 'rgba(255,255,255,.15)';
const textColor = '#eaf0f6';
const muted = '#8a97a6';
const faint = '#5c6875';
const accentDim = 'rgba(90,162,240,0.14)';
const accentSoft = 'rgba(90,162,240,0.22)';

const mono = "'IBM Plex Mono', monospace";
const heading = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', system-ui, sans-serif";

function LogoIcon({ size = 26 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 7,
        background: accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 14px ${accentSoft}`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: size * 0.346,
          height: size * 0.346,
          background: '#071019',
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
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: bg,
        color: textColor,
        fontFamily: bodyFont,
      }}
    >
      {/* ══ NAVBAR ═══════════════════════════════════════════ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: 'rgba(9,13,19,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${border}`,
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
            style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: textColor }}
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
                style={{ color: muted, textDecoration: 'none', fontSize: 14, transition: 'color .15s' }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link
              to="/login"
              style={{ color: textColor, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              style={{
                background: accent,
                color: '#071019',
                fontWeight: 600,
                fontSize: 14,
                padding: '10px 18px',
                borderRadius: 8,
                textDecoration: 'none',
                boxShadow: `0 4px 16px ${accentDim}`,
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
      <footer style={{ padding: '44px 0', borderTop: `1px solid ${border}`, background: bg }}>
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
            <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 16, color: textColor }}>Lodestar</span>
          </div>
          <div style={{ display: 'flex', gap: 26, fontSize: 13.5 }}>
            {FOOTER_LINKS.map(l => (
              <a key={l.label} href={l.href} style={{ color: muted, textDecoration: 'none' }}>
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, color: faint }}>
            © 2026 Lodestar Freight Systems
          </div>
        </div>
      </footer>

      <style>{`
        header a:hover { color: ${textColor} !important; }
        footer a:hover { color: ${textColor} !important; }
        header nav a { transition: color .15s; }
      `}</style>
    </div>
  );
}
