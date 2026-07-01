import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, ArrowRight, RotateCcw, Pencil, MapPin, Weight, Clock, Package } from 'lucide-react';
import { requestsApi } from '@/api';
import { ApiError } from '@/api';
import type { FreightRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatWeight, capitalise } from '@/lib/utils';
import { cn } from '@/lib/utils';

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EditForm {
  cargo_type: string;
  weight_kg: string;
  pickup_location: string;
  drop_location: string;
  deadline: string;
  special_handling: string;
}

function toEditForm(r: FreightRequest): EditForm {
  return {
    cargo_type: r.cargo_type,
    weight_kg: String(r.weight_kg),
    pickup_location: r.pickup_location,
    drop_location: r.drop_location,
    deadline: toDatetimeLocal(r.deadline),
    special_handling: r.special_handling.join(', '),
  };
}

const EXAMPLES = [
  'Ship 2 tonnes of fabric from Bhiwandi warehouse to Andheri showroom by 5pm today.',
  'Need refrigerated truck for 500 kg of dairy products — pickup Thane depot, deliver Pune cold storage, deadline tomorrow 9am.',
  'Urgent — 15,000 kg steel beams from Navi Mumbai to Pune construction site, by 6pm today.',
  'Move 3.5 tons of electronics (fragile) from Powai tech park to Bandra by 2pm, careful handling required.',
];

const MAX_CHARS = 600;

export default function RequestFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [findingMatches, setFindingMatches] = useState(false);
  const [error, setError] = useState('');
  const [clarification, setClarification] = useState('');
  const [parsed, setParsed] = useState<FreightRequest | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

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

  function reset() { setParsed(null); setRawText(''); setError(''); setClarification(''); setEditing(false); }

  function openEdit() {
    if (!parsed) return;
    setEditForm(toEditForm(parsed));
    setEditError('');
    setEditing(true);
  }

  function cancelEdit() { setEditing(false); setEditError(''); }

  async function saveEdit() {
    if (!parsed || !editForm) return;
    setEditError('');

    const weight = Number(editForm.weight_kg);
    if (!editForm.cargo_type.trim()) return setEditError('Cargo type is required');
    if (isNaN(weight) || weight <= 0) return setEditError('Weight must be a positive number');
    if (!editForm.pickup_location.trim()) return setEditError('Pickup location is required');
    if (!editForm.drop_location.trim()) return setEditError('Drop location is required');
    const deadline = new Date(editForm.deadline);
    if (isNaN(deadline.getTime())) return setEditError('Deadline must be a valid date/time');

    setSaving(true);
    try {
      const { request } = await requestsApi.update(parsed.id, {
        cargo_type: editForm.cargo_type.trim(),
        weight_kg: weight,
        pickup_location: editForm.pickup_location.trim(),
        drop_location: editForm.drop_location.trim(),
        deadline: deadline.toISOString(),
        special_handling: editForm.special_handling.split(',').map(s => s.trim()).filter(Boolean),
      });
      setParsed(request);
      setEditing(false);
      toast({ title: 'Request updated', variant: 'success' });
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

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
              <p className="text-xs text-muted-foreground mt-0.5">
                {editing ? 'Correct any fields the AI got wrong' : 'Review before finding matches'}
              </p>
            </div>
            {!editing && (
              <Badge variant="success" className="gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                Parsed
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {editError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{editError}</div>
            )}

            {editing && editForm ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Cargo type</Label>
                  <Input value={editForm.cargo_type} onChange={e => setEditForm(f => f && { ...f, cargo_type: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Weight (kg)</Label>
                  <Input type="number" min="0" step="0.01" value={editForm.weight_kg} onChange={e => setEditForm(f => f && { ...f, weight_kg: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Pickup location</Label>
                  <Input value={editForm.pickup_location} onChange={e => setEditForm(f => f && { ...f, pickup_location: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Drop location</Label>
                  <Input value={editForm.drop_location} onChange={e => setEditForm(f => f && { ...f, drop_location: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Deadline</Label>
                  <Input type="datetime-local" value={editForm.deadline} onChange={e => setEditForm(f => f && { ...f, deadline: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Special handling</Label>
                  <Input
                    placeholder="comma-separated, e.g. fragile, refrigerated"
                    value={editForm.special_handling}
                    onChange={e => setEditForm(f => f && { ...f, special_handling: e.target.value })}
                  />
                </div>
              </div>
            ) : (
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
            )}

            {editing ? (
              <div className="pt-3 border-t flex gap-2">
                <Button variant="outline" onClick={cancelEdit} className="gap-2" disabled={saving}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={saveEdit} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            ) : (
              <div className="pt-3 border-t flex gap-2">
                <Button variant="outline" onClick={reset} className="gap-2" title="Discard and describe the shipment again">
                  <RotateCcw className="h-3.5 w-3.5" /> Start over
                </Button>
                <Button variant="outline" onClick={openEdit} className="gap-2">
                  <Pencil className="h-3.5 w-3.5" /> Edit details
                </Button>
                <Button className="flex-1 gap-2" size="default" onClick={() => { setFindingMatches(true); navigate(`/app/request/${parsed.id}/matches`); }} disabled={findingMatches}>
                  {findingMatches ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Find available vehicles
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
