import dotenv from 'dotenv';
dotenv.config();

export const PROVIDER_NAME = 'openrouter';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const AVAILABLE_MODELS = [
  { id: 'google/gemma-2-9b-it:free', label: 'Gemma 2 9B IT (free)' },
  { id: 'qwen/qwen-2-7b-instruct:free', label: 'Qwen 2 7B Instruct (free)' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', label: 'Llama 3.2 3B Instruct (free)' },
  { id: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 (free)' },
  { id: 'microsoft/phi-3-mini-128k-instruct:free', label: 'Phi-3 Mini 128K (free)' },
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
