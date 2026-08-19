import express from 'express';
import { optimizePrompt, executePrompt, compareResponses, testGeminiConnection } from '../services/geminiService.js';
import { getStatus, ALL_PROVIDER_MODELS } from '../services/providerManager.js';

const router = express.Router();

// ─── In-memory history store ──────────────────────────────────────────────────
let historyDB = [];
let nextId = 1;

// ─── History Routes ───────────────────────────────────────────────────────────

router.get('/history', (req, res) => {
  res.json([...historyDB].reverse());
});

router.get('/history/:id', (req, res) => {
  const item = historyDB.find(i => i._id === req.params.id);
  if (!item) return res.status(404).json({ error: 'History item not found' });
  res.json(item);
});

router.delete('/history/:id', (req, res) => {
  historyDB = historyDB.filter(i => i._id !== req.params.id);
  res.json({ success: true });
});

// ─── Provider Routes ──────────────────────────────────────────────────────────

/**
 * GET /api/providers/status
 * Returns real-time status of all configured providers.
 */
router.get('/providers/status', (req, res) => {
  res.json(getStatus());
});

/**
 * GET /api/providers/models
 * Returns available models per provider.
 */
router.get('/providers/models', (req, res) => {
  res.json(ALL_PROVIDER_MODELS);
});

// ─── Test Route ───────────────────────────────────────────────────────────────

/**
 * GET /api/test-gemini
 * Tests the active provider connection.
 */
router.get('/test-gemini', async (req, res) => {
  const result = await testGeminiConnection();
  if (result.success) {
    res.json({
      status: 'success',
      message: `Connected via ${result.provider} (${result.model})`,
      response: result.message,
      provider: result.provider,
      model: result.model,
    });
  } else {
    res.status(500).json({ status: 'error', message: 'Failed to connect to any AI provider', details: result.error });
  }
});

// ─── Main Process Route ───────────────────────────────────────────────────────

/**
 * POST /api/prompts/process
 * Body: { prompt: string, provider?: string, model?: string }
 *
 * Optional provider/model fields let the user override which AI to use.
 */
router.post('/prompts/process', async (req, res) => {
  const { prompt, provider: providerOverride, model: modelOverride } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // 1. Analyze, Optimize, and Score
    const optimizationResult = await optimizePrompt(prompt, providerOverride, modelOverride);

    // 2. Execute both prompts sequentially to reduce rate limit spikes
    const originalResponseText = await executePrompt(prompt, providerOverride, modelOverride);
    const optimizedResponseText = await executePrompt(
      optimizationResult.optimizedPrompt, providerOverride, modelOverride
    );

    // 3. Compare responses
    const comparisonResult = await compareResponses(
      prompt,
      originalResponseText,
      optimizedResponseText,
      providerOverride,
      modelOverride
    );

    // 4. Save to in-memory DB
    const historyEntry = {
      _id: (nextId++).toString(),
      originalPrompt: prompt,
      analysis: optimizationResult.analysis,
      optimizedPrompt: optimizationResult.optimizedPrompt,
      improvements: optimizationResult.improvements,
      assumptions: optimizationResult.assumptions,
      promptScores: optimizationResult.promptScores,
      originalResponse: originalResponseText,
      optimizedResponse: optimizedResponseText,
      responseComparison: {
        relevance: comparisonResult.relevance,
        completeness: comparisonResult.completeness,
        structure: comparisonResult.structure,
        instructionFollowing: comparisonResult.instructionFollowing,
        requirementCoverage: comparisonResult.requirementCoverage,
        overall: comparisonResult.overall,
        keyImprovements: comparisonResult.keyImprovements,
        keyWeaknesses: comparisonResult.keyWeaknesses,
      },
      responseImprovement: comparisonResult.optimizedScore - comparisonResult.originalScore,
      // Track which provider was actually used
      aiProvider: optimizationResult._meta?.provider || providerOverride || 'auto',
      aiModel: optimizationResult._meta?.model || modelOverride || 'auto',
      createdAt: new Date().toISOString(),
    };

    historyDB.push(historyEntry);
    res.json(historyEntry);

  } catch (error) {
    console.error('Error processing prompt:', error);
    res.status(500).json({
      error: 'An error occurred while processing the prompt.',
      details: error.message,
      providerErrors: error.providerErrors || [],
    });
  }
});

export default router;
