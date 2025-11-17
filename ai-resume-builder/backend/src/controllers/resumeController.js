/**
 * Simple Express router for resume CRUD.
 * Routes:
 *  POST   /api/v1/resumes        -> create resume (returns { slug })
 *  GET    /api/v1/resumes/:slug  -> get resume by slug
 *  PUT    /api/v1/resumes/:slug  -> update resume (body JSON)
 *  DELETE /api/v1/resumes/:slug  -> delete resume
 *  GET    /api/v1/resumes        -> list (basic)
 *
 * Note: payload is stored as JSON string in `data` column.
 */

const express = require('express');
const router = express.Router();
const resumeService = require('../services/resumeService');

// create
router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const { slug } = resumeService.create(req.db, payload);
    return res.status(201).json({ ok: true, slug });
  } catch (err) {
    console.error('CREATE ERROR', err);
    return res.status(500).json({ ok: false, error: 'create_failed', details: err.message });
  }
});

// get by slug
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const item = resumeService.getBySlug(req.db, slug);
    if (!item) return res.status(404).json({ ok: false, error: 'not_found' });
    return res.json({ ok: true, resume: item });
  } catch (err) {
    console.error('GET ERROR', err);
    return res.status(500).json({ ok: false, error: 'get_failed', details: err.message });
  }
});

// list (basic)
router.get('/', async (req, res) => {
  try {
    const list = resumeService.list(req.db);
    return res.json({ ok: true, resumes: list });
  } catch (err) {
    console.error('LIST ERROR', err);
    return res.status(500).json({ ok: false, error: 'list_failed', details: err.message });
  }
});

// update
router.put('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const payload = req.body || {};
    const updated = resumeService.update(req.db, slug, payload);
    if (!updated) return res.status(404).json({ ok: false, error: 'not_found' });
    return res.json({ ok: true, slug });
  } catch (err) {
    console.error('UPDATE ERROR', err);
    return res.status(500).json({ ok: false, error: 'update_failed', details: err.message });
  }
});

// delete
router.delete('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const removed = resumeService.remove(req.db, slug);
    if (!removed) return res.status(404).json({ ok: false, error: 'not_found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE ERROR', err);
    return res.status(500).json({ ok: false, error: 'delete_failed', details: err.message });
  }
});

module.exports = router;
