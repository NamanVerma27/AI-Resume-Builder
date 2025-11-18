// backend/src/adapters/llm/cohere.js
// Cohere adapter (safe stub).
// - Default: returns a helpful missing-key error or a simulated response.
// - If you set COHERE_API_KEY and want to enable live calls, uncomment the fetch block below.
// - Adapter returns structured JSON similar to OpenAI mock: { ok: true/false, summary|rewritten|score, costEstimateUSD, raw }

const COHERE_KEY = process.env.COHERE_API_KEY || '';
const COHERE_MODEL = process.env.COHERE_MODEL || 'command-xsmall-nightly'; // example default

function missingKey() {
  if (!COHERE_KEY) {
    return { ok: false, error: 'cohere_api_key_missing', message: 'Set COHERE_API_KEY in backend env to enable Cohere.' };
  }
  return null;
}

// Internal helper: perform a real Cohere call (commented by default).
async function callCohere(prompt, maxTokens = 200, temperature = 0.0) {
  const mk = missingKey();
  if (mk) return mk;

  // Example: live call (COMMENTED). If you enable, ensure COHERE_API_KEY is set in backend.
  //
  // const url = 'https://api.cohere.ai/v1/generate';
  // const body = {
  //   model: COHERE_MODEL,
  //   prompt,
  //   max_tokens: maxTokens,
  //   temperature
  // };
  //
  // const res = await fetch(url, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${COHERE_KEY}`
  //   },
  //   body: JSON.stringify(body)
  // });
  // const json = await res.json();
  // if (!res.ok) return { ok: false, error: 'cohere_error', status: res.status, provider: json };
  // // Cohere returns text in json.generations[0].text usually
  // const text = json?.generations?.[0]?.text || '';
  // return { ok: true, text: text.trim(), raw: json, costEstimateUSD: 0 };

  // SAFE simulated response until live calls are enabled:
  return { ok: true, text: `(Cohere simulated) ${prompt.slice(0, 200)}`, raw: null, costEstimateUSD: 0.0 };
}

// Adapter functions

async function generateSummary({ resume }) {
  const mk = missingKey();
  if (mk) return mk;

  const experience = (resume.experience || []).map(e => `- ${e.summary || ''}`).join('\n');
  const prompt = `Write a short (1-2 sentence) professional headline for ${resume.name || ''}. Experience:\n${experience}`;
  const r = await callCohere(prompt, 200, 0.0);
  if (!r.ok) return r;
  return { ok: true, summary: r.text || r.text, costEstimateUSD: r.costEstimateUSD || 0, raw: r.raw };
}

async function rewriteBullets({ bullets = [] }) {
  const mk = missingKey();
  if (mk) return mk;
  const prompt = `Rewrite these bullets to be achievement-oriented and concise:\n${bullets.join('\n')}`;
  const r = await callCohere(prompt, 300, 0.0);
  if (!r.ok) return r;
  // best-effort: split lines on newlines if parsing not available
  const lines = (r.text || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  return { ok: true, rewritten: lines, costEstimateUSD: r.costEstimateUSD || 0, raw: r.raw };
}

async function atsSuggestion({ resume }) {
  const mk = missingKey();
  if (mk) return mk;
  const prompt = `Given resume JSON: ${JSON.stringify(resume, null, 2)}\nReturn JSON: {"score":<0-100>,"suggestions":["..."]}`;
  const r = await callCohere(prompt, 200, 0.0);
  if (!r.ok) return r;
  try {
    const parsed = JSON.parse(r.text);
    return { ok: true, ...parsed, costEstimateUSD: r.costEstimateUSD || 0, raw: r.raw };
  } catch (e) {
    return { ok: true, score: 0, suggestions: ['Could not parse provider output'], costEstimateUSD: r.costEstimateUSD || 0, raw: r.raw };
  }
}

module.exports = { generateSummary, rewriteBullets, atsSuggestion };
