// backend/src/adapters/llm/prompts.js
// Small set of prompt templates and examples for adapters to use.
// Use simple placeholders ({{...}}) to insert content; adapters should sanitize.

const SUMMARY_PROMPT = `Write a short (1-2 sentence) professional summary for {{name}} using these experience snippets:
{{experience}}
Return a concise headline-style summary.`;

const REWRITE_PROMPT = `Rewrite the following resume bullets to be achievement-oriented, concise, and include metrics if possible:
{{bullets}}`;

const ATS_PROMPT = `Given the resume JSON below, produce:
- a numeric ATS-style score (0-100),
- 3 short suggestions to improve ATS match,
Return JSON only.

Resume:
{{resume}}
`;

module.exports = { SUMMARY_PROMPT, REWRITE_PROMPT, ATS_PROMPT };
