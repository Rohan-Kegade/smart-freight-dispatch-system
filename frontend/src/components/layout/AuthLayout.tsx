import { Link, Outlet } from 'react-router-dom';
import { Truck } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <Truck className="h-7 w-7 text-primary" />
        <span className="font-bold text-xl">FreightDispatch</span>
      </Link>
      <div className="w-full max-w-[400px]">
        <Outlet />
      </div>
    </div>
  );
}
