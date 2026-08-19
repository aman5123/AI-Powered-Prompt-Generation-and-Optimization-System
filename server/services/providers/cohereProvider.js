import dotenv from 'dotenv';
dotenv.config();

export const PROVIDER_NAME = 'cohere';
const BASE_URL = 'https://api.cohere.com/v2/chat';

export const AVAILABLE_MODELS = [
  { id: 'command-r', label: 'Command R (free trial)' },
  { id: 'command-r-plus', label: 'Command R+ (advanced, free trial)' },
  { id: 'command-light', label: 'Command Light (fastest)' },
];

export function isConfigured() {
  return !!process.env.COHERE_API_KEY;
}

/**
 * Call Cohere v2 chat API.
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options - { model, temperature, responseFormat }
 * @returns {Promise<string>}
 */
export async function call(messages, options = {}) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error('[Cohere] COHERE_API_KEY is not set.');

  const model = options.model || process.env.COHERE_MODEL || 'command-r';

  // Cohere v2 uses the same message format (role: user/assistant/system)
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
    const err = new Error(`[Cohere] HTTP ${res.status}: ${errText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  // Cohere v2 returns message.content[0].text
  const content =
    data.message?.content?.[0]?.text ||
    data.choices?.[0]?.message?.content;
  if (!content) throw new Error('[Cohere] Empty response from API');
  return content;
}
