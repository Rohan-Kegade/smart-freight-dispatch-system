import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <ShieldOff className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Access denied</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Go back
        </Button>
        <Button variant="outline" asChild><Link to="/">Home</Link></Button>
      </div>
    </div>
  );
}
