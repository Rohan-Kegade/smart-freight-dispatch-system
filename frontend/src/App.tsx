import { useState } from 'react';
import { clearAuth, getStoredAuth } from './api';
import type { Booking, FreightRequest, User } from './types';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RequestForm from './pages/dispatcher/RequestForm';
import MatchList from './pages/dispatcher/MatchList';
import BookingSuccess from './pages/dispatcher/BookingSuccess';
import FleetPage from './pages/admin/FleetPage';
import BookingsPage from './pages/admin/BookingsPage';

// ── View discriminated union ──────────────────────────────────────────────────
type View =
  | { name: 'new-request' }
  | { name: 'matches'; request: FreightRequest }
  | { name: 'booking-success'; booking: Booking }
  | { name: 'fleet' }
  | { name: 'bookings' };

function defaultView(user: User): View {
  return user.role === 'admin' ? { name: 'bookings' } : { name: 'new-request' };
}

export default function App() {
  const initial = getStoredAuth();
  const [auth, setAuth]   = useState<{ user: User } | null>(initial ? { user: initial.user } : null);
  const [view, setView]   = useState<View>(initial ? defaultView(initial.user) : { name: 'new-request' });

  function handleLogin(user: User) {
    setAuth({ user });
    setView(defaultView(user));
  }

  function handleLogout() {
    clearAuth();
    setAuth(null);
    setView({ name: 'new-request' });
  }

  function navTo(viewName: string) {
    if (viewName === 'new-request') setView({ name: 'new-request' });
    if (viewName === 'fleet')       setView({ name: 'fleet' });
    if (viewName === 'bookings')    setView({ name: 'bookings' });
  }

  // Not logged in
  if (!auth) return <LoginPage onLogin={handleLogin} />;

  const { user } = auth;

  function renderView() {
    switch (view.name) {
      case 'new-request':
        return (
          <RequestForm
            onMatches={request => setView({ name: 'matches', request })}
          />
        );
      case 'matches':
        return (
          <MatchList
            request={view.request}
            onBooked={booking => setView({ name: 'booking-success', booking })}
            onBack={() => setView({ name: 'new-request' })}
          />
        );
      case 'booking-success':
        return (
          <BookingSuccess
            booking={view.booking}
            onNewRequest={() => setView({ name: 'new-request' })}
          />
        );
      case 'fleet':
        return <FleetPage />;
      case 'bookings':
        return <BookingsPage />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        currentView={view.name}
        onNav={navTo}
        onLogout={handleLogout}
      />
      <main>{renderView()}</main>
    </div>
  );
}
