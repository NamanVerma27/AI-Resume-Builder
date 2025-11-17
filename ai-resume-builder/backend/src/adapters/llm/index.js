// backend/src/adapters/llm/index.js
// Provider-agnostic adapter dispatcher.
// Exports: generateSummary, rewriteBullets, atsSuggestion
//
// Default: use mock adapter for local dev.
// To enable a provider, set LLM_PROVIDER=openai (and provide OPENAI_API_KEY server-side).
//
// This file makes it easy to add other providers in the future (e.g., Cohere, Anthropic).

const provider = process.env.LLM_PROVIDER || "mock";

if (provider === "openai") {
  console.log("[LLM] Using OpenAI provider");
  module.exports = require("./openai");
} else {
  console.log("[LLM] Using MOCK provider");
  module.exports = require("./mock");
}
