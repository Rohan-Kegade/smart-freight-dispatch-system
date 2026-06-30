import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, BookOpen, PlusCircle, MessageSquare,
  ChevronLeft, ChevronRight, Bell, LogOut, Building2, FileText, CreditCard,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const dispatcherNav: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { label: 'New Request', href: '/app/request/new', icon: PlusCircle },
  { label: 'Bookings', href: '/app/bookings', icon: BookOpen },
  { label: 'AI Assistant', href: '/app/assistant', icon: MessageSquare },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/app/admin/dashboard', icon: LayoutDashboard },
  { label: 'Vehicles', href: '/app/admin/vehicles', icon: Truck },
  { label: 'Drivers', href: '/app/admin/drivers', icon: Users },
  { label: 'Bookings', href: '/app/bookings', icon: BookOpen },
  { label: 'Team', href: '/app/admin/team', icon: UserCircle },
  { label: 'Documents', href: '/app/admin/documents', icon: FileText },
];

const settingsNav: NavItem[] = [
  { label: 'Account', href: '/app/settings/account', icon: UserCircle },
  { label: 'Organisation', href: '/app/settings/org', icon: Building2 },
  { label: 'Billing', href: '/app/settings/billing', icon: CreditCard },
  { label: 'Notifications', href: '/app/settings/notifications', icon: Bell },
];

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
          collapsed && 'justify-center px-2',
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications] = useState(2);

  const navItems = user?.role === 'admin' ? adminNav : dispatcherNav;
  const initials = user?.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) ?? '??';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 shrink-0',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-14 px-3 border-b border-sidebar-border shrink-0', collapsed && 'justify-center')}>
          <Link to="/" className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary shrink-0" />
            {!collapsed && <span className="font-bold text-sm tracking-tight">FreightDispatch</span>}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(item => <SidebarLink key={item.href} item={item} collapsed={collapsed} />)}

          <Separator className="my-3 bg-sidebar-border" />

          {settingsNav.map(item => <SidebarLink key={item.href} item={item} collapsed={collapsed} />)}
        </nav>

        {/* User + collapse */}
        <div className={cn('px-2 py-3 border-t border-sidebar-border space-y-2', collapsed && 'px-1')}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent/50 transition-colors text-left',
                  collapsed && 'justify-center',
                )}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/app/settings/account')}>
                <UserCircle className="h-4 w-4" /> Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(c => !c)}
            className={cn('w-full text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50', collapsed && 'px-0 justify-center')}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-background">
          <div />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/app/notifications')}>
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
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
