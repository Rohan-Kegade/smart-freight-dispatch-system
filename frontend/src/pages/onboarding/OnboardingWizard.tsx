import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { roleHomePath } from '@/lib/roleHome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const STEPS = [
  { id: 'welcome', title: 'Welcome to Lodestar', icon: Truck },
  { id: 'org', title: 'Set up your organisation', icon: Users },
  { id: 'done', title: "You're all set!", icon: CheckCircle },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState('');

  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  function finish() {
    navigate(roleHomePath(user?.role));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4 py-12">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-10 transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-md">
        {step === 0 && (
          <>
            <CardHeader className="text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome, {user?.name?.split(' ')[0]}!</CardTitle>
              <CardDescription>Let's get your Lodestar workspace set up in 2 quick steps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {['Set up your organisation details', 'Optionally seed your first vehicle and driver', 'Then you\'re ready to dispatch!'].map(t => (
                  <li key={t} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />{t}</li>
                ))}
              </ul>
              <Button className="w-full" onClick={next}>Get started <ArrowRight className="h-4 w-4" /></Button>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Organisation details</CardTitle>
              <CardDescription>This will appear across the platform and on reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="orgName">Organisation name</Label>
                <Input id="orgName" placeholder="Acme Freight Ltd." value={orgName} onChange={e => setOrgName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Primary depot city</Label>
                <Input placeholder="Mumbai" />
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={back}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button className="flex-1" onClick={next} disabled={!orgName.trim()}>Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">You're all set!</CardTitle>
              <CardDescription>Your workspace is ready. Head to the dashboard to start dispatching.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={finish}>Go to dashboard <ArrowRight className="h-4 w-4" /></Button>
              {user?.role === 'fleet_manager' && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/app/fleet/vehicles')}>Add your first vehicle</Button>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
