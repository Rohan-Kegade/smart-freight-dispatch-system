import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api';
import { ApiError } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError('');
    try {
      const { token, user } = await authApi.login(data.email, data.password);
      login(token, user);
      navigate(user.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard');
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    }
  }

  function fillDemo(role: 'admin' | 'dispatcher') {
    setValue('email', role === 'admin' ? 'admin@freight.co' : 'dispatcher@freight.co');
    setValue('password', 'password123');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1">Sign in to your Lodestar account</p>
      </div>

      {/* Demo credentials */}
      <div className="rounded-lg border bg-muted/50 p-3.5 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Demo credentials</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fillDemo('dispatcher')}
            className="flex-1 text-left rounded-md border bg-background px-3 py-2 text-xs hover:border-primary/60 transition-colors"
          >
            <span className="font-medium block">Dispatcher</span>
            <span className="text-muted-foreground">dispatcher@freight.co</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="flex-1 text-left rounded-md border bg-background px-3 py-2 text-xs hover:border-primary/60 transition-colors"
          >
            <span className="font-medium block">Admin</span>
            <span className="text-muted-foreground">admin@freight.co</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
            {serverError}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
      </p>
    </div>
  );
}
