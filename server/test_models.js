import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

async function testSelectedModels() {
  console.log('=== 1. Testing Selected Gemini Models ===');
  const geminiKey = process.env.GEMINI_API_KEY;
  for (const m of ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash']) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
      });
      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content) {
        console.log(`  ✅ Gemini model SUCCESS: ${m}`);
      } else {
        console.log(`  ❌ Gemini model failed (${m}):`, data.error?.message || data);
      }
    } catch(e) { console.log(`  ❌ Gemini error (${m}):`, e.message); }
  }

  console.log('\n=== 2. Testing Selected OpenRouter Models ===');
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  for (const m of ['liquid/lfm-2.5-2.6b:free', 'nvidia/nemotron-3.5-lightning:free']) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openrouterKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'hi' }] })
      });
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message) {
        console.log(`  ✅ OpenRouter model SUCCESS: ${m}`);
      } else {
        console.log(`  ❌ OpenRouter model failed (${m}):`, data.error?.message || data);
      }
    } catch(e) { console.log(`  ❌ OpenRouter error (${m}):`, e.message); }
  }

  console.log('\n=== 3. Testing Selected Groq Models ===');
  const groqKey = process.env.GROQ_API_KEY;
  for (const m of ['openai/gpt-oss-20b', 'groq/compound', 'qwen/qwen3.6-27b']) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'hi' }] })
      });
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message) {
        console.log(`  ✅ Groq model SUCCESS: ${m}`);
      } else {
        console.log(`  ❌ Groq model failed (${m}):`, data.error?.message || data);
      }
    } catch(e) { console.log(`  ❌ Groq error (${m}):`, e.message); }
  }
}

testSelectedModels();
