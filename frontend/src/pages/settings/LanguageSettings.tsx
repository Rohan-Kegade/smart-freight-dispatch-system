import { Check, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LanguageSettings() {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  function pick(code: typeof language) {
    if (code === language) return;
    setLanguage(code);
    const label = LANGUAGES.find(l => l.code === code)?.label ?? code;
    toast({ title: `Language changed to ${label}`, variant: 'success' });
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" /> App language</CardTitle>
          <CardDescription>Choose the language used across the sidebar, page headers, and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map(l => {
              const active = l.code === language;
              return (
                <button
                  key={l.code}
                  onClick={() => pick(l.code)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all',
                    active ? 'border-primary bg-primary/5' : 'hover:border-primary/40 hover:bg-accent/50',
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{l.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.native}</p>
                  </div>
                  {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
