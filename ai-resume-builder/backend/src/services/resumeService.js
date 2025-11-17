/**
 * resumeService: direct DB access using better-sqlite3 (synchronous)
 * Keep small and dependency-free.
 */

const crypto = require('crypto');

function slugifyRandom(n = 8) {
  // deterministic-looking random slug using crypto
  return crypto.randomBytes(Math.ceil(n / 2)).toString('hex').slice(0, n);
}

function nowIso() {
  return new Date().toISOString();
}

function create(db, payload = {}) {
  const slug = slugifyRandom(8);
  const now = nowIso();
  const stmt = db.prepare('INSERT INTO resumes (slug, data, created_at, updated_at) VALUES (?, ?, ?, ?)');
  const info = stmt.run(slug, JSON.stringify(payload), now, now);
  return { id: info.lastInsertRowid, slug };
}

function getBySlug(db, slug) {
  const row = db.prepare('SELECT id, slug, data, created_at, updated_at FROM resumes WHERE slug = ?').get(slug);
  if (!row) return null;
  let data = {};
  try { data = JSON.parse(row.data); } catch (e) { data = { raw: row.data }; }
  return { id: row.id, slug: row.slug, data, created_at: row.created_at, updated_at: row.updated_at };
}

function list(db, limit = 50) {
  const rows = db.prepare('SELECT id, slug, data, created_at, updated_at FROM resumes ORDER BY id DESC LIMIT ?').all(limit);
  return rows.map(r => {
    let data = {};
    try { data = JSON.parse(r.data); } catch (e) { data = { raw: r.data }; }
    return { id: r.id, slug: r.slug, summary: data.summary || null, created_at: r.created_at };
  });
}

function update(db, slug, payload = {}) {
  const now = nowIso();
  const stmt = db.prepare('UPDATE resumes SET data = ?, updated_at = ? WHERE slug = ?');
  const info = stmt.run(JSON.stringify(payload), now, slug);
  return info.changes > 0;
}

function remove(db, slug) {
  const stmt = db.prepare('DELETE FROM resumes WHERE slug = ?');
  const info = stmt.run(slug);
  return info.changes > 0;
}

module.exports = { create, getBySlug, list, update, remove };
