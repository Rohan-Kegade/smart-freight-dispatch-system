import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-background">
      {/* Decorative number */}
      <div className="relative mb-8">
        <p className="text-[10rem] font-black leading-none select-none"
          style={{ WebkitTextStroke: '2px hsl(var(--border))', color: 'transparent' }}>
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
        The page you're looking for doesn't exist or has been moved to a different location.
      </p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Go back
        </Button>
        <Button asChild className="gap-2">
          <Link to="/"><Home className="h-4 w-4" /> Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
