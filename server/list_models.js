import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

async function listAllModels() {
  console.log('=== 1. Discovering Available Gemini Models ===');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    if (data.models) {
      const generateModels = data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      console.log('  Available Gemini models:', generateModels);
    } else {
      console.log('  Gemini error:', data);
    }
  } catch(e) { console.log('  Error:', e.message); }

  console.log('\n=== 2. Discovering Available OpenRouter Free Models ===');
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    const data = await res.json();
    if (data.data) {
      const freeModels = data.data
        .filter(m => m.id.endsWith(':free') || m.pricing?.prompt === '0')
        .map(m => m.id);
      console.log('  Available OpenRouter free models:', freeModels.slice(0, 10));
    }
  } catch(e) { console.log('  Error:', e.message); }

  console.log('\n=== 3. Discovering Available Groq Models ===');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const data = await res.json();
    if (data.data) {
      const groqModels = data.data.map(m => m.id);
      console.log('  Available Groq models:', groqModels);
    } else {
      console.log('  Groq error:', data);
    }
  } catch(e) { console.log('  Error:', e.message); }
}

listAllModels();
