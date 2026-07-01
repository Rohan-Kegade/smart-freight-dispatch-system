import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, UserCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* ─── Design tokens ─────────────────────────────────────────── */
const C = {
  bg: '#090d13',
  surface: '#11171f',
  surface2: '#18212c',
  surface3: '#232f3c',
  border: 'rgba(255,255,255,.08)',
  text: '#eaf0f6',
  muted: '#8a97a6',
  faint: '#5c6875',
  accent: '#5aa2f0',
  accentDim: 'rgba(90,162,240,0.14)',
  accentLine: 'rgba(90,162,240,0.45)',
};

const mono = "'IBM Plex Mono', monospace";
const heading = "'Space Grotesk', sans-serif";
const body = "'IBM Plex Sans', system-ui, sans-serif";

/* ─── Nav configuration ──────────────────────────────────────── */
interface NavItem { label: string; href: string; end?: boolean; }

const dispatcherNav: NavItem[] = [
  { label: 'Dispatch', href: '/app/dashboard', end: true },
  { label: 'Bookings', href: '/app/bookings' },
  { label: 'Assistant', href: '/app/assistant', end: true },
];

const adminNav: NavItem[] = [
  { label: 'Overview', href: '/app/admin/dashboard', end: true },
  { label: 'Fleet', href: '/app/admin/vehicles' },
  { label: 'Drivers', href: '/app/admin/drivers' },
  { label: 'Bookings', href: '/app/bookings' },
  { label: 'Knowledge base', href: '/app/admin/documents', end: true },
];

const PAGE_TITLES: Record<string, [string, string]> = {
  '/app/dashboard':         ['Dispatch', 'Capture a request and confirm the best match'],
  '/app/request/new':       ['New Request', 'Describe a shipment in plain language'],
  '/app/bookings':          ['Bookings', 'All scheduled and ad-hoc jobs'],
  '/app/assistant':         ['Knowledge Assistant', 'Grounded answers from your policy documents'],
  '/app/admin/dashboard':   ['Overview', 'Fleet at a glance'],
  '/app/admin/vehicles':    ['Fleet', 'Vehicles — the source of truth'],
  '/app/admin/drivers':     ['Drivers', 'Roster, licences and working hours'],
  '/app/admin/team':        ['Team', 'Workspace members and roles'],
  '/app/admin/documents':   ['Knowledge Base', 'Documents powering the assistant'],
  '/app/settings/account':  ['Account', 'Your profile and preferences'],
  '/app/settings/org':      ['Organisation', 'Workspace settings'],
  '/app/settings/billing':  ['Billing', 'Plan and payment'],
  '/app/notifications':     ['Notifications', ''],
};

function getHeader(pathname: string): [string, string] {
  if (pathname.startsWith('/app/bookings/')) return ['Booking detail', ''];
  if (pathname.includes('/matches')) return ['Match results', 'Ranked vehicle + driver pairs'];
  return PAGE_TITLES[pathname] ?? ['', ''];
}

/* ─── Sidebar link ───────────────────────────────────────────── */
function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
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
        border: `1px solid ${isActive ? C.accentLine : 'transparent'}`,
        background: isActive ? C.accentDim : 'transparent',
        color: isActive ? C.accent : C.muted,
        fontWeight: isActive ? 500 : 400,
        textDecoration: 'none',
        fontFamily: body,
        transition: 'all .15s',
        width: '100%',
        justifyContent: collapsed ? 'center' : 'flex-start',
        cursor: 'pointer',
      })}
      title={collapsed ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: isActive ? C.accent : C.faint, flexShrink: 0 }} />
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

/* ─── Component ─────────────────────────────────────────────── */
export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications] = useState(2);

  const navItems = user?.role === 'admin' ? adminNav : dispatcherNav;
  const initials = user?.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  const roleLabel = user?.role === 'admin' ? 'Fleet Admin' : 'Dispatcher';
  const [pageTitle, pageSub] = getHeader(location.pathname);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '4px 0 20px' : '4px 8px 6px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: C.text }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ width: 9, height: 9, background: '#071019', transform: 'rotate(45deg)', borderRadius: 1 }} />
            </span>
            {!collapsed && <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>Lodestar</span>}
          </Link>
        </div>

        {/* Role label */}
        {!collapsed && (
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, padding: '0 8px 14px' }}>
            {roleLabel} workspace
          </div>
        )}

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {navItems.map(item => <SidebarLink key={item.href} item={item} collapsed={collapsed} />)}

          <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0' }} />

          <NavLink
            to="/app/settings/account"
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
            })}
            title={collapsed ? 'Settings' : undefined}
          >
            {({ isActive }) => (
              <>
                <Settings style={{ width: 14, height: 14, flexShrink: 0, color: isActive ? C.accent : C.faint }} />
                {!collapsed && <span>Settings</span>}
              </>
            )}
          </NavLink>
        </nav>

        {/* User section */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 4px', borderRadius: 9, justifyContent: collapsed ? 'center' : 'flex-start' }}>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/app/settings/account')}>
                <UserCircle className="h-4 w-4" /> Account settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: C.faint, fontSize: 12, fontFamily: mono, padding: '8px 4px', borderRadius: 6, marginTop: 6, justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            {collapsed
              ? <ChevronRight style={{ width: 14, height: 14 }} />
              : <><ChevronLeft style={{ width: 14, height: 14 }} /><span>Collapse</span></>
            }
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
          background: 'rgba(9,13,19,0.7)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
