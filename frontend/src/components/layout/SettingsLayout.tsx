import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { UserCircle, Building2, CreditCard, Bell, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsLayout() {
  const { colors: C } = useTheme();
  const { dict } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const SETTINGS_NAV = [
    { label: dict.settingsNav.account, href: '/app/settings/account', icon: UserCircle },
    { label: dict.settingsNav.organisation, href: '/app/settings/org', icon: Building2 },
    { label: dict.settingsNav.billing, href: '/app/settings/billing', icon: CreditCard },
    { label: dict.settingsNav.notifications, href: '/app/settings/notifications', icon: Bell },
    { label: dict.settingsNav.language, href: '/app/settings/language', icon: Globe },
  ];

  return (
    <div className="flex min-h-full">
      {/* Settings sub-nav */}
      <aside style={{
        width: collapsed ? 60 : 208,
        flexShrink: 0,
        borderRight: `1px solid ${C.border}`,
        background: C.surface,
        padding: collapsed ? '24px 10px' : '24px 12px',
        transition: 'width .2s',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '0 4px', marginBottom: 12,
        }}>
          {!collapsed && (
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, margin: 0 }}>
              {dict.settingsNav.heading}
            </p>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand settings menu' : 'Collapse settings menu'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: C.faint, padding: 4, borderRadius: 6, flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)}
            onMouseLeave={e => (e.currentTarget.style.color = C.faint)}
          >
            {collapsed ? <ChevronRight style={{ width: 14, height: 14 }} /> : <ChevronLeft style={{ width: 14, height: 14 }} />}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SETTINGS_NAV.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end
              title={collapsed ? label : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 11,
                padding: collapsed ? '10px 0' : '10px 12px', borderRadius: 9, fontSize: 14,
                border: `1px solid ${isActive ? C.accentLine : 'transparent'}`,
                background: isActive ? C.accentDim : 'transparent',
                color: isActive ? C.accent : C.muted,
                fontWeight: isActive ? 500 : 400,
                textDecoration: 'none', transition: 'all .15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon style={{ width: 15, height: 15, flexShrink: 0, color: isActive ? C.accent : C.faint }} />
                  {!collapsed && label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Settings page content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
