// worker/src/index.js
// Simple worker that polls the backend for next export job, generates a mock PDF file (text disguised as .pdf),
// and marks the job done with the file path.
//
// Config via env:
// BACKEND_BASE (default http://localhost:4000)
// EXPORTS_DIR  (default ../backend/exports relative to repo root)
// POLL_MS      (default 3000)

const fs = require('fs');
const path = require('path');

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';
const EXPORTS_DIR = process.env.EXPORTS_DIR || path.join(__dirname, '../../backend/exports');
const POLL_MS = parseInt(process.env.POLL_MS || '3000', 10);

if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  console.log('Created exports dir:', EXPORTS_DIR);
}

async function claimNext() {
  const url = `${BACKEND_BASE}/api/v1/exports/next`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`claimNext http ${res.status}`);
  }
  const json = await res.json();
  return json.job || null;
}

async function markDone(slug, filePath, result = {}) {
  const url = `${BACKEND_BASE}/api/v1/exports/${encodeURIComponent(slug)}/done`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_path: filePath, result })
  });
  return res.ok ? await res.json() : null;
}

async function generateMockPdf(slug, payload) {
  // For dev: write a plain text file with .pdf extension (mock)
  const filename = `${slug}.pdf`;
  const full = path.join(EXPORTS_DIR, filename);
  const content = [
    `Mock PDF for job ${slug}`,
    `Generated at: ${new Date().toISOString()}`,
    '',
    'Payload:',
    JSON.stringify(payload, null, 2),
    '',
    '--- End of mock PDF ---'
  ].join('\n');
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

async function workLoop() {
  console.log('Worker starting. Backend:', BACKEND_BASE, 'Exports dir:', EXPORTS_DIR);
  while (true) {
    try {
      const job = await claimNext();
      if (!job) {
        // no job, wait
        await new Promise(r => setTimeout(r, POLL_MS));
        continue;
      }
      console.log('Claimed job:', job.slug);
      // generate mock PDF
      const filePath = await generateMockPdf(job.slug, job.payload);
      console.log('Generated mock PDF at', filePath);
      // notify backend
      await markDone(job.slug, filePath, { message: 'mock_pdf_created' });
      console.log('Marked job done:', job.slug);
    } catch (err) {
      console.error('Worker error', err);
      // wait a bit before retrying to avoid hot loop on fatal errors
      await new Promise(r => setTimeout(r, POLL_MS));
    }
  }
}

workLoop();
