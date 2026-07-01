import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, ArrowRight, RotateCcw, MapPin, Weight, Clock, Package } from 'lucide-react';
import { requestsApi } from '@/api';
import { ApiError } from '@/api';
import type { FreightRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatWeight, capitalise } from '@/lib/utils';
import { cn } from '@/lib/utils';

const EXAMPLES = [
  'Ship 2 tonnes of fabric from Bhiwandi warehouse to Andheri showroom by 5pm today.',
  'Need refrigerated truck for 500 kg of dairy products — pickup Thane depot, deliver Pune cold storage, deadline tomorrow 9am.',
  'Urgent — 15,000 kg steel beams from Navi Mumbai to Pune construction site, by 6pm today.',
  'Move 3.5 tons of electronics (fragile) from Powai tech park to Bandra by 2pm, careful handling required.',
];

const MAX_CHARS = 600;

export default function RequestFormPage() {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [findingMatches, setFindingMatches] = useState(false);
  const [error, setError] = useState('');
  const [clarification, setClarification] = useState('');
  const [parsed, setParsed] = useState<FreightRequest | null>(null);

  async function handleParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    setError('');
    setClarification('');
    setParsed(null);
    try {
      const { request } = await requestsApi.create(rawText.trim());
      setParsed(request);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const d = err.data as { clarification_needed?: string };
        setClarification(d.clarification_needed ?? 'Please provide more details.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to parse request');
      }
    } finally {
      setParsing(false);
    }
  }

  function reset() { setParsed(null); setRawText(''); setError(''); setClarification(''); }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {!parsed ? (
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Describe the shipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={rawText}
                  onChange={e => { setRawText(e.target.value.slice(0, MAX_CHARS)); setError(''); setClarification(''); }}
                  rows={5}
                  placeholder="e.g. Need to move 3 tonnes of electronics from Bhiwandi to Andheri by 4pm today…"
                  className="resize-none pr-3 text-sm leading-relaxed"
                />
                <span className={cn(
                  'absolute bottom-2 right-3 text-[11px] tabular-nums transition-colors',
                  rawText.length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-muted-foreground/40',
                )}>
                  {rawText.length}/{MAX_CHARS}
                </span>
              </div>

              {clarification && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  <p className="font-semibold mb-0.5">Clarification needed</p>
                  <p className="leading-relaxed">{clarification}</p>
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
              )}

              <Button
                onClick={handleParse}
                disabled={parsing || !rawText.trim()}
                className="w-full gap-2"
                size="lg"
              >
                {parsing
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Parsing your request…</>
                  : <><Sparkles className="h-4 w-4" /> Parse & extract details</>}
              </Button>
            </CardContent>
          </Card>

          {/* Example prompts as chips */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Try an example</p>
            <div className="space-y-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setRawText(ex); setError(''); setClarification(''); }}
                  className="w-full text-left text-xs rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-primary/5 px-3.5 py-2.5 text-muted-foreground hover:text-foreground transition-all group"
                >
                  <span className="inline-flex items-center gap-1 font-medium text-primary/70 group-hover:text-primary mr-1.5">
                    <Sparkles className="h-3 w-3" /> Example {i + 1}
                  </span>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Extracted details</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Review before finding matches</p>
            </div>
            <Badge variant="success" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Parsed
            </Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-md bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cargo type</p>
                  <p className="text-sm font-semibold">{capitalise(parsed.cargo_type)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-md bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Weight className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-sm font-semibold">{formatWeight(parsed.weight_kg)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-md bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="text-sm font-semibold">{parsed.pickup_location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-md bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Drop</p>
                  <p className="text-sm font-semibold">{parsed.drop_location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-semibold">{formatDate(parsed.deadline)}</p>
                </div>
              </div>
              {parsed.special_handling.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1.5">Special handling</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.special_handling.map(h => (
                      <Badge key={h} variant="outline" className="text-xs">{capitalise(h)}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex gap-2">
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button className="flex-1 gap-2" size="default" onClick={() => { setFindingMatches(true); navigate(`/app/request/${parsed.id}/matches`); }} disabled={findingMatches}>
                {findingMatches ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Find available vehicles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
