// backend/src/adapters/llm/index.js
// Provider dispatcher: supports 'mock', 'openai', 'cohere', 'gemini'.
// Default: mock (safe for local dev).

const provider = (process.env.LLM_PROVIDER || 'mock').toLowerCase();

let adapter;
if (provider === 'openai') {
  console.log('[LLM] Using OpenAI provider');
  adapter = require('./openai');
} else if (provider === 'cohere') {
  console.log('[LLM] Using Cohere provider');
  adapter = require('./cohere');
} else if (provider === 'gemini') {
  console.log('[LLM] Using Gemini provider');
  adapter = require('./gemini');
} else {
  console.log('[LLM] Using MOCK provider');
  adapter = require('./mock');
}

// Export a consistent API
module.exports = {
  generateSummary: adapter.generateSummary,
  rewriteBullets: adapter.rewriteBullets,
  atsSuggestion: adapter.atsSuggestion,
  _adapter: adapter
};
