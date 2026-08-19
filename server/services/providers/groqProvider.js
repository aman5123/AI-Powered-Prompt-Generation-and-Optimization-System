import dotenv from 'dotenv';
dotenv.config();

export const PROVIDER_NAME = 'groq';
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const AVAILABLE_MODELS = [
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (fast, free)' },
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (free)' },
  { id: 'groq/compound', label: 'Groq Compound (free)' },
  { id: 'qwen/qwen3.6-27b', label: 'Qwen 3.6 27B (free)' },
];

export function isConfigured() {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Call Groq API (OpenAI-compatible format).
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options - { model, temperature, responseFormat }
 * @returns {Promise<string>}
 */
export async function call(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('[Groq] GROQ_API_KEY is not set.');

  const model = options.model || process.env.GROQ_MODEL || 'llama3-8b-8192';

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
    const err = new Error(`[Groq] HTTP ${res.status}: ${errText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('[Groq] Empty response from API');
  return content;
}
