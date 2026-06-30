import OpenAI from 'openai';

// ── Cargo types ────────────────────────────────────────────────────────────────
// Must stay in sync with vehicle_types.compatible_cargo_types values in the seed.
export const CARGO_TYPES = [
  'general', 'documents', 'electronics', 'clothing', 'fabric',
  'furniture', 'packaged_goods', 'perishable', 'pharmaceutical',
  'dairy', 'frozen_goods', 'machinery', 'construction_material',
  'steel', 'oversized', 'automotive', 'bulk', 'containers', 'hazardous',
] as const;

export type CargoType = (typeof CARGO_TYPES)[number];

export const SPECIAL_HANDLING_OPTIONS = ['refrigerated', 'hazmat'] as const;

export interface ParsedRequest {
  cargo_type: CargoType;
  weight_kg: number;
  pickup_location: string;
  drop_location: string;
  deadline: string; // ISO 8601 UTC
  special_handling: string[];
  clarification_needed: string | null;
}

// ── OpenAI client ─────────────────────────────────────────────────────────────
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// JSON Schema passed to the structured output API.
// strict: true requires every property in `required` and no extra keys.
// Nullable fields use anyOf — the type shorthand is not supported in strict mode.
const REQUEST_SCHEMA = {
  type: 'object',
  properties: {
    cargo_type: {
      type: 'string',
      enum: [...CARGO_TYPES],
    },
    weight_kg: { type: 'number' },
    pickup_location: { type: 'string' },
    drop_location: { type: 'string' },
    deadline: {
      type: 'string',
      description: 'Absolute UTC datetime in ISO 8601 format',
    },
    special_handling: {
      type: 'array',
      items: { type: 'string', enum: [...SPECIAL_HANDLING_OPTIONS] },
    },
    clarification_needed: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      description: 'Question for the dispatcher if any required field is ambiguous; null if everything is clear',
    },
  },
  required: [
    'cargo_type', 'weight_kg', 'pickup_location', 'drop_location',
    'deadline', 'special_handling', 'clarification_needed',
  ],
  additionalProperties: false,
} as const;

function buildSystemPrompt(now: Date): string {
  return `You are a freight dispatch assistant. Extract structured shipping details from the dispatcher's message.

Current date/time (UTC): ${now.toISOString()}
India Standard Time is UTC+05:30. Resolve relative times ("today 5pm", "by tomorrow morning") to absolute UTC ISO 8601 timestamps.

Rules:
- cargo_type: map the description to the closest enum value
- weight_kg: convert to kg if given in other units (1 tonne = 1000 kg)
- pickup_location / drop_location: use the name or area as stated
- special_handling: add "refrigerated" for temperature-sensitive/perishable cargo; add "hazmat" for dangerous/flammable/chemical goods; empty array otherwise
- clarification_needed: if any required field is missing or too ambiguous, write a concise question for the dispatcher; otherwise null`;
}

// Deterministic mock — used when OPENAI_API_KEY is unset or 'placeholder' (local dev)
function mockParsed(now: Date): ParsedRequest {
  return {
    cargo_type: 'general',
    weight_kg: 1000,
    pickup_location: 'Bhiwandi, Maharashtra',
    drop_location: 'Andheri, Mumbai',
    deadline: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
    special_handling: [],
    clarification_needed: null,
  };
}

// ── explainMatches types and helpers ─────────────────────────────────────────

export interface MatchForExplanation {
  rank: number;
  vehicle_number: string;
  vehicle_type: string;
  capacity_kg: number;
  driver_name: string;
  hours_worked_this_week: number;
  score: number;
  deadhead_km: number;
  eta_to_pickup_minutes: number;
  trip_km: number;
  cost_estimate: number;
  overtime_risk_hours: number;
}

export interface RequestForExplanation {
  cargo_type: string;
  weight_kg: number;
  pickup_location: string;
  drop_location: string;
  special_handling: string[];
}

const EXPLAIN_SYSTEM_PROMPT = `You are a freight dispatch assistant. For each ranked vehicle+driver match, write one explanation (1-2 sentences) telling the dispatcher WHY it ranked where it did.

Rules:
- Mention the vehicle number and driver name
- Lead with the most differentiating factor: proximity, cost, overtime risk, or vehicle capability
- Use practical numbers (e.g. "8 km away", "estimated ₹870"), not algorithm terms like "score" or "weight"
- Keep each explanation under 35 words
- Return exactly as many explanations as there are matches`;

function formatMatchesForPrompt(
  request: RequestForExplanation,
  matches: MatchForExplanation[],
): string {
  const cargo = [
    `${request.weight_kg} kg of ${request.cargo_type}`,
    `from ${request.pickup_location} to ${request.drop_location}`,
    request.special_handling.length ? `(${request.special_handling.join(', ')})` : '',
  ].filter(Boolean).join(' ');

  const matchLines = matches
    .map(m =>
      [
        `#${m.rank} — Score ${m.score}`,
        `  Vehicle: ${m.vehicle_number} (${m.vehicle_type}, ${m.capacity_kg} kg capacity)`,
        `  Driver: ${m.driver_name} — ${m.hours_worked_this_week}h worked this week`,
        `  Deadhead: ${m.deadhead_km} km | ETA to pickup: ${m.eta_to_pickup_minutes} min | Trip: ${m.trip_km} km`,
        `  Estimated cost: ₹${m.cost_estimate.toFixed(0)} | Overtime risk: ${m.overtime_risk_hours} h`,
      ].join('\n'),
    )
    .join('\n\n');

  return `Cargo: ${cargo}\n\n${matchLines}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function explainMatches(
  request: RequestForExplanation,
  matches: MatchForExplanation[],
): Promise<string[]> {
  if (matches.length === 0) return [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'placeholder') {
    return matches.map(
      m =>
        `${m.vehicle_number} with driver ${m.driver_name} is ${m.deadhead_km} km away — ` +
        `estimated cost ₹${m.cost_estimate.toFixed(0)}, ${m.overtime_risk_hours > 0 ? `${m.overtime_risk_hours}h overtime risk` : 'no overtime risk'}.`,
    );
  }

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3, // slight variation is fine for natural language
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'match_explanations',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            explanations: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['explanations'],
          additionalProperties: false,
        } as Record<string, unknown>,
      },
    },
    messages: [
      { role: 'system', content: EXPLAIN_SYSTEM_PROMPT },
      { role: 'user', content: formatMatchesForPrompt(request, matches) },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error('OpenAI returned an empty response for match explanations');

  const parsed = JSON.parse(content) as { explanations: string[] };

  // Guard against length mismatches — truncate extras, pad missing with empty string
  return Array.from({ length: matches.length }, (_, i) => parsed.explanations[i] ?? '');
}

export async function parseFreightRequest(rawText: string, now: Date): Promise<ParsedRequest> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'placeholder') {
    return mockParsed(now);
  }

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0, // deterministic extraction — no creativity needed
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'freight_request',
        strict: true,
        schema: REQUEST_SCHEMA as Record<string, unknown>,
      },
    },
    messages: [
      { role: 'system', content: buildSystemPrompt(now) },
      { role: 'user', content: rawText },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error('OpenAI returned an empty response');

  return JSON.parse(content) as ParsedRequest;
}
