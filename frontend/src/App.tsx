import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { roleHomePath } from '@/lib/roleHome';
import type { Role } from '@/types';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import AppShell from '@/components/layout/AppShell';
import DriverShell from '@/components/layout/DriverShell';
import SettingsLayout from '@/components/layout/SettingsLayout';

// Public pages
import LandingPage from '@/pages/public/LandingPage';
import PricingPage from '@/pages/public/PricingPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Onboarding
import OnboardingWizard from '@/pages/onboarding/OnboardingWizard';

// Dispatcher pages
import DashboardPage from '@/pages/dispatcher/DashboardPage';
import RequestFormPage from '@/pages/dispatcher/RequestFormPage';
import MatchResultsPage from '@/pages/dispatcher/MatchResultsPage';
import BookingsListPage from '@/pages/dispatcher/BookingsListPage';
import BookingDetailPage from '@/pages/dispatcher/BookingDetailPage';

// Fleet Manager pages
import FleetManagerDashboard from '@/pages/fleet-manager/AdminDashboard';
import VehiclesPage from '@/pages/fleet-manager/VehiclesPage';
import DriversPage from '@/pages/fleet-manager/DriversPage';
import DocumentsPage from '@/pages/fleet-manager/DocumentsPage';
import CalendarPage from '@/pages/fleet-manager/CalendarPage';
import LeaveManagementPage from '@/pages/fleet-manager/LeaveManagementPage';

// System Admin pages
import UsersPage from '@/pages/system-admin/UsersPage';
import AuditLogsPage from '@/pages/system-admin/AuditLogsPage';

// Driver pages
import TripLedgerPage from '@/pages/driver/TripLedgerPage';
import TripDetailPage from '@/pages/driver/TripDetailPage';
import LeavePage from '@/pages/driver/LeavePage';

// Settings
import AccountSettings from '@/pages/settings/AccountSettings';
import OrgSettings from '@/pages/settings/OrgSettings';
import BillingPage from '@/pages/settings/BillingPage';
import NotificationPreferences from '@/pages/settings/NotificationPreferences';
import LanguageSettings from '@/pages/settings/LanguageSettings';

// RAG Assistant
import AssistantPage from '@/pages/assistant/AssistantPage';

// Notifications
import NotificationsPage from '@/pages/notifications/NotificationsPage';

// System pages
import NotFoundPage from '@/pages/system/NotFoundPage';
import ServerErrorPage from '@/pages/system/ServerErrorPage';
import UnauthorizedPage from '@/pages/system/UnauthorizedPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// System Admin has universal access, so it always passes regardless of `allowed`.
function RequireRole({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || (user.role !== 'system_admin' && !allowed.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={roleHomePath(user?.role)} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/signup" element={<AuthRedirect><SignUpPage /></AuthRedirect>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Onboarding (standalone) */}
      <Route path="/onboarding" element={<RequireAuth><OnboardingWizard /></RequireAuth>} />

      {/* Authenticated app — System Admin, Fleet Manager, Dispatcher */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <RequireRole allowed={['system_admin', 'fleet_manager', 'dispatcher']}>
              <AppShell />
            </RequireRole>
          </RequireAuth>
        }
      >
        {/* Redirect /app to role-appropriate home */}
        <Route index element={<AppHomeRedirect />} />

        {/* Dispatcher routes */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="request/new" element={<RequestFormPage />} />
        <Route path="request/:requestId/matches" element={<MatchResultsPage />} />
        <Route path="bookings" element={<BookingsListPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        {/* Fleet Manager routes */}
        <Route path="fleet/dashboard" element={<RequireRole allowed={['fleet_manager']}><FleetManagerDashboard /></RequireRole>} />
        <Route path="fleet/vehicles" element={<RequireRole allowed={['fleet_manager']}><VehiclesPage /></RequireRole>} />
        <Route path="fleet/drivers" element={<RequireRole allowed={['fleet_manager']}><DriversPage /></RequireRole>} />
        <Route path="fleet/documents" element={<RequireRole allowed={['fleet_manager']}><DocumentsPage /></RequireRole>} />
        <Route path="fleet/calendar" element={<RequireRole allowed={['fleet_manager']}><CalendarPage /></RequireRole>} />
        <Route path="fleet/leave" element={<RequireRole allowed={['fleet_manager']}><LeaveManagementPage /></RequireRole>} />

        {/* System Admin routes */}
        <Route path="system/users" element={<RequireRole allowed={['system_admin']}><UsersPage /></RequireRole>} />
        <Route path="system/audit-logs" element={<RequireRole allowed={['system_admin']}><AuditLogsPage /></RequireRole>} />

        {/* Settings */}
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="account" replace />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="org" element={<OrgSettings />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="notifications" element={<NotificationPreferences />} />
          <Route path="language" element={<LanguageSettings />} />
        </Route>
      </Route>

      {/* Authenticated app — Driver (separate mobile-shaped shell) */}
      <Route
        path="/app/driver"
        element={
          <RequireAuth>
            <RequireRole allowed={['driver']}>
              <DriverShell />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="trips" replace />} />
        <Route path="trips" element={<TripLedgerPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="leave" element={<LeavePage />} />
      </Route>

      {/* System pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/error" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AppHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={roleHomePath(user?.role)} replace />;
}
