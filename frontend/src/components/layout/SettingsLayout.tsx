import { NavLink, Outlet } from 'react-router-dom';
import { UserCircle, Building2, CreditCard, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const SETTINGS_NAV = [
  { label: 'Account', href: '/app/settings/account', icon: UserCircle },
  { label: 'Organisation', href: '/app/settings/org', icon: Building2 },
  { label: 'Billing', href: '/app/settings/billing', icon: CreditCard },
  { label: 'Notifications', href: '/app/settings/notifications', icon: Bell },
];

export default function SettingsLayout() {
  return (
    <div className="flex min-h-full">
      {/* Settings sub-nav */}
      <aside className="w-52 shrink-0 border-r bg-muted/20 py-6 px-3 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">
          Settings
        </p>
        {SETTINGS_NAV.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-background shadow-sm border text-foreground'
                  : 'text-muted-foreground hover:bg-background/70 hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Settings page content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
