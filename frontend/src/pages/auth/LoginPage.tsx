import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authApi, ApiError } from '@/api';
import { useTheme } from '@/context/ThemeContext';

const mono = "'IBM Plex Mono', monospace";
const heading = "'IBM Plex Mono', monospace";
const body = "'IBM Plex Mono', monospace";

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { colors: C } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw] = useState(false);

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
    <div>
      {/* Heading */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: heading, fontWeight: 600, fontSize: 28, letterSpacing: '-0.01em', margin: '0 0 6px', color: C.text }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 15, color: C.muted, margin: 0 }}>Log in to your dispatch workspace.</p>
      </div>

      {/* SSO */}
      <button
        type="button"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 12, borderRadius: 9, border: `1px solid ${C.border2}`, background: C.surface, color: C.text, fontSize: 14, fontWeight: 500, fontFamily: body, cursor: 'pointer' }}
      >
        <svg width="17" height="17" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.6 9.2c0-.6-.05-1.2-.16-1.7H9v3.3h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/>
          <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z"/>
          <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0' }}>
        <span style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>or</span>
        <span style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      {/* Demo credentials */}
      <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: '12px 14px', marginBottom: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 10 }}>Demo credentials</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['dispatcher', 'admin'] as const).map(role => (
            <button
              key={role}
              type="button"
              onClick={() => fillDemo(role)}
              style={{ flex: 1, textAlign: 'left', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', cursor: 'pointer', color: C.text, fontFamily: body }}
            >
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{role === 'dispatcher' ? 'Dispatcher' : 'Admin'}</div>
              <div style={{ fontFamily: mono, fontSize: 10.5, color: C.muted }}>{role}@freight.co</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {serverError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 13.5, color: '#f87171' }}>
            {serverError}
          </div>
        )}

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>Work email</label>
          <input type="email" placeholder="you@company.com" className="lda-input" {...register('email')} />
          {errors.email && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: 12, color: C.accent, textDecoration: 'none' }}>Forgot?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              className="lda-input lda-input-pw"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: C.muted, fontSize: 12, fontFamily: mono, cursor: 'pointer', padding: '4px 6px' }}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ width: '100%', marginTop: 4, padding: 13, borderRadius: 9, border: 'none', background: C.accent, color: C.accentText, fontSize: 15, fontWeight: 600, fontFamily: body, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 20px ${C.accentDim}` }}
        >
          {isSubmitting && <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />}
          Log in
        </button>
      </form>

      {/* Switch */}
      <div style={{ marginTop: 26, textAlign: 'center', fontSize: 14, color: C.muted }}>
        Don't have an account?
        <Link to="/signup" style={{ color: C.accent, textDecoration: 'none', fontWeight: 500, marginLeft: 4 }}>Create one</Link>
      </div>
    </div>
  );
}
