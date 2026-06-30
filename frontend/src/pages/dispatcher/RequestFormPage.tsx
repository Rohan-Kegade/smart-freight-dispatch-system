import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { requestsApi } from '@/api';
import { ApiError } from '@/api';
import type { FreightRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate, formatWeight, capitalise } from '@/lib/utils';

const EXAMPLES = [
  'Ship 2 tonnes of fabric from Bhiwandi warehouse to Andheri showroom by 5pm today.',
  'Need refrigerated truck for 500kg of dairy products, pickup Thane depot, deliver Pune cold storage, deadline tomorrow 9am.',
  'Urgent — 15,000kg steel beams from Navi Mumbai to Pune construction site, by 6pm today.',
  'Move 3.5 tons of electronics (fragile) from Powai tech park to Bandra by 2pm, needs careful handling.',
];

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

  async function handleFindMatches() {
    if (!parsed) return;
    setFindingMatches(true);
    navigate(`/app/request/${parsed.id}/matches`);
  }

  function reset() { setParsed(null); setRawText(''); setError(''); setClarification(''); }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader title="New dispatch request" description="Describe the shipment in plain language — the AI will extract the details." />

      {!parsed ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Describe the shipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rawText}
              onChange={e => { setRawText(e.target.value); setError(''); setClarification(''); }}
              rows={5}
              placeholder="e.g. Need to move 3 tonnes of electronics from Bhiwandi to Andheri by 4pm today…"
              className="resize-none"
            />

            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Try an example</p>
              <div className="space-y-1">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setRawText(ex); setError(''); setClarification(''); }}
                    className="block w-full text-left text-xs text-primary hover:text-primary/80 truncate py-0.5 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {clarification && (
              <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
                <p className="font-medium mb-0.5">Clarification needed</p>
                <p>{clarification}</p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
            )}

            <Button onClick={handleParse} disabled={parsing || !rawText.trim()} className="w-full">
              {parsing ? <><Loader2 className="h-4 w-4 animate-spin" /> Parsing request…</> : <><Sparkles className="h-4 w-4" /> Parse & extract details</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Extracted details</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Review before finding matches</p>
            </div>
            <Badge variant="success">Confirmed</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted-foreground">Cargo type</dt><dd className="font-medium">{capitalise(parsed.cargo_type)}</dd></div>
              <div><dt className="text-muted-foreground">Weight</dt><dd className="font-medium">{formatWeight(parsed.weight_kg)}</dd></div>
              <div><dt className="text-muted-foreground">Pickup</dt><dd className="font-medium">{parsed.pickup_location}</dd></div>
              <div><dt className="text-muted-foreground">Drop</dt><dd className="font-medium">{parsed.drop_location}</dd></div>
              <div><dt className="text-muted-foreground">Deadline</dt><dd className="font-medium">{formatDate(parsed.deadline)}</dd></div>
              {parsed.special_handling.length > 0 && (
                <div><dt className="text-muted-foreground">Special handling</dt><dd className="font-medium">{parsed.special_handling.map(capitalise).join(', ')}</dd></div>
              )}
            </dl>

            <div className="pt-2 border-t flex gap-2">
              <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Edit request</Button>
              <Button className="flex-1 gap-2" onClick={handleFindMatches} disabled={findingMatches}>
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
