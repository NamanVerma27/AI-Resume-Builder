// backend/src/services/atsService.js
// Simple deterministic ATS scoring for local/dev use.
// Returns an object: { ok:true, score: 0-100, suggestions: [..], details: {...} }

const KEY_SKILLS = [
  'javascript','node.js','node','python','java','sql','react','aws','docker','kubernetes',
  'rest','graphql','typescript','go','c++','c#'
];

function normalize(s) {
  if (!s) return '';
  return String(s).toLowerCase();
}

function countMatches(text, keywords) {
  if (!text) return 0;
  const norm = normalize(text);
  let count = 0;
  for (const k of keywords) {
    if (!k) continue;
    // count presence once per keyword (not occurrences) — this yields a stable keyword match count
    if (norm.includes(k)) count++;
  }
  return count;
}

function scoreResume(resume = {}) {
  // Defensive defaults
  const name = resume.name || '';
  const summary = resume.summary || '';
  const experiences = Array.isArray(resume.experience) ? resume.experience : (resume.experiences || []);
  const skills = Array.isArray(resume.skills) ? resume.skills : [];

  // Components / normalizations
  const lenSummaryWords = Math.max(0, normalize(summary).trim() ? normalize(summary).split(/\s+/).length : 0);
  // cap summary influence by treating long summaries proportionally (we'll map words -> [0..100])
  const lenSummary = Math.min(100, lenSummaryWords);

  const numExp = Math.min(10, experiences.length); // up to 10

  // skillMatches: number of KEY_SKILLS present across summary+skills
  const skillMatchesFromSkills = countMatches(skills.join(' '), KEY_SKILLS);
  const skillMatchesFromSummary = countMatches(summary, KEY_SKILLS);
  const skillMatches = Math.min(KEY_SKILLS.length, skillMatchesFromSkills + skillMatchesFromSummary);

  // WEIGHTS (adjusted)
  // summaryWeightPct = 20%, experienceWeightPct = 30%, skillsWeightPct = 50%
  const SUMMARY_WEIGHT = 20; // percent
  const EXP_WEIGHT = 30;
  const SKILLS_WEIGHT = 50;

  // Score components scaled to their weight
  const sSummary = Math.round((lenSummary / 100) * SUMMARY_WEIGHT);
  const sExp = Math.round((numExp / 10) * EXP_WEIGHT);
  const sSkills = Math.round((skillMatches / KEY_SKILLS.length) * SKILLS_WEIGHT);

  let rawScore = sSummary + sExp + sSkills;
  rawScore = Math.min(100, Math.max(0, rawScore));

  // Suggestions (kept simple)
  const suggestions = [];
  if (!name) suggestions.push('Add your full name.');
  if (!summary || lenSummaryWords < 10) suggestions.push('Write a short professional summary (2–3 sentences).');
  if (numExp === 0) suggestions.push('Add at least one work experience entry with measurable accomplishments.');
  if (skills.length === 0) suggestions.push('Add a skills section - include relevant keywords like Node.js, SQL, React.');
  if (skillMatches === 0) suggestions.push('Include industry keywords that match the job description.');

  const details = {
    lenSummary: lenSummaryWords,
    numExp,
    skillMatches,
    sSummary, sExp, sSkills
  };

  return { ok: true, score: rawScore, suggestions, details };
}

module.exports = { scoreResume };
