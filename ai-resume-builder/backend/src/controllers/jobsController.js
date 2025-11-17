// backend/src/controllers/jobsController.js
// Simple jobs feed for exports. Mount at /api/v1/jobs
// GET /api/v1/jobs?limit=20
// Returns { ok:true, jobs: [ { slug, status, created_at, updated_at } ] }

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
    // db is attached to req in index.js
    const rows = req.db.prepare(`SELECT slug, status, created_at, updated_at, file_path FROM exports_jobs ORDER BY created_at DESC LIMIT ?`).all(limit);
    return res.json({ ok: true, jobs: rows });
  } catch (err) {
    console.error('JOBS FEED ERROR', err);
    return res.status(500).json({ ok: false, error: 'feed_failed' });
  }
});

module.exports = router;
