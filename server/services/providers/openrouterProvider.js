import dotenv from 'dotenv';
dotenv.config();

export const PROVIDER_NAME = 'openrouter';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const AVAILABLE_MODELS = [
  { id: 'liquid/lfm-2.5-2.6b:free', label: 'Liquid LFM 2.5 (free)' },
  { id: 'dots-studio/dots-3-note-preview:free', label: 'Dots Studio 3 (free)' },
  { id: 'nvidia/nemotron-3.5-lightning:free', label: 'NVIDIA Nemotron 3.5 (free)' },
  { id: 'cohere/north-mini-code:free', label: 'Cohere North Mini Code (free)' },
];

export function isConfigured() {
  return !!process.env.OPENROUTER_API_KEY;
}

/**
 * Call OpenRouter API (OpenAI-compatible format).
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options - { model, temperature, responseFormat }
 * @returns {Promise<string>}
 */
export async function call(messages, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('[OpenRouter] OPENROUTER_API_KEY is not set.');

  const model = options.model || process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';

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
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'PromptOptimizer',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`[OpenRouter] HTTP ${res.status}: ${errText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('[OpenRouter] Empty response from API');
  return content;
}
