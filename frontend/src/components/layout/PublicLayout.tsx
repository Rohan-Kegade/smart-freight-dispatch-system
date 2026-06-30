import { Link, Outlet } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-[#07091a]/90 backdrop-blur border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">FreightDispatch</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/pricing" className="text-white/50 hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="text-white/70 hover:text-white hover:bg-white/[0.08]">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#07091a] border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-white/40" />
            <span className="font-semibold text-white/80">FreightDispatch</span>
            <span className="text-white/30">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/pricing" className="text-white/40 hover:text-white/80 transition-colors">Pricing</Link>
            <a href="#" className="text-white/40 hover:text-white/80 transition-colors">Privacy</a>
            <a href="#" className="text-white/40 hover:text-white/80 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
