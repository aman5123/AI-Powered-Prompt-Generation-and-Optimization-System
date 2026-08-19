import dotenv from 'dotenv';
dotenv.config();

import * as gemini from './providers/geminiProvider.js';
import * as openrouter from './providers/openrouterProvider.js';
import * as groq from './providers/groqProvider.js';
import * as mistral from './providers/mistralProvider.js';
import * as cohere from './providers/cohereProvider.js';

// ─── Registry ───────────────────────────────────────────────────────────────

const REGISTRY = { gemini, openrouter, groq, mistral, cohere };

// Available models exposed per provider (for the UI)
export const ALL_PROVIDER_MODELS = Object.fromEntries(
  Object.entries(REGISTRY).map(([name, mod]) => [name, mod.AVAILABLE_MODELS])
);

// ─── Build ordered provider list from env ───────────────────────────────────

const PROVIDER_ORDER_ENV = process.env.PROVIDER_ORDER || 'gemini,openrouter,groq,mistral,cohere';
const COOLDOWN_MS = parseInt(process.env.PROVIDER_COOLDOWN_MS || '60000', 10);

const orderedProviders = PROVIDER_ORDER_ENV
  .split(',')
  .map(name => name.trim().toLowerCase())
  .filter(name => REGISTRY[name])
  .map(name => REGISTRY[name]);

// ─── Exhaustion state (in-memory, resets on server restart) ─────────────────

// Map<providerName, { exhaustedAt: number, lastError: string }>
const exhaustedMap = new Map();

function isExhausted(name) {
  const entry = exhaustedMap.get(name);
  if (!entry) return false;
  if (Date.now() - entry.exhaustedAt > COOLDOWN_MS) {
    exhaustedMap.delete(name); // cool-down expired, reset
    return false;
  }
  return true;
}

function markExhausted(name, errorMsg) {
  exhaustedMap.set(name, { exhaustedAt: Date.now(), lastError: errorMsg });
  console.warn(`[ProviderManager] ⚠️  Provider "${name}" marked exhausted. Will retry after ${COOLDOWN_MS / 1000}s. Error: ${errorMsg}`);
}

// ─── Rate limit detection ────────────────────────────────────────────────────

function isRateLimitOrAuthError(err) {
  const status = err.status || err.code;
  const msg = (err.message || '').toLowerCase();
  return (
    status === 429 ||
    status === 401 ||
    status === 403 ||
    status === 503 ||
    status === 404 ||   // model not found / deprecated
    // 400 with key or model issues should also fall through
    (status === 400 && (
      msg.includes('api key') ||
      msg.includes('api_key_invalid') ||
      msg.includes('invalid_argument') ||
      msg.includes('decommissioned') ||
      msg.includes('no longer supported') ||
      msg.includes('no longer available')
    )) ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('exceeded') ||
    msg.includes('unauthorized') ||
    msg.includes('invalid api key') ||
    msg.includes('api key not valid') ||
    msg.includes('too many requests') ||
    msg.includes('service_unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('missing authentication') ||
    msg.includes('no longer available') ||
    msg.includes('not_found') ||
    msg.includes('model not found') ||
    msg.includes('decommissioned') ||
    msg.includes('no longer supported') ||
    msg.includes('no endpoints found')
  );
}

// ─── Core fallback call ──────────────────────────────────────────────────────

/**
 * Call AI with automatic provider fallback.
 *
 * @param {Array<{role: string, content: string}>} messages  Standard message array
 * @param {Object} options
 * @param {string}  [options.model]           Override model name
 * @param {number}  [options.temperature]     0–1
 * @param {string}  [options.responseFormat]  'json' | undefined
 * @param {string}  [options.providerOverride] Force a specific provider name
 * @returns {Promise<{ text: string, provider: string, model: string }>}
 */
export async function callWithFallback(messages, options = {}) {
  let providerList = [...orderedProviders];

  // If user pinned a provider, try it first
  if (options.providerOverride) {
    const override = REGISTRY[options.providerOverride.toLowerCase()];
    if (override) {
      providerList = [override, ...providerList.filter(p => p !== override)];
    }
  }

  const errors = [];

  for (const provider of providerList) {
    const name = provider.PROVIDER_NAME;

    if (!provider.isConfigured()) {
      errors.push(`${name}: not configured (missing API key)`);
      continue;
    }

    if (isExhausted(name)) {
      const entry = exhaustedMap.get(name);
      const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - entry.exhaustedAt)) / 1000);
      errors.push(`${name}: cooling down (${remaining}s remaining)`);
      continue;
    }

    try {
      const model = options.model || process.env[`${name.toUpperCase()}_MODEL`] || provider.AVAILABLE_MODELS[0]?.id;
      console.log(`[ProviderManager] 🔁 Trying provider: ${name} (model: ${model})`);

      const text = await provider.call(messages, { ...options, model });
      console.log(`[ProviderManager] ✅ Success with provider: ${name}`);
      return { text, provider: name, model };

    } catch (err) {
      if (isRateLimitOrAuthError(err)) {
        markExhausted(name, err.message);
        errors.push(`${name}: rate limited / auth error — ${err.message}`);
      } else {
        // Non-rate-limit error (network, parse, etc.) — still try next
        errors.push(`${name}: unexpected error — ${err.message}`);
        console.error(`[ProviderManager] ❌ Provider "${name}" failed:`, err.message);
      }
    }
  }

  // All providers exhausted or failed
  const summary = errors.join(' | ');
  const finalErr = new Error(`All AI providers failed or are exhausted. Errors: ${summary}`);
  finalErr.providerErrors = errors;
  throw finalErr;
}

// ─── Status for the API endpoint / UI ───────────────────────────────────────

export function getStatus() {
  return orderedProviders.map(provider => {
    const name = provider.PROVIDER_NAME;
    const configured = provider.isConfigured();
    const exhausted = isExhausted(name);
    const entry = exhaustedMap.get(name);

    let status = 'active';
    if (!configured) status = 'unconfigured';
    else if (exhausted) status = 'cooling';

    return {
      name,
      status,
      configured,
      models: provider.AVAILABLE_MODELS,
      defaultModel: process.env[`${name.toUpperCase()}_MODEL`] || provider.AVAILABLE_MODELS[0]?.id,
      cooldownMs: COOLDOWN_MS,
      ...(exhausted && entry
        ? {
            exhaustedAt: new Date(entry.exhaustedAt).toISOString(),
            resetsIn: Math.max(0, Math.ceil((COOLDOWN_MS - (Date.now() - entry.exhaustedAt)) / 1000)),
            lastError: entry.lastError,
          }
        : {}),
    };
  });
}
