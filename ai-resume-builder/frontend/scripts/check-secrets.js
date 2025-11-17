// frontend/scripts/check-secrets.js
// Scan frontend files for obvious secret-ish substrings but skip package.json and env files.
// Allow VITE_ occurrences in frontend source (public config), but still forbid API_KEY / SECRET / PRIVATE_KEY.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'scripts']);

function isInSkippedDir(absPath) {
  const rel = path.relative(ROOT, absPath);
  const parts = rel.split(path.sep);
  return parts.length > 0 && SKIP_DIRS.has(parts[0]);
}

(function walk(dir) {
  const entries = fs.readdirSync(dir);
  for (const name of entries) {
    const full = path.join(dir, name);
    if (isInSkippedDir(full)) continue;

    const stat = fs.statSync(full);
    if (stat.isDirectory()) { walk(full); continue; }

    const relPath = path.relative(ROOT, full);
    const base = path.basename(full);

    // Skip package.json and any env files (examples, .env.project, .env.local)
    if (relPath === 'package.json' || base.startsWith('.env')) continue;

    const content = fs.readFileSync(full, 'utf8');

    // Allow VITE_ since import.meta.env.VITE_* is the recommended way to expose public config.
    // But still flag dangerous-looking substrings:
    if (/API_KEY|SECRET|PRIVATE_KEY/.test(content)) {
      console.error('Possible secret in', full);
      process.exit(2);
    }
  }
})(ROOT);

console.log('check-secrets: OK');
