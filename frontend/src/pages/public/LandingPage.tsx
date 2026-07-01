import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

const mono = "'IBM Plex Mono', monospace";
const heading = "'IBM Plex Mono', monospace";
const body = "'IBM Plex Mono', monospace";

/* ─── Sub-components ─────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { colors: C } = useTheme();
  return (
    <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, marginBottom: 18 }}>
      {children}
    </div>
  );
}

function H2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{ fontFamily: heading, fontWeight: 600, fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 20px', ...style }}>
      {children}
    </h2>
  );
}

/* ─── Component ─────────────────────────────────────────────── */

export default function LandingPage() {
  const { colors: C } = useTheme();
  return (
    <div style={{ background: C.bg, color: C.text, overflowX: 'hidden', fontFamily: body }}>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section id="top" style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${C.border}` }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
          backgroundSize: '58px 58px',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 65% at 50% 0%, #000, transparent 78%)',
          maskImage: 'radial-gradient(ellipse 85% 65% at 50% 0%, #000, transparent 78%)',
        }} />
        {/* Top-right glow */}
        <div style={{ position: 'absolute', top: -220, right: -120, width: 640, height: 640, background: `radial-gradient(circle, ${C.accentDim}, transparent 68%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px 92px', position: 'relative', display: 'grid', gridTemplateColumns: '1.02fr .98fr', gap: 60, alignItems: 'center' }}>

          {/* Left — copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '6px 13px', border: `1px solid ${C.border2}`, borderRadius: 100, background: C.surface, fontFamily: mono, fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: 26 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
              AI-assisted freight dispatch
            </div>
            <h1 style={{ fontFamily: heading, fontWeight: 600, fontSize: 60, lineHeight: 1.02, letterSpacing: '-0.025em', margin: '0 0 22px', color: C.text }}>
              Match every load to the right truck in{' '}
              <span style={{ color: C.accent }}>seconds.</span>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, color: C.muted, margin: '0 0 34px', maxWidth: 520 }}>
              A dispatcher types a request in plain language. Lodestar parses it, runs a deterministic matching engine across your fleet, and returns a ranked, explained shortlist of vehicle + driver + time slot — no invalid matches, ever.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
              <Link to="/signup" style={{ background: C.accent, color: C.accentText, fontWeight: 600, fontSize: 15, padding: '14px 26px', borderRadius: 9, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: `0 6px 22px ${C.accentDim}` }}>
                Start free trial <span style={{ fontFamily: mono }}>→</span>
              </Link>
              <a href="#how" style={{ border: `1px solid ${C.border2}`, color: C.text, fontWeight: 500, fontSize: 15, padding: '14px 24px', borderRadius: 9, textDecoration: 'none' }}>
                See how it works
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 13, color: C.faint, fontFamily: mono }}>
              <span>✓ Deterministic core</span>
              <span>✓ Google Maps ETAs</span>
              <span>✓ Role-based access</span>
            </div>
          </div>

          {/* Right — dispatch card */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 16, padding: 20, boxShadow: '0 30px 80px rgba(0,0,0,.5)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent }} />
                Incoming request
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '15px 16px', fontSize: 14.5, lineHeight: 1.5, color: C.text }}>
                "Need to move <span style={{ color: C.accent }}>4.2 tonnes of chilled dairy</span> from Chennai to Bengaluru, must arrive before <span style={{ color: C.accent }}>6 PM tomorrow</span>."
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 6px', fontFamily: mono, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint }}>
                Parsed <span style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
                {['TYPE · Refrigerated', 'WT · 4.2 t', 'MAA → BLR', 'BY · Tue 18:00'].map(chip => (
                  <span key={chip} style={{ fontFamily: mono, fontSize: 11.5, padding: '5px 9px', borderRadius: 6, background: C.surface2, border: `1px solid ${C.border}`, color: C.muted }}>{chip}</span>
                ))}
              </div>
              {/* Best match card */}
              <div style={{ background: `linear-gradient(180deg, ${C.accentDim}, transparent)`, border: `1px solid ${C.accentLine}`, borderRadius: 12, padding: '15px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '38%', height: 2, background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`, animation: 'ld-sweep 3.2s ease-in-out infinite' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 13, width: 26, height: 26, borderRadius: 7, background: C.accent, color: C.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.success }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.success, animation: 'ld-pulse 1.8s ease-in-out infinite' }} />
                      Best match
                    </span>
                  </div>
                  <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 22, color: C.text }}>
                    94<span style={{ fontSize: 12, color: C.faint }}>/100</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 20, marginBottom: 11 }}>
                  {[
                    { label: 'Vehicle', val: 'TN-09 CG 4521', sub: 'Reefer · 6 t' },
                    { label: 'Driver', val: 'R. Kumar', sub: 'HR licence · 6h legal left' },
                    { label: 'Fit', val: 'On time', sub: '12 km deadhead', valColor: C.success },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: item.valColor }}>{item.val}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                  <span style={{ color: C.accent, fontFamily: mono, fontSize: 11 }}>WHY</span>
                  {' '}Closest available reefer with matching capacity; driver has the most legal hours remaining and the lowest deadhead of all valid pairs.
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: -18, left: -22, background: C.surface2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', boxShadow: '0 14px 34px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 20, color: C.accent }}>2.4s</span>
              <span style={{ fontSize: 11, lineHeight: 1.3, color: C.muted }}>from call<br />to shortlist</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRUST STRIP ════════════════════════════════════════ */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 32px', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, whiteSpace: 'nowrap' }}>Built for heterogeneous fleets</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', flex: 1, justifyContent: 'space-around', fontSize: 13, color: C.muted, fontFamily: mono }}>
            <span>Mini trucks</span><span style={{ color: C.faint }}>·</span>
            <span>Flatbeds</span><span style={{ color: C.faint }}>·</span>
            <span>Reefers</span><span style={{ color: C.faint }}>·</span>
            <span>Container trailers</span><span style={{ color: C.faint }}>·</span>
            <span>Vans</span>
          </div>
        </div>
      </div>

      {/* ══ PROBLEM ═════════════════════════════════════════════ */}
      <section id="problem" style={{ padding: '120px 0', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <SectionLabel>The status quo</SectionLabel>
            <H2>Dispatch shouldn't live in one person's head.</H2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: C.muted, margin: '0 0 18px' }}>
              An ad-hoc load comes in by phone. The dispatcher has to hold the whole fleet in memory — which trucks are the right type, which are free, which drivers are licensed and haven't run out of legal hours — then pick a combination that's actually optimal.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: C.muted, margin: 0 }}>
              It's slow, error-prone, and completely dependent on one experienced operator. When they're out, dispatch stalls.
            </p>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 18 }}>What breaks today</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Manual mental matching', body: 'Capacity, cargo type, licences and hours all juggled by hand under time pressure.' },
                { title: 'Invalid assignments slip through', body: 'Perishables on a dry van, or a driver over their legal limit — caught too late.' },
                { title: 'No visibility into "why"', body: "Decisions can't be explained, audited, or handed off to another dispatcher." },
                { title: 'Idle trucks, extra deadhead', body: '"Good enough" picks quietly burn cost the whole fleet pays for.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', border: `1px solid ${C.warn}`, color: C.warn, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginTop: 1 }}>✕</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section id="how" style={{ padding: '120px 0', borderBottom: `1px solid ${C.border}`, position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ maxWidth: 640, marginBottom: 64 }}>
            <SectionLabel>The flow</SectionLabel>
            <H2 style={{ margin: '0 0 14px' }}>Request to booking in under a minute.</H2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: C.muted, margin: 0 }}>
              Three steps. The dispatcher stays in control at every one — nothing is confirmed on unverified AI output.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                n: '01',
                title: 'Capture the request',
                body: 'Type what the client said, in plain language. Lodestar parses it into structured fields — cargo, weight, route, deadline, handling needs — and shows them for a one-glance review and edit.',
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.accent} strokeWidth="1.5"><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="13" y2="10"/><line x1="3" y1="14" x2="15" y2="14"/></svg>,
              },
              {
                n: '02',
                title: 'Get ranked matches',
                body: 'The engine filters to legal, capable, available pairs, then scores them on deadhead, cost, overtime risk and idle time — returning a ranked shortlist, each with a plain-language reason.',
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.accent} strokeWidth="1.5"><rect x="3" y="4" width="14" height="3" rx="1"/><rect x="3" y="9" width="10" height="3" rx="1"/><rect x="3" y="14" width="6" height="3" rx="1"/></svg>,
              },
              {
                n: '03',
                title: 'Confirm in one click',
                body: 'Pick a match and confirm. Lodestar writes the booking, updates availability automatically, and texts the driver the job details over SMS. No double-entry, no conflicting states.',
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.accent} strokeWidth="1.6"><path d="M4 10.5l4 4 8-9"/></svg>,
              },
            ].map(step => (
              <div key={step.n} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: C.faint }}>{step.n}</span>
                  <span style={{ width: 40, height: 40, borderRadius: 10, background: C.accentDim, border: `1px solid ${C.accentLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.icon}
                  </span>
                </div>
                <h3 style={{ fontFamily: heading, fontWeight: 600, fontSize: 21, margin: '0 0 10px' }}>{step.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: C.muted, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MATCHING ENGINE ═════════════════════════════════════ */}
      <section id="engine" style={{ padding: '120px 0', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '.9fr 1.1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <SectionLabel>The core</SectionLabel>
              <H2>A deterministic engine. AI on top, never in the way.</H2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: C.muted, margin: '0 0 24px' }}>
                The match itself is decided by a transparent, rules-based algorithm — so results are repeatable and auditable. AI handles the language and the explanation, not the decision.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { title: 'Hard constraints are absolute.', body: 'Capacity, cargo compatibility, licence class, legal hours and availability — a fail on any one removes the pair.' },
                  { title: 'Zero invalid matches recommended.', body: 'By construction — invalid pairs never reach the scoring stage.' },
                  { title: 'Real-world distance & ETA.', body: 'Deadhead and route legs come from a live routing API, not straight-line guesses.' },
                ].map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, flexShrink: 0 }} />
                    <span><b style={{ fontWeight: 600 }}>{item.title}</b> <span style={{ color: C.muted }}>{item.body}</span></span>
                  </div>
                ))}
              </div>
            </div>
            {/* Pipeline visual */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 26 }}>
              <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 12 }}>Stage 1 · Hard filters</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {['Vehicle type ✓', 'Capacity ✓', 'Licence class ✓', 'Legal hours ✓', 'Availability ✓'].map(tag => (
                  <span key={tag} style={{ fontSize: 12.5, padding: '6px 11px', borderRadius: 7, background: C.surface2, border: `1px solid ${C.border}` }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.faint, fontFamily: mono, fontSize: 11, marginBottom: 14 }}>
                <span style={{ flex: 1, height: 1, background: C.border }} />
                84 pairs → 11 valid
                <span style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 12 }}>Stage 2 · Weighted scoring</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {[
                  { label: 'Deadhead dist.', pct: 35 },
                  { label: 'Est. cost', pct: 28 },
                  { label: 'Overtime risk', pct: 22 },
                  { label: 'Idle time', pct: 15 },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 110, fontSize: 13, color: C.muted }}>{s.label}</span>
                    <span style={{ flex: 1, height: 6, borderRadius: 3, background: C.surface2, overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${s.pct}%`, background: C.accent, borderRadius: 3 }} />
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 11, color: C.faint, width: 28, textAlign: 'right' }}>{s.pct}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: C.accentDim, border: `1px solid ${C.accentLine}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accent }}>Stage 3 · Ranked output</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Top 5 returned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════ */}
      <section id="features" style={{ padding: '120px 0', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ maxWidth: 640, marginBottom: 56 }}>
            <SectionLabel>Everything in the loop</SectionLabel>
            <h2 style={{ fontFamily: heading, fontWeight: 600, fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>
              One system from the client call to the driver's phone.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" style={{ marginBottom: 16 }}><rect x="3" y="4" width="18" height="13" rx="2"/><line x1="7" y1="8" x2="14" y2="8"/><line x1="7" y1="12" x2="11" y2="12"/><path d="M8 17l-2 3"/></svg>,
                title: 'Natural-language intake',
                body: 'Type the request as spoken. Structured fields come back via reliable function-calling, with a manual form as fallback.',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" style={{ marginBottom: 16 }}><rect x="3" y="5" width="18" height="3" rx="1"/><rect x="3" y="11" width="13" height="3" rx="1"/><rect x="3" y="17" width="8" height="3" rx="1"/></svg>,
                title: 'Deterministic matching',
                body: 'Rules-based filtering and weighted scoring across vehicle, driver and time slot — repeatable and fully auditable.',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" style={{ marginBottom: 16 }}><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4.5"/></svg>,
                title: 'Plain-language explanations',
                body: 'Every recommendation comes with a readable "why" grounded in the actual scoring output — never a black box.',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" style={{ marginBottom: 16 }}><circle cx="6" cy="7" r="2.2"/><circle cx="18" cy="17" r="2.2"/><path d="M8 8l8 8"/></svg>,
                title: 'Real-world ETAs',
                body: 'Deadhead and route legs pulled from Google Maps, so distance, duration and on-time fit reflect actual roads.',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" style={{ marginBottom: 16 }}><rect x="2" y="8" width="12" height="8" rx="1"/><path d="M14 11h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/></svg>,
                title: 'Fleet & driver roster',
                body: 'Admins maintain vehicles, drivers, licences, capacity and planned exceptions like maintenance and leave.',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" style={{ marginBottom: 16 }}><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><path d="M8 16h4"/></svg>,
                title: 'Auto availability & SMS',
                body: 'Availability is derived from confirmed bookings — one source of truth — and drivers get an SMS with job details on confirm.',
              },
            ].map(f => (
              <div key={f.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 26 }}>
                {f.icon}
                <h3 style={{ fontFamily: heading, fontWeight: 600, fontSize: 18, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: C.muted, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRODUCT MOCK ════════════════════════════════════════ */}
      <section style={{ padding: '120px 0', borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, background: `radial-gradient(ellipse, ${C.accentDim}, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 48px' }}>
            <SectionLabel>The dispatch desk</SectionLabel>
            <h2 style={{ fontFamily: heading, fontWeight: 600, fontSize: 42, lineHeight: 1.06, letterSpacing: '-0.02em', margin: 0 }}>See the whole shortlist, decide in a glance.</h2>
          </div>
          {/* Browser window mockup */}
          <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,.55)' }}>
            {/* Chrome bar */}
            <div style={{ height: 42, background: C.surface2, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ margin: '0 auto', fontFamily: mono, fontSize: 12, color: C.faint, background: C.bg, padding: '4px 16px', borderRadius: 6, border: `1px solid ${C.border}` }}>app.lodestar.io/dispatch</span>
            </div>
            {/* App body */}
            <div style={{ display: 'flex', minHeight: 460 }}>
              {/* Sidebar */}
              <div style={{ width: 210, flexShrink: 0, background: C.bg, borderRight: `1px solid ${C.border}`, padding: '18px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 8px 18px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 8, height: 8, background: '#071019', transform: 'rotate(45deg)', borderRadius: 1 }} />
                  </span>
                  <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 15 }}>Lodestar</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    { label: 'Dispatch', active: true },
                    { label: 'Fleet', active: false },
                    { label: 'Drivers', active: false },
                    { label: 'Calendar', active: false },
                    { label: 'Bookings', active: false },
                  ].map(nav => (
                    <span key={nav.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, background: nav.active ? C.accentDim : 'transparent', color: nav.active ? C.accent : C.muted, fontSize: 13.5, fontWeight: nav.active ? 500 : 400 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: nav.active ? C.accent : C.faint }} />
                      {nav.label}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 22, padding: '0 10px', fontFamily: mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>Signed in</div>
                <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: C.surface, fontSize: 12.5 }}>
                  A. Dispatcher
                  <div style={{ fontSize: 11, color: C.faint }}>Dispatcher role</div>
                </div>
              </div>
              {/* Main pane */}
              <div style={{ flex: 1, padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, marginBottom: 6 }}>Request #4471 · parsed</div>
                    <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 19 }}>Chilled dairy · Chennai → Bengaluru</div>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 11, color: C.success, border: `1px solid ${C.success}`, borderRadius: 100, padding: '5px 11px', whiteSpace: 'nowrap' }}>3 valid matches</span>
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
                  {['Refrigerated', '4.2 t', 'By Tue 18:00'].map(chip => (
                    <span key={chip} style={{ fontFamily: mono, fontSize: 11, padding: '4px 9px', borderRadius: 6, background: C.surface2, border: `1px solid ${C.border}`, color: C.muted }}>{chip}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Best match row */}
                  <div style={{ border: `1px solid ${C.accentLine}`, background: `linear-gradient(180deg, ${C.accentDim}, transparent)`, borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 18 }}>
                    <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 15, width: 30, height: 30, borderRadius: 8, background: C.accent, color: C.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>TN-09 CG 4521</span>
                        <span style={{ fontSize: 12, color: C.muted }}>Reefer 6t · R. Kumar</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: C.muted }}>12 km deadhead · on-time · 6h legal hours left</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 20 }}>94</div>
                      <div style={{ fontSize: 10, color: C.faint, fontFamily: mono }}>SCORE</div>
                    </div>
                    <button style={{ flexShrink: 0, background: C.accent, color: C.accentText, fontWeight: 600, fontSize: 13, fontFamily: body, border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer' }}>Confirm</button>
                  </div>
                  {/* Other rows */}
                  {[
                    { rank: 2, vehicle: 'TN-11 AB 8832', detail: 'Reefer 8t · S. Nair', desc: '28 km deadhead · on-time · slightly higher cost', score: 87 },
                    { rank: 3, vehicle: 'KA-05 MN 2290', detail: 'Reefer 6t · D. Rao', desc: '41 km deadhead · on-time · 3h legal hours left', score: 79 },
                  ].map(row => (
                    <div key={row.rank} style={{ border: `1px solid ${C.border}`, background: C.bg, borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 18 }}>
                      <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 15, width: 30, height: 30, borderRadius: 8, background: C.surface2, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{row.rank}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{row.vehicle}</span>
                          <span style={{ fontSize: 12, color: C.muted }}>{row.detail}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: C.muted }}>{row.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 20, color: C.muted }}>{row.score}</div>
                        <div style={{ fontSize: 10, color: C.faint, fontFamily: mono }}>SCORE</div>
                      </div>
                      <button style={{ flexShrink: 0, background: 'transparent', color: C.text, fontWeight: 500, fontSize: 13, fontFamily: body, border: `1px solid ${C.border2}`, padding: '10px 18px', borderRadius: 8, cursor: 'pointer' }}>Select</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ METRICS ═════════════════════════════════════════════ */}
      <section style={{ padding: '110px 0', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { value: '<3s', label: 'to a ranked, explained shortlist', hi: true },
              { value: '0', label: 'invalid matches recommended', hi: false },
              { value: '100+', label: 'vehicles & drivers per query', hi: false },
              { value: '<1m', label: 'request to confirmed booking', hi: false },
            ].map((m, i) => (
              <div key={m.label} style={{ textAlign: 'center', borderRight: i < 3 ? `1px solid ${C.border}` : undefined, padding: '0 12px' }}>
                <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 52, lineHeight: 1, color: m.hi ? C.accent : C.text, marginBottom: 12 }}>{m.value}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═══════════════════════════════════════════ */}
      <section id="cta" style={{ padding: '130px 0', position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ position: 'absolute', bottom: -240, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: `radial-gradient(circle, ${C.accentDim}, transparent 68%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontFamily: heading, fontWeight: 600, fontSize: 52, lineHeight: 1.04, letterSpacing: '-0.025em', margin: '0 0 20px' }}>
            Give your dispatch desk<br />a co-pilot.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: C.muted, margin: '0 0 34px' }}>
            Seed your fleet, paste a request, and watch the shortlist come back in seconds. Free to start.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <Link to="/signup" style={{ background: C.accent, color: C.accentText, fontWeight: 600, fontSize: 16, padding: '15px 30px', borderRadius: 9, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: `0 8px 26px ${C.accentDim}` }}>
              Start free trial <span style={{ fontFamily: mono }}>→</span>
            </Link>
            <a href="#" style={{ border: `1px solid ${C.border2}`, color: C.text, fontWeight: 500, fontSize: 16, padding: '15px 28px', borderRadius: 9, textDecoration: 'none' }}>
              Book a demo
            </a>
          </div>
        </div>
      </section>

      {/* Keyframe animations */}
      <style>{`
        @keyframes ld-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.8)} }
        @keyframes ld-sweep { 0%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }
      `}</style>
    </div>
  );
}
