import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, BookOpen, PlusCircle, MessageSquare,
  ChevronLeft, ChevronRight, Bell, LogOut, FileText,
  UserCircle, Settings, PanelLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem { label: string; href: string; icon: React.ElementType; end?: boolean; }

const dispatcherNav: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, end: true },
  { label: 'New Request', href: '/app/request/new', icon: PlusCircle, end: true },
  { label: 'Bookings', href: '/app/bookings', icon: BookOpen },
  { label: 'AI Assistant', href: '/app/assistant', icon: MessageSquare, end: true },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/app/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Vehicles', href: '/app/admin/vehicles', icon: Truck },
  { label: 'Drivers', href: '/app/admin/drivers', icon: Users },
  { label: 'Bookings', href: '/app/bookings', icon: BookOpen },
  { label: 'Team', href: '/app/admin/team', icon: UserCircle, end: true },
  { label: 'Documents', href: '/app/admin/documents', icon: FileText, end: true },
];

const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/request/new': 'New Request',
  '/app/bookings': 'Bookings',
  '/app/assistant': 'AI Assistant',
  '/app/notifications': 'Notifications',
  '/app/admin/dashboard': 'Dashboard',
  '/app/admin/vehicles': 'Vehicles',
  '/app/admin/drivers': 'Drivers',
  '/app/admin/team': 'Team',
  '/app/admin/documents': 'Documents',
  '/app/settings/account': 'Account',
  '/app/settings/org': 'Organisation',
  '/app/settings/billing': 'Billing',
  '/app/settings/notifications': 'Notifications',
};

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/app/bookings/')) return 'Booking detail';
  if (pathname.startsWith('/app/request/') && pathname.includes('/matches')) return 'Match results';
  return PAGE_TITLES[pathname] ?? '';
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.href}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
          collapsed && 'justify-center px-2',
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

function NavSection({ label, items, collapsed }: { label: string; items: NavItem[]; collapsed: boolean }) {
  return (
    <div>
      {!collapsed && (
        <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-sidebar-foreground/30 uppercase">
          {label}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map(item => <SidebarLink key={item.href} item={item} collapsed={collapsed} />)}
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications] = useState(2);

  const navItems = user?.role === 'admin' ? adminNav : dispatcherNav;
  const initials = user?.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  const pageTitle = getPageTitle(location.pathname);
  const isOnSettings = location.pathname.startsWith('/app/settings');

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 shrink-0',
          collapsed ? 'w-[60px]' : 'w-[224px]',
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-14 px-3 border-b border-sidebar-border shrink-0', collapsed && 'justify-center px-2')}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Truck className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-bold text-sm tracking-tight truncate">FreightDispatch</span>}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          <NavSection label="Workspace" items={navItems} collapsed={collapsed} />

          <div className={cn('border-t border-sidebar-border', collapsed ? 'mx-2' : 'mx-1')} />

          {/* Settings single entry */}
          <div className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-sidebar-foreground/30 uppercase">
                Settings
              </p>
            )}
            <NavLink
              to="/app/settings/account"
              className={({ isActive: _ }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  isOnSettings
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                  collapsed && 'justify-center px-2',
                )
              }
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </nav>

        {/* User */}
        <div className={cn('px-2 py-3 border-t border-sidebar-border space-y-1', collapsed && 'px-1')}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-sidebar-accent/60 transition-colors text-left',
                  collapsed && 'justify-center',
                )}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">{user?.name}</p>
                    <p className="text-[11px] text-sidebar-foreground/40 capitalize leading-tight mt-0.5">{user?.role}</p>
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

          <button
            onClick={() => setCollapsed(c => !c)}
            className={cn(
              'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors text-xs',
              collapsed && 'justify-center',
            )}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <><ChevronLeft className="h-3.5 w-3.5" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b flex items-center justify-between px-5 shrink-0 bg-background">
          <div className="flex items-center gap-2">
            {collapsed && (
              <button onClick={() => setCollapsed(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <PanelLeft className="h-4 w-4" />
              </button>
            )}
            {pageTitle && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground/50 font-medium capitalize text-xs tracking-wide">{user?.role}</span>
                <span className="text-muted-foreground/30">/</span>
                <span className="font-semibold text-foreground">{pageTitle}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => navigate('/app/notifications')}>
              <Bell className="h-[18px] w-[18px]" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold leading-none">
                  {notifications}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
