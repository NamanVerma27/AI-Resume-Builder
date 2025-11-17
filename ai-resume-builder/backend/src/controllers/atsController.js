// backend/src/controllers/atsController.js
// POST /api/v1/ats/score
// Body: { resume: { ... } }
// Response: { ok:true, score: <0-100>, suggestions: [...], details: {...} }

const express = require('express');
const router = express.Router();
const { scoreResume } = require('../services/atsService');

router.post('/score', (req, res) => {
  try {
    const resume = (req.body && req.body.resume) || req.body || {};
    const out = scoreResume(resume);
    return res.json(out);
  } catch (err) {
    console.error('ATS SCORE ERROR', err);
    return res.status(500).json({ ok: false, error: 'ats_failed', details: String(err.message) });
  }
});

module.exports = router;
