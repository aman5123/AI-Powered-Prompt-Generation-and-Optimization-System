import express from 'express';
import { optimizePrompt, executePrompt, compareResponses, testGeminiConnection } from '../services/geminiService.js';

const router = express.Router();

// In-memory array to replace MongoDB
let historyDB = [];
let nextId = 1;

// Get all history
router.get('/history', (req, res) => {
  res.json([...historyDB].reverse());
});

// Get specific history item
router.get('/history/:id', (req, res) => {
  const item = historyDB.find(i => i._id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'History item not found' });
  }
  res.json(item);
});

// Delete history item
router.delete('/history/:id', (req, res) => {
  historyDB = historyDB.filter(i => i._id !== req.params.id);
  res.json({ success: true });
});

// Test Gemini API connection
router.get('/test-gemini', async (req, res) => {
  const result = await testGeminiConnection();
  if (result.success) {
    res.json({ status: 'success', message: 'Gemini API is successfully connected!', response: result.message });
  } else {
    res.status(500).json({ status: 'error', message: 'Failed to connect to Gemini API', details: result.error });
  }
});

// Main process endpoint
router.post('/prompts/process', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // 1. Analyze, Optimize, and Score
    const optimizationResult = await optimizePrompt(prompt);

    // 2. Execute both prompts sequentially to reduce rate limit spikes
    const originalResponseText = await executePrompt(prompt);
    const optimizedResponseText = await executePrompt(optimizationResult.optimizedPrompt);

    // 3. Compare responses
    const comparisonResult = await compareResponses(
      prompt,
      originalResponseText,
      optimizedResponseText
    );

    // 4. Save to In-Memory Database
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
      createdAt: new Date().toISOString()
    };

    historyDB.push(historyEntry);

    res.json(historyEntry);
  } catch (error) {
    console.error('Error processing prompt:', error);
    res.status(500).json({ error: 'An error occurred while processing the prompt.', details: error.message });
  }
});

export default router;
