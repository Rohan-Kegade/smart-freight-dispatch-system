import { FormEvent, useState } from 'react';
import { api, ApiError } from '../../api';
import type { FreightRequest } from '../../types';

interface Props {
  onMatches: (request: FreightRequest) => void;
}

const EXAMPLES = [
  'Ship 2 tonnes of fabric from Bhiwandi warehouse to Andheri showroom by 5pm today.',
  'Need refrigerated truck for 500kg of dairy products, pickup Thane depot, deliver Pune cold storage, deadline tomorrow 9am.',
  'Urgent — 15,000kg steel beams from Navi Mumbai to Pune construction site, by 6pm today.',
];

export default function RequestForm({ onMatches }: Props) {
  const [rawText,        setRawText]        = useState('');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [clarification,  setClarification]  = useState('');
  const [parsedRequest,  setParsedRequest]  = useState<FreightRequest | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) return;
    setError('');
    setClarification('');
    setParsedRequest(null);
    setLoading(true);

    try {
      const { request } = await api.createRequest(rawText);
      setParsedRequest(request);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const data = err.data as { clarification_needed?: string };
        setClarification(data.clarification_needed ?? 'Please provide more details.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to process request');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleFindMatches() {
    if (!parsedRequest) return;
    setLoadingMatches(true);
    setError('');
    try {
      // Verify matches exist before navigating (handles empty fleet gracefully)
      await api.getMatches(parsedRequest.id);
      onMatches(parsedRequest);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to fetch matches');
    } finally {
      setLoadingMatches(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">New Dispatch Request</h2>
      <p className="text-gray-500 text-sm mb-6">
        Describe the shipment in plain language — the AI will extract the details.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          rows={5}
          placeholder="e.g. Need to move 3 tonnes of electronics from Bhiwandi to Andheri by 4pm today…"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        {/* Example prompts */}
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Try an example</p>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setRawText(ex); setClarification(''); setError(''); setParsedRequest(null); }}
              className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 truncate"
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !rawText.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors"
        >
          {loading ? 'Parsing request…' : 'Parse & Extract Details'}
        </button>
      </form>

      {/* Clarification needed */}
      {clarification && (
        <div className="mt-6 bg-amber-50 border border-amber-300 rounded-xl p-4">
          <p className="text-amber-800 font-medium text-sm mb-1">Clarification needed</p>
          <p className="text-amber-700 text-sm">{clarification}</p>
        </div>
      )}

      {/* General error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Parsed result */}
      {parsedRequest && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Extracted Details</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Confirmed
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Cargo type</dt>
              <dd className="font-medium text-gray-900 capitalize">{parsedRequest.cargo_type.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Weight</dt>
              <dd className="font-medium text-gray-900">{Number(parsedRequest.weight_kg).toLocaleString()} kg</dd>
            </div>
            <div>
              <dt className="text-gray-500">Pickup</dt>
              <dd className="font-medium text-gray-900">{parsedRequest.pickup_location}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Drop</dt>
              <dd className="font-medium text-gray-900">{parsedRequest.drop_location}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Deadline</dt>
              <dd className="font-medium text-gray-900">
                {new Date(parsedRequest.deadline).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </dd>
            </div>
            {parsedRequest.special_handling.length > 0 && (
              <div>
                <dt className="text-gray-500">Special handling</dt>
                <dd className="font-medium text-gray-900 capitalize">
                  {parsedRequest.special_handling.join(', ')}
                </dd>
              </div>
            )}
          </dl>

          <button
            onClick={handleFindMatches}
            disabled={loadingMatches}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors"
          >
            {loadingMatches ? 'Finding matches…' : 'Find Available Vehicles →'}
          </button>
        </div>
      )}
    </div>
  );
}
