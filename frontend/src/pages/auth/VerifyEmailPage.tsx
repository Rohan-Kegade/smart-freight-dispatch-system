import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>One more step to complete your account setup</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1 text-sm text-muted-foreground max-w-xs">
          <p>We've sent a verification link to your email.</p>
          <p>Click the link in the email to activate your account.</p>
        </div>
        <Button variant="outline" className="mt-2 w-full" onClick={() => window.location.reload()}>
          I've verified my email
        </Button>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Didn't receive it?{' '}
        <button className="text-primary hover:underline ml-1">Resend email</button>
        {' · '}
        <Link to="/login" className="text-primary hover:underline ml-1">Sign in</Link>
      </CardFooter>
    </Card>
  );
}
