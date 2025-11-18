// backend/src/adapters/llm/gemini.js
// Google Gemini adapter (safe-by-default).
// - Supports API key auth: set GEMINI_API_KEY
// - Uses the v1beta:generateContent endpoint.
// - Returns simulated responses if no key is found.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
// Use the model name *without* 'models/' prefix for gemini-1.0-pro
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.0-pro'; 
const GEMINI_ENDPOINT_BASE = process.env.GEMINI_ENDPOINT_BASE || 'https://generativelanguage.googleapis.com/v1beta';

// --- This is the main fix ---
// Constructs the correct URL, e.g.:
// https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=...
const API_URL = `${GEMINI_ENDPOINT_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
// --- End fix ---

async function callGemini(prompt, maxTokens = 256, temperature = 0.0) {
  // If no credentials, don't attempt network call — simulate.
  if (!GEMINI_API_KEY) {
    // simulated output
    return { ok: true, text: `(Gemini simulated) ${prompt.slice(0, 300)}`, raw: null, costEstimateUSD: 0 };
  }

  // --- This is the second fix ---
  // Updated request body for the :generateContent API
  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
    }
  };
  // --- End fix ---

  const headers = {
    'Content-Type': 'application/json'
  };

  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    return { ok: false, error: 'network_error', message: err.message };
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    return { ok: false, error: 'parse_error', message: e.message, status: res.status };
  }

  if (!res.ok) {
    // pass provider error along
    return { ok: false, error: 'gemini_error', status: res.status, provider: json, message: json?.error?.message || 'Gemini returned an error' };
  }

  // --- This is the third fix ---
  // Parse the modern :generateContent response structure
  let text = '';
  try {
    text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (e) {
    // ignore parse error, text will be empty
  }
  // --- End fix ---

  text = (text || '').toString().trim();

  return { ok: true, text, raw: json, costEstimateUSD: 0 };
}

// Adapter functions (Prompts are updated for Gemini)

async function generateSummary({ resume }) {
  const experience = (resume.experience || []).map(e => `- ${e.summary || ''}`).join('\n');
  const prompt = `Write a concise 1-2 sentence professional summary for ${resume.name || ''} using these experience snippets:\n${experience}\nReturn only the summary.`;
  const r = await callGemini(prompt, 200, 0.0);
  if (!r.ok) return r;
  return { ok: true, summary: r.text, costEstimateUSD: r.costEstimateUSD, raw: r.raw };
}

async function rewriteBullets({ bullets = [] }) {
  // Updated prompt to ask for a JSON array, which is more robust
  const prompt = `Rewrite these resume bullets to be achievement-oriented, concise, and include metrics where appropriate:\n${bullets.join('\n')}\nReturn a single JSON array of the rewritten bullets.`;
  const r = await callGemini(prompt, 300, 0.0);
  if (!r.ok) return r;

  // Try to parse JSON array from model
  const text = r.text.replace(/```(json)?/g, '').trim(); // Clean up markdown fences
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return { ok: true, rewritten: parsed, costEstimateUSD: r.costEstimateUSD, raw: r.raw };
    }
  } catch (e) {
    // fallback: if parse fails, split by lines
  }
  
  const lines = (r.text || '').split(/\r?\n/).map(s => s.trim().replace(/^- /,'')).filter(Boolean);
  return { ok: true, rewritten: lines, costEstimateUSD: r.costEstimateUSD, raw: r.raw };
}

async function atsSuggestion({ resume }) {
  // Updated prompt to ensure JSON-only output
  const prompt = `You are an ATS analyst. Given this resume JSON: ${JSON.stringify(resume, null, 2)}\nReturn *only* a valid JSON object (no markdown) with this shape: { "score": <0-100>, "suggestions": ["..."] }`;
  const r = await callGemini(prompt, 200, 0.0);
  if (!r.ok) return r;
  
  const text = r.text.replace(/```(json)?/g, '').trim(); // Clean up markdown fences
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return { ok: true, ...parsed, costEstimateUSD: r.costEstimateUSD, raw: r.raw };
    }
  } catch (e) {
    // fallback
  }
  
  return { ok: true, score: 0, suggestions: ['Parser could not extract JSON from model output'], costEstimateUSD: r.costEstimateUSD, raw: r.raw };
}

module.exports = { generateSummary, rewriteBullets, atsSuggestion };