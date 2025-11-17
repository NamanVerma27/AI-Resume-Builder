// backend/src/controllers/exportController.js
// Express routes to manage export jobs for PDF generation (mock).
// Mount at: app.use('/api/v1/exports', exportController);

const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');

// Create a job
// POST /api/v1/exports
// Body: { resume: { ... } }  OR any payload you want to include
router.post('/', (req, res) => {
  try {
    const payload = req.body || {};
    const job = jobService.createJob(payload);
    return res.status(201).json({ ok: true, slug: job.slug });
  } catch (err) {
    console.error('EXPORT CREATE ERROR', err);
    return res.status(500).json({ ok: false, error: 'create_failed' });
  }
});

// --- IMPORTANT: place /next BEFORE /:slug so "next" isn't captured as a slug ---

// Claim next pending job (used by worker to pick a job).
// GET /api/v1/exports/next
// Returns { ok:true, job: { slug, payload } } or { ok:true, job: null }
router.get('/next', (req, res) => {
  try {
    const job = jobService.claimNextJob();
    return res.json({ ok: true, job });
  } catch (err) {
    console.error('EXPORT NEXT ERROR', err);
    return res.status(500).json({ ok: false, error: 'next_failed' });
  }
});

// Get job status
// GET /api/v1/exports/:slug
router.get('/:slug', (req, res) => {
  try {
    const job = jobService.getJobBySlug(req.params.slug);
    if (!job) return res.status(404).json({ ok: false, error: 'not_found' });
    return res.json({ ok: true, job });
  } catch (err) {
    console.error('EXPORT GET ERROR', err);
    return res.status(500).json({ ok: false, error: 'get_failed' });
  }
});

// Mark job done and attach file path
// POST /api/v1/exports/:slug/done
// Body: { file_path: "/path/to/file.pdf", result: {...} }
router.post('/:slug/done', (req, res) => {
  try {
    const slug = req.params.slug;
    const filePath = req.body.file_path || null;
    const result = req.body.result || {};
    const job = jobService.markJobDone(slug, result, filePath);
    if (!job) return res.status(404).json({ ok: false, error: 'not_found' });
    return res.json({ ok: true, job });
  } catch (err) {
    console.error('EXPORT DONE ERROR', err);
    return res.status(500).json({ ok: false, error: 'done_failed' });
  }
});

module.exports = router;
