/**
 * backend/src/index.js
 * Minimal Express server with SQLite (better-sqlite3) and resume CRUD endpoints.
 *
 * Security defaults:
 * - Reads PORT and DATABASE_URL from process.env (see .env.example).
 * - No secrets are stored here; LLM adapter uses mock by default.
 *
 * Run: npm install && npm run dev
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const resumeController = require('./controllers/resumeController');

const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '..', 'dev.db');

const db = new Database(DB_PATH);

// Initialize DB schema (simple, id + slug + json payload)
db.prepare(`
CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
`).run();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Attach db to request (simple DI)
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Base route
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'AI Resume Builder backend (Milestone 1). Check /api/v1/resumes' });
});

// API routes
app.use('/api/v1/resumes', resumeController);
const generateController = require('./controllers/generateController');
app.use('/api/v1/generate', generateController);

const exportController = require('./controllers/exportController');
app.use('/api/v1/exports', exportController);

// --- ADDED LINES ---
const atsController = require('./controllers/atsController');
app.use('/api/v1/ats', atsController);

const jobsController = require('./controllers/jobsController');
app.use('/api/v1/jobs', jobsController);
// --- END ADDED LINES ---

// health
app.get('/healthz', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT} (DB: ${DB_PATH})`);
});