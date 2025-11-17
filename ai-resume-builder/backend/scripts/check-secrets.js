// backend/scripts/check-secrets.js
// Safe secrets checker for backend. Skips node_modules, .git, and scripts/ itself.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', 'scripts']);

// helper: return true if path (absolute) is inside any skipped dir (relative to ROOT)
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
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }

    // skip package.json at root (we don't want to treat dev/package.json metadata as secrets)
    const relPath = path.relative(ROOT, full);
    if (relPath === 'package.json') continue;

    const content = fs.readFileSync(full, 'utf8');

    // disallow VITE_ in scanned files (frontend public vars must only be in frontend/.env or intentionally prefixed)
    if (/VITE_|VITE-/.test(content)) {
      console.error('Found VITE_ in', full);
      process.exit(1);
    }

    // check for common secret-looking substrings inside frontend files
    if (/API_KEY|SECRET|PRIVATE_KEY/.test(content) && relPath.startsWith('frontend' + path.sep)) {
      console.error('Possible secret in frontend file', full);
      process.exit(2);
    }
  }
})(ROOT);

console.log('check-secrets: OK');
