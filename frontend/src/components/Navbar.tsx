import type { User } from '../types';

interface Props {
  user: User;
  currentView: string;
  onNav: (view: string) => void;
  onLogout: () => void;
}

export default function Navbar({ user, currentView, onNav, onLogout }: Props) {
  const navBtn = (view: string, label: string) => (
    <button
      onClick={() => onNav(view)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === view
          ? 'bg-blue-700 text-white'
          : 'text-blue-100 hover:bg-blue-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Brand */}
        <span className="text-white font-bold text-lg tracking-tight">
          FreightDispatch
        </span>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navBtn('new-request', 'New Request')}
          {user.role === 'admin' && (
            <>
              {navBtn('fleet', 'Fleet')}
              {navBtn('bookings', 'Bookings')}
            </>
          )}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <span className="text-blue-200 text-sm">
            {user.name}
            <span className="ml-2 bg-blue-600 text-blue-100 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide">
              {user.role}
            </span>
          </span>
          <button
            onClick={onLogout}
            className="text-blue-200 hover:text-white text-sm underline-offset-2 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
