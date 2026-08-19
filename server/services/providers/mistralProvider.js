import dotenv from 'dotenv';
dotenv.config();

export const PROVIDER_NAME = 'mistral';
const BASE_URL = 'https://api.mistral.ai/v1/chat/completions';

export const AVAILABLE_MODELS = [
  { id: 'mistral-small-latest', label: 'Mistral Small (free Experiment plan)' },
  { id: 'open-mistral-7b', label: 'Open Mistral 7B (free Experiment plan)' },
  { id: 'open-mixtral-8x7b', label: 'Open Mixtral 8x7B (free Experiment plan)' },
  { id: 'mistral-medium-latest', label: 'Mistral Medium' },
];

export function isConfigured() {
  return !!process.env.MISTRAL_API_KEY;
}

/**
 * Call Mistral AI API.
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options - { model, temperature, responseFormat }
 * @returns {Promise<string>}
 */
export async function call(messages, options = {}) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('[Mistral] MISTRAL_API_KEY is not set.');

  const model = options.model || process.env.MISTRAL_MODEL || 'mistral-small-latest';

  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
  };

  if (options.responseFormat === 'json') {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`[Mistral] HTTP ${res.status}: ${errText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('[Mistral] Empty response from API');
  return content;
}
