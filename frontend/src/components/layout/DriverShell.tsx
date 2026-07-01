import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, Truck, CalendarClock, UserCircle, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const heading = "'IBM Plex Mono', monospace";
const body = "'IBM Plex Mono', monospace";

interface TabItem { label: string; href: string; icon: LucideIcon; end?: boolean }

const TABS: TabItem[] = [
  { label: 'Trips', href: '/app/driver/trips', icon: Truck },
  { label: 'Leave', href: '/app/driver/leave', icon: CalendarClock, end: true },
  { label: 'Account', href: '/app/settings/account', icon: UserCircle, end: true },
];

const PAGE_TITLES: Record<string, string> = {
  '/app/driver/trips': 'My Trips',
  '/app/driver/leave': 'Leave',
};

function currentTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/app/driver/trips/')) return 'Trip Detail';
  return 'Lodestar';
}

// Lightweight top bar + bottom tab bar — the driver persona is "boots on the
// ground" mobile, unlike the desktop sidebar used by the other three roles.
export default function DriverShell() {
  const { logout } = useAuth();
  const { theme, colors: C, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg, color: C.text, fontFamily: body }}>
      {/* Top bar */}
      <header style={{
        flexShrink: 0,
        height: 58,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: C.surface,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: C.text }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, background: '#071019', transform: 'rotate(45deg)', borderRadius: 1 }} />
          </span>
          <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 15 }}>{currentTitle(location.pathname)}</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 8 }}
          >
            {theme === 'dark' ? <Sun style={{ width: 17, height: 17 }} /> : <Moon style={{ width: 17, height: 17 }} />}
          </button>
          <button
            onClick={handleLogout}
            title="Log out"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 8 }}
          >
            <LogOut style={{ width: 17, height: 17 }} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        flexShrink: 0,
        display: 'flex',
        borderTop: `1px solid ${C.border}`,
        background: C.surface,
      }}>
        {TABS.map(tab => (
          <NavLink
            key={tab.href}
            to={tab.href}
            end={tab.end}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '10px 0 8px',
              textDecoration: 'none',
              color: isActive ? C.accent : C.muted,
              fontSize: 11,
              fontFamily: body,
            })}
          >
            {({ isActive }) => (
              <>
                <tab.icon style={{ width: 19, height: 19, opacity: isActive ? 1 : 0.75 }} />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
