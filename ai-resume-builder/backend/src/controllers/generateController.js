/**
 * backend/src/controllers/generateController.js
 * Small controller that proxies generation requests to the provider-agnostic adapter.
 *
 * POST /api/v1/generate
 * Body: { action: "summary"|"rewrite"|"ats", payload: {...} }
 *
 * Responses:
 *  { ok: true, result: <adapter response> }
 *  { ok: false, error: "..." }
 */

const express = require('express');
const router = express.Router();
const llm = require('../adapters/llm/mock'); // provider-agnostic mock for dev

router.post('/', async (req, res) => {
  try {
    const { action, payload } = req.body || {};
    if (!action) return res.status(400).json({ ok: false, error: 'missing_action' });

    let out;
    switch (action) {
      case 'summary':
        out = llm.generateSummary({ resume: payload.resume || payload });
        break;
      case 'rewrite':
        out = llm.rewriteBullets({ bullets: payload.bullets || [] });
        break;
      case 'ats':
        out = llm.atsSuggest({ resume: payload.resume || payload });
        break;
      default:
        return res.status(400).json({ ok: false, error: 'unknown_action' });
    }

    return res.json({ ok: true, result: out });
  } catch (err) {
    console.error('GENERATE ERROR', err);
    return res.status(500).json({ ok: false, error: 'generate_failed', details: String(err.message) });
  }
});

module.exports = router;
