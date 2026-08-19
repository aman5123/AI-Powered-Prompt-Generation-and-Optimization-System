import { callWithFallback } from './providerManager.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a standard messages array from a system instruction + user content.
 */
function buildMessages(systemInstruction, userContent) {
  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: userContent });
  return messages;
}

// ─── Public Functions ─────────────────────────────────────────────────────────

/**
 * Quick connectivity test using the active provider.
 */
export async function testGeminiConnection(providerOverride, modelOverride) {
  try {
    const messages = [{ role: 'user', content: "Respond with exactly: 'API is working!'" }];
    const result = await callWithFallback(messages, {
      providerOverride,
      model: modelOverride,
      temperature: 0.1,
    });
    return { success: true, message: result.text, provider: result.provider, model: result.model };
  } catch (error) {
    console.error('AI Connection Test Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Analyzes, optimizes, and scores a prompt in a single AI call.
 * @param {string} originalPrompt
 * @param {string} [providerOverride]
 * @param {string} [modelOverride]
 */
export async function optimizePrompt(originalPrompt, providerOverride, modelOverride) {
  const systemInstruction = `You are an expert AI prompt engineer. Your task is to analyze, optimize, and score the user's prompt. 
You must return a valid JSON object matching this schema exactly:
{
  "analysis": {
    "objective": "string",
    "context": "string",
    "audience": "string",
    "tone": "string",
    "weaknesses": ["string"],
    "missingInformation": ["string"]
  },
  "optimizedPrompt": "string (the final optimized prompt ready to be used)",
  "improvements": ["string"],
  "assumptions": ["string"],
  "promptScores": {
    "original": number (0-100),
    "optimized": number (0-100)
  }
}

Rules:
- Preserve the user's original intent.
- Do not change the requested task.
- Improve clarity, specificity, context, structure and useful constraints.
- Calculate the score based on clarity, specificity, context, constraints, and output structure.
- Return ONLY the JSON object, no markdown fences, no extra text.`;

  const messages = buildMessages(systemInstruction, originalPrompt);

  const result = await callWithFallback(messages, {
    providerOverride,
    model: modelOverride,
    temperature: 0.2,
    responseFormat: 'json',
  });

  try {
    // Strip markdown fences if any provider wraps the JSON
    const cleaned = result.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    parsed.promptScores.improvement = parsed.promptScores.optimized - parsed.promptScores.original;
    return { ...parsed, _meta: { provider: result.provider, model: result.model } };
  } catch (error) {
    console.error('Error parsing optimizePrompt response:', result.text);
    throw new Error('Failed to parse AI response as JSON. Raw: ' + result.text.slice(0, 200));
  }
}

/**
 * Executes a prompt and returns the response text.
 * @param {string} promptText
 * @param {string} [providerOverride]
 * @param {string} [modelOverride]
 */
export async function executePrompt(promptText, providerOverride, modelOverride) {
  const messages = [{ role: 'user', content: promptText }];
  const result = await callWithFallback(messages, {
    providerOverride,
    model: modelOverride,
    temperature: 0.7,
  });
  return result.text;
}

/**
 * Compares two responses based on the original intent.
 * @param {string} originalPrompt
 * @param {string} originalResponse
 * @param {string} optimizedResponse
 * @param {string} [providerOverride]
 * @param {string} [modelOverride]
 */
export async function compareResponses(originalPrompt, originalResponse, optimizedResponse, providerOverride, modelOverride) {
  const systemInstruction = `You are an AI quality evaluator. Compare two AI responses and return a valid JSON object only — no markdown, no extra text.`;

  const userContent = `Compare two AI responses generated from the same underlying intent but different prompt formulations.

Original Intent: "${originalPrompt}"

Original Response:
"""
${originalResponse}
"""

Optimized Response:
"""
${optimizedResponse}
"""

Evaluate both responses and return a JSON object matching this schema exactly:
{
  "relevance": "string (brief comparison of relevance)",
  "completeness": "string (brief comparison of completeness)",
  "structure": "string (brief comparison of structure/formatting)",
  "instructionFollowing": "string (brief comparison of how well instructions were followed)",
  "requirementCoverage": "string (brief comparison of requirement coverage)",
  "overall": "string (overall summary of which response is better and why)",
  "keyImprovements": ["string"],
  "keyWeaknesses": ["string"],
  "originalScore": number (0-100),
  "optimizedScore": number (0-100)
}`;

  const messages = buildMessages(systemInstruction, userContent);

  const result = await callWithFallback(messages, {
    providerOverride,
    model: modelOverride,
    temperature: 0.1,
    responseFormat: 'json',
  });

  try {
    const cleaned = result.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return { ...JSON.parse(cleaned), _meta: { provider: result.provider, model: result.model } };
  } catch (error) {
    console.error('Error parsing compareResponses response:', result.text);
    throw new Error('Failed to parse AI comparison response as JSON.');
  }
}
