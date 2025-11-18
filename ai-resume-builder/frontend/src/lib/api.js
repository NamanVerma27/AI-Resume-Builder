// frontend/src/lib/api.js
// Small helper to call backend generate endpoints via /api proxy in dev.
// Always expects JSON response { ok, result|error }.

export async function postGenerate(action, payload) {
  const res = await fetch('/api/v1/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Network error ${res.status}: ${text}`);
  }
  const j = await res.json();
  return j;
}
