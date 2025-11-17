// backend/src/adapters/llm/openai.js
// Live OpenAI adapter (server-side).
// - Requires: process.env.OPENAI_API_KEY
// - Uses Node's global fetch (Node >= 18).
// - Returns structured JSON consistent with mock: { ok, summary|rewritten|score, costEstimateUSD, raw }

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // default model

function missingKey() {
  if (!OPENAI_KEY) {
    return { ok: false, error: 'openai_api_key_missing', message: 'Set OPENAI_API_KEY in the backend environment.' };
  }
  return null;
}

async function callOpenAI(messages, maxTokens = 256, temperature = 0.0) {
  // require key present
  const m = missingKey();
  if (m) return m;

  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: OPENAI_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const status = res.status;
  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new Error(`OpenAI response parse failed: ${err.message}`);
  }

  if (!res.ok) {
    // propagate provider error in structured way
    return { ok: false, error: 'openai_error', status, provider: json, message: json?.error?.message || 'OpenAI returned an error' };
  }

  // Grab assistant text (chat completion)
  const text = json?.choices?.[0]?.message?.content ?? '';

  // Cost estimate: not exact — placeholder 0 (you can implement token-based estimates later)
  const costEstimateUSD = 0;

  return { ok: true, text: text.trim(), raw: json, costEstimateUSD };
}

// Adapter functions expected by controllers

async function generateSummary({ resume }) {
  const mk = missingKey();
  if (mk) return mk;

  const experience = (resume.experience || []).map(e => `- ${e.summary || ''}`).join('\n');
  const system = 'You are a concise resume assistant that writes one-line professional summaries.';
  const user = `Write a short (1-2 sentence) professional summary/headline for the candidate with name "${resume.name || ''}". Use these experience snippets:\n${experience}\nReturn only the summary string.`;

  const r = await callOpenAI([{ role: 'system', content: system }, { role: 'user', content: user }], 200, 0.0);
  if (!r.ok) return r;

  return { ok: true, summary: r.text, costEstimateUSD: r.costEstimateUSD, raw: r.raw };
}

async function rewriteBullets({ bullets = [] }) {
  const mk = missingKey();
  if (mk) return mk;

  const system = 'You rewrite resume bullets to be achievement-oriented, concise, and include metrics where appropriate.';
  const user = `Rewrite the following bullets (one per line). Return a JSON array of rewritten bullets.\n\n${bullets.join('\n')}`;

  const r = await callOpenAI([{ role: 'system', content: system }, { role: 'user', content: user }], 300, 0.0);
  if (!r.ok) return r;

  // Try to parse JSON array from model; if not parseable, fall back to line-splitting.
  const text = r.text;
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return { ok: true, rewritten: parsed, costEstimateUSD: r.costEstimateUSD, raw: r.raw };
    }
  } catch (e) {
    // ignore parse error
  }

  // fallback: split lines
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  return { ok: true, rewritten: lines, costEstimateUSD: r.costEstimateUSD, raw: r.raw };
}

async function atsSuggestion({ resume }) {
  const mk = missingKey();
  if (mk) return mk;

  const system = 'You are an ATS consultant. Return JSON only: { "score": <0-100>, "suggestions": ["...","...","..."] }';
  const user = `Given this resume JSON: ${JSON.stringify(resume, null, 2)}\nReturn a small JSON object with score and suggestions.`;

  const r = await callOpenAI([{ role: 'system', content: system }, { role: 'user', content: user }], 200, 0.0);
  if (!r.ok) return r;

  try {
    const parsed = JSON.parse(r.text);
    return { ok: true, ...parsed, costEstimateUSD: r.costEstimateUSD, raw: r.raw };
  } catch (e) {
    // If parse failed, return a friendly default
    return { ok: true, score: 0, suggestions: ['Could not parse provider output'], costEstimateUSD: r.costEstimateUSD, raw: r.raw };
  }
}

module.exports = {
  generateSummary,
  rewriteBullets,
  atsSuggestion
};
