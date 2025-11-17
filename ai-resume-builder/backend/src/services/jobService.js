// backend/src/services/jobService.js
// Job service using the same SQLite DB as the backend.
// Creates a jobs table and provides helpers: createJob, getJobBySlug, claimNextJob, markDone.

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../dev.db');
const db = new Database(DB_PATH);

// ensure jobs table exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS exports_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    status TEXT,
    payload TEXT,
    result TEXT,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const crypto = require('crypto');

function now() {
  return new Date().toISOString();
}

function createJob(payloadObj) {
  const slug = crypto.randomBytes(4).toString('hex');
  const payload = JSON.stringify(payloadObj || {});
  const stmt = db.prepare(`
    INSERT INTO exports_jobs (slug, status, payload, created_at, updated_at)
    VALUES (?, 'pending', ?, ?, ?)
  `);
  stmt.run(slug, payload, now(), now());
  return { slug, status: 'pending' };
}

function getJobBySlug(slug) {
  const row = db.prepare(`SELECT * FROM exports_jobs WHERE slug = ?`).get(slug);
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    payload: JSON.parse(row.payload || '{}'),
    result: row.result ? JSON.parse(row.result) : null,
    file_path: row.file_path,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Atomically claim next pending job (oldest) and mark it processing.
// Returns null if none.
function claimNextJob() {
  const trx = db.transaction(() => {
    const row = db.prepare(`SELECT id, slug, payload FROM exports_jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`).get();
    if (!row) return null;
    db.prepare(`UPDATE exports_jobs SET status = 'processing', updated_at = ? WHERE id = ?`).run(now(), row.id);
    return { id: row.id, slug: row.slug, payload: JSON.parse(row.payload || '{}') };
  });
  return trx();
}

function markJobDone(slug, resultObj = {}, filePath = null) {
  const result = JSON.stringify(resultObj || {});
  const stmt = db.prepare(`
    UPDATE exports_jobs
    SET status = 'done', result = ?, file_path = ?, updated_at = ?
    WHERE slug = ?
  `);
  stmt.run(result, filePath, now(), slug);
  return getJobBySlug(slug);
}

module.exports = {
  createJob,
  getJobBySlug,
  claimNextJob,
  markJobDone
};
