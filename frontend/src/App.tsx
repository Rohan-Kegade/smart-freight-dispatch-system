import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import AppShell from '@/components/layout/AppShell';
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

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import VehiclesPage from '@/pages/admin/VehiclesPage';
import DriversPage from '@/pages/admin/DriversPage';
import TeamPage from '@/pages/admin/TeamPage';
import DocumentsPage from '@/pages/admin/DocumentsPage';

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

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard'} replace />;
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

      {/* Authenticated app */}
      <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
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

        {/* Admin routes */}
        <Route path="admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="admin/vehicles" element={<RequireAdmin><VehiclesPage /></RequireAdmin>} />
        <Route path="admin/drivers" element={<RequireAdmin><DriversPage /></RequireAdmin>} />
        <Route path="admin/team" element={<RequireAdmin><TeamPage /></RequireAdmin>} />
        <Route path="admin/documents" element={<RequireAdmin><DocumentsPage /></RequireAdmin>} />

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

      {/* System pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/error" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AppHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard'} replace />;
}
