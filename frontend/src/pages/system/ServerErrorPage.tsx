import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-black text-muted-foreground/20 mb-6">500</p>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        An unexpected error occurred on our end. The team has been notified.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
        <Button variant="outline" asChild><Link to="/">Go home</Link></Button>
      </div>
    </div>
  );
}
