import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export const PROVIDER_NAME = 'gemini';

export const AVAILABLE_MODELS = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (free, stable)' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite (fast, free)' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash (fastest, free)' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash Latest' },
];

/**
 * Returns true if this provider is configured (API key present).
 */
export function isConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Call the Gemini API.
 * @param {Array<{role: string, content: string}>} messages - Standard message array
 * @param {Object} options - { model, temperature, responseFormat, systemInstruction }
 * @returns {Promise<string>} - Text response
 */
export async function call(messages, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('[Gemini] GEMINI_API_KEY is not set.');

  const ai = new GoogleGenAI({ apiKey });
  const model = options.model || process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  // Build contents string from messages
  const userMessages = messages.filter(m => m.role !== 'system');
  const systemMsg = messages.find(m => m.role === 'system');

  const contents = userMessages.map(m => m.content).join('\n');

  const config = {
    temperature: options.temperature ?? 0.7,
  };
  if (systemMsg) config.systemInstruction = systemMsg.content;
  if (options.responseFormat === 'json') config.responseMimeType = 'application/json';

  try {
    const response = await ai.models.generateContent({ model, contents, config });
    return response.text;
  } catch (err) {
    // The @google/genai SDK stores HTTP status in err.status or inside err.message as JSON
    // Extract it so providerManager.isRateLimitOrAuthError() can act on it
    if (!err.status) {
      const match = err.message?.match(/"code":(\d+)/);
      if (match) err.status = parseInt(match[1], 10);
    }
    throw err;
  }
}
