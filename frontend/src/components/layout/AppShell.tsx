import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, LogOut, Settings, ChevronLeft, ChevronRight, Sun, Moon,
  LayoutDashboard, BookOpen, Sparkles, Truck, Users, Database, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { hexToRgba, navColors, type ThemePalette, type NavColorKey } from '@/lib/theme';
import type { Dictionary } from '@/lib/i18n';

const mono = "'IBM Plex Mono', monospace";
const heading = "'IBM Plex Mono', monospace";
const body = "'IBM Plex Mono', monospace";

/* ─── Nav configuration ──────────────────────────────────────── */
interface NavItem { navKey: keyof Dictionary['nav']; href: string; end?: boolean; icon: LucideIcon; colorKey: NavColorKey; }

const dispatcherNav: NavItem[] = [
  { navKey: 'dispatch', href: '/app/dashboard', end: true, icon: LayoutDashboard, colorKey: 'blue' },
  { navKey: 'bookings', href: '/app/bookings', icon: BookOpen, colorKey: 'purple' },
  { navKey: 'assistant', href: '/app/assistant', end: true, icon: Sparkles, colorKey: 'teal' },
];

const adminNav: NavItem[] = [
  { navKey: 'overview', href: '/app/admin/dashboard', end: true, icon: LayoutDashboard, colorKey: 'blue' },
  { navKey: 'fleet', href: '/app/admin/vehicles', icon: Truck, colorKey: 'orange' },
  { navKey: 'drivers', href: '/app/admin/drivers', icon: Users, colorKey: 'green' },
  { navKey: 'bookings', href: '/app/bookings', icon: BookOpen, colorKey: 'purple' },
  { navKey: 'knowledgeBase', href: '/app/admin/documents', end: true, icon: Database, colorKey: 'pink' },
];

function getHeader(pathname: string, dict: Dictionary): [string, string] {
  if (pathname.startsWith('/app/bookings/')) return [dict.special.bookingDetail, ''];
  if (pathname.includes('/matches')) return dict.special.matchResults;
  return dict.pages[pathname] ?? ['', ''];
}

/* ─── Sidebar link ───────────────────────────────────────────── */
function SidebarLink({ item, label, collapsed, C, theme }: { item: NavItem; label: string; collapsed: boolean; C: ThemePalette; theme: 'dark' | 'light' }) {
  const nc = navColors[theme][item.colorKey];
  return (
    <NavLink
      to={item.href}
      end={item.end}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: collapsed ? '10px 0' : '10px 12px',
        borderRadius: 9,
        fontSize: 14,
        border: `1px solid ${isActive ? nc.line : 'transparent'}`,
        background: isActive ? nc.dim : 'transparent',
        color: isActive ? nc.color : C.muted,
        fontWeight: isActive ? 500 : 400,
        textDecoration: 'none',
        fontFamily: body,
        transition: 'all .15s',
        width: '100%',
        justifyContent: collapsed ? 'center' : 'flex-start',
        cursor: 'pointer',
      })}
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <item.icon style={{ width: 15, height: 15, flexShrink: 0, color: nc.color, opacity: isActive ? 1 : 0.7 }} />
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );
}

/* ─── Component ─────────────────────────────────────────────── */
export default function AppShell() {
  const { user, logout } = useAuth();
  const { theme, colors: C, toggleTheme } = useTheme();
  const { dict } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications] = useState(2);

  const navItems = user?.role === 'admin' ? adminNav : dispatcherNav;
  const initials = user?.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  const roleLabel = user?.role === 'admin' ? dict.sidebar.adminRole : dict.sidebar.dispatcherRole;
  const [pageTitle, pageSub] = getHeader(location.pathname, dict);

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, color: C.text, fontFamily: body }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 60 : 236,
        flexShrink: 0,
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 14px',
        transition: 'width .2s',
        overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: collapsed ? 10 : 0,
          padding: collapsed ? '4px 0 20px' : '4px 4px 6px',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: C.text }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ width: 9, height: 9, background: '#071019', transform: 'rotate(45deg)', borderRadius: 1 }} />
            </span>
            {!collapsed && <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>Lodestar</span>}
          </Link>
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: C.faint, padding: 6, borderRadius: 6, flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)}
            onMouseLeave={e => (e.currentTarget.style.color = C.faint)}
          >
            {collapsed ? <ChevronRight style={{ width: 15, height: 15 }} /> : <ChevronLeft style={{ width: 15, height: 15 }} />}
          </button>
        </div>

        {/* Role label */}
        {!collapsed && (
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, padding: '0 8px 14px' }}>
            {roleLabel} {dict.sidebar.workspace}
          </div>
        )}

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {navItems.map(item => (
            <SidebarLink key={item.href} item={item} label={dict.nav[item.navKey]} collapsed={collapsed} C={C} theme={theme} />
          ))}
        </nav>

        {/* User section */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={() => navigate('/app/settings/account')}
            title={collapsed ? user?.name : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 4px', borderRadius: 9, justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 9, background: C.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: heading, fontWeight: 600, fontSize: 13, color: C.text, flexShrink: 0 }}>
              {initials}
            </span>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: 11.5, color: C.faint }}>{roleLabel}</div>
              </div>
            )}
          </button>

          <NavLink
            to="/app/settings"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 11,
              padding: collapsed ? '10px 0' : '10px 12px',
              borderRadius: 9, fontSize: 14,
              border: `1px solid ${isActive ? C.accentLine : 'transparent'}`,
              background: isActive ? C.accentDim : 'transparent',
              color: isActive ? C.accent : C.muted,
              fontWeight: isActive ? 500 : 400,
              textDecoration: 'none', fontFamily: body, transition: 'all .15s',
              width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
              marginTop: 4,
            })}
            title={collapsed ? dict.sidebar.settings : undefined}
          >
            {({ isActive }) => (
              <>
                <Settings style={{ width: 14, height: 14, flexShrink: 0, color: isActive ? C.accent : C.faint }} />
                {!collapsed && <span>{dict.sidebar.settings}</span>}
              </>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            title={collapsed ? dict.sidebar.logout : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: collapsed ? '10px 0' : '10px 12px',
              borderRadius: 9, fontSize: 14,
              border: '1px solid transparent',
              background: 'transparent',
              color: C.muted,
              fontWeight: 400,
              fontFamily: body, transition: 'all .15s',
              width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >
            <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
            {!collapsed && <span>{dict.sidebar.logout}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          flexShrink: 0,
          height: 70,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          background: hexToRgba(C.bg, 0.7),
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}>
          <div>
            {pageTitle && (
              <h1 style={{ fontFamily: heading, fontWeight: 600, fontSize: 20, margin: 0, letterSpacing: '-0.01em', color: C.text }}>{pageTitle}</h1>
            )}
            {pageSub && (
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{pageSub}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              {theme === 'dark' ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
            </button>
            <button
              onClick={() => navigate('/app/notifications')}
              style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 8 }}
            >
              <Bell style={{ width: 18, height: 18 }} />
              {notifications > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        .ld-app-nav a:hover { color: #eaf0f6 !important; background: rgba(255,255,255,.04) !important; }
      `}</style>
    </div>
  );
}
