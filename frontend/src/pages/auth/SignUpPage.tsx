import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const C = {
  surface: '#11171f',
  border: 'rgba(255,255,255,.08)',
  border2: 'rgba(255,255,255,.15)',
  text: '#eaf0f6',
  muted: '#8a97a6',
  faint: '#5c6875',
  accent: '#5aa2f0',
  accentDim: 'rgba(90,162,240,0.14)',
  accentLine: 'rgba(90,162,240,0.45)',
  accentSoft: 'rgba(90,162,240,0.22)',
};

const mono = "'IBM Plex Mono', monospace";
const heading = "'Space Grotesk', sans-serif";
const body = "'IBM Plex Sans', sans-serif";

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<'dispatcher' | 'admin'>('dispatcher');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function onSubmit(_data: FormData) {
    // Self-serve registration not yet wired on the backend.
    // Admin creates accounts — contact your admin to be invited.
  }

  function roleStyle(r: 'dispatcher' | 'admin'): React.CSSProperties {
    const active = role === r;
    return {
      flex: 1,
      textAlign: 'center',
      padding: 11,
      borderRadius: 9,
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: body,
      background: active ? C.accentDim : C.surface,
      border: `1px solid ${active ? C.accentLine : C.border}`,
      color: active ? C.accent : C.muted,
      transition: 'all .15s',
    };
  }

  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: heading, fontWeight: 600, fontSize: 28, letterSpacing: '-0.01em', margin: '0 0 6px', color: C.text }}>
          Create your account
        </h2>
        <p style={{ fontSize: 15, color: C.muted, margin: 0 }}>Set up your dispatch workspace in a minute.</p>
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

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>Full name</label>
          <input type="text" placeholder="Jordan Rivera" className="lda-input" {...register('name')} />
          {errors.name && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{errors.name.message}</p>}
        </div>

        {/* Company */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>Company</label>
          <input type="text" placeholder="Meridian Freight Co." className="lda-input" {...register('company')} />
          {errors.company && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{errors.company.message}</p>}
        </div>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>Work email</label>
          <input type="email" placeholder="you@company.com" className="lda-input" {...register('email')} />
          {errors.email && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>Password</label>
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

        {/* Role selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>Your role</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setRole('dispatcher')} style={roleStyle('dispatcher')}>Dispatcher</button>
            <button type="button" onClick={() => setRole('admin')} style={roleStyle('admin')}>Fleet Admin</button>
          </div>
          <p style={{ fontSize: 12, color: C.faint, lineHeight: 1.5, margin: '2px 0 0' }}>
            Dispatchers capture requests and confirm bookings. Admins manage the fleet, drivers and compliance data.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ width: '100%', marginTop: 4, padding: 13, borderRadius: 9, border: 'none', background: C.accent, color: '#071019', fontSize: 15, fontWeight: 600, fontFamily: body, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 20px ${C.accentDim}` }}
        >
          {isSubmitting && <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />}
          Create account
        </button>

        {/* Terms */}
        <p style={{ fontSize: 12, color: C.faint, lineHeight: 1.5, textAlign: 'center', margin: 0 }}>
          By creating an account you agree to Lodestar's{' '}
          <a href="#" style={{ color: C.muted }}>Terms</a>
          {' '}and{' '}
          <a href="#" style={{ color: C.muted }}>Privacy Policy</a>.
        </p>
      </form>

      {/* Switch */}
      <div style={{ marginTop: 26, textAlign: 'center', fontSize: 14, color: C.muted }}>
        Already have an account?
        <Link to="/login" style={{ color: C.accent, textDecoration: 'none', fontWeight: 500, marginLeft: 4 }}>Log in</Link>
      </div>
    </div>
  );
}
