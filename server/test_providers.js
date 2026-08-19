// Quick end-to-end test: calls /api/prompts/process and prints result summary
import fetch from 'node-fetch'; // or native fetch (Node 18+)

const BASE = 'http://localhost:5001/api';

async function main() {
  console.log('\n🔍 Testing providers/status...');
  const statusRes = await fetch(`${BASE}/providers/status`);
  const statuses = await statusRes.json();
  for (const p of statuses) {
    const icon = p.status === 'active' ? '🟢' : p.status === 'cooling' ? '🟡' : '⚫';
    console.log(`  ${icon} ${p.name.padEnd(12)} status=${p.status}  model=${p.defaultModel}`);
  }

  console.log('\n🔬 Testing prompt processing (may take 10-30s)...');
  const start = Date.now();
  const res = await fetch(`${BASE}/prompts/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Write a short poem about the moon' }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('❌ Error:', err);
    return;
  }

  const data = await res.json();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n✅ Success in ${elapsed}s!`);
  console.log(`  Provider used  : ${data.aiProvider}`);
  console.log(`  Model used     : ${data.aiModel}`);
  console.log(`  Original score : ${data.promptScores?.original}`);
  console.log(`  Optimized score: ${data.promptScores?.optimized}`);
  console.log(`  Improvement    : +${data.promptScores?.improvement}`);
  console.log(`\n  Optimized prompt:\n  ${data.optimizedPrompt?.slice(0, 150)}...`);
}

main().catch(console.error);
