/**
 * Mock LLM adapter for local dev.
 * - Returns deterministic structured JSON and costEstimateUSD: 0
 * - No external network calls.
 *
 * Exposed functions:
 *   rewriteBullets({ bullets: [string] }) => { rewritten: [string], costEstimateUSD: 0 }
 *   generateSummary({ resume }) => { summary: "...", costEstimateUSD: 0 }
 *   atsSuggest({ resume }) => { score: 0-100, suggestions: [...] , costEstimateUSD: 0 }
 */

function rewriteBullets({ bullets = [] } = {}) {
  // very small deterministic rewrite: append "(improved)" and shorten to 120 chars
  const rewritten = bullets.map((b, i) => {
    const s = String(b || '').trim();
    const short = s.length > 120 ? s.slice(0, 117) + '...' : s;
    return `${short} (improved)`;
  });
  return { ok: true, rewritten, costEstimateUSD: 0 };
}

function generateSummary({ resume = {} } = {}) {
  // basic deterministic summary: take name/company/top bullets if present
  const name = resume.name || resume.basics?.name || null;
  const top = (resume.experience && resume.experience[0] && resume.experience[0].summary) || null;
  const summary = name ? `${name} — ${top || 'Experienced professional.'}` : (top || 'Experienced professional.');
  return { ok: true, summary, costEstimateUSD: 0 };
}

function atsSuggest({ resume = {} } = {}) {
  // naive scoring based on presence of fields
  let score = 50;
  const suggestions = [];
  if (!resume.name && !resume.basics?.name) { suggestions.push('Add a name or identifier at the top.'); score -= 10; }
  if (!resume.experience || resume.experience.length === 0) { suggestions.push('Add at least one work experience entry.'); score -= 20; }
  if (!resume.skills || resume.skills.length === 0) { suggestions.push('Add a skills section with relevant keywords.'); score -= 10; }
  if (score < 0) score = 0;
  return { ok: true, score, suggestions, costEstimateUSD: 0 };
}

module.exports = { rewriteBullets, generateSummary, atsSuggest };
