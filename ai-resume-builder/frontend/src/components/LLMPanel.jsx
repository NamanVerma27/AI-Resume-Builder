// frontend/src/components/LLMPanel.jsx
// (only tiny change: use smaller btn-sm padding classes - file otherwise same)
import React, { useState } from 'react';
import { postGenerate } from '../lib/api';

export default function LLMPanel({ resume, onResult }) {
  const [loading, setLoading] = useState(false);
  const [bulletsText, setBulletsText] = useState('');
  const [error, setError] = useState(null);
  const [lastOp, setLastOp] = useState(null);

  function parseBullets(text) {
    return text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function run(action, payload) {
    setError(null);
    setLoading(true);
    setLastOp(null);
    try {
      const j = await postGenerate(action, payload);
      if (!j || !j.ok) {
        const msg = (j && (j.error || j.message)) || 'Unknown server response';
        setError(msg);
        setLastOp({ ok: false, raw: j });
        onResult && onResult(j);
      } else {
        setLastOp({ ok: true, raw: j.result });
        onResult && onResult(j.result);
      }
    } catch (e) {
      setError(e.message || String(e));
      setLastOp({ ok: false, raw: { error: e.message } });
      onResult && onResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSummary() { await run('summary', { resume }); }
  async function handleRewrite() {
    const bullets = parseBullets(bulletsText);
    if (bullets.length === 0) {
      setError('Please paste or type at least one bullet (one per line).');
      return;
    }
    await run('rewrite', { bullets });
  }
  async function handleATS() { await run('ats', { resume }); }

  return (
    <div className="panel-card">
      <div className="card-title">AI Helper</div>
      <div className="card-controls" style={{ marginBottom: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={handleSummary} disabled={loading}>
          Generate Summary
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleATS} disabled={loading}>
          ATS Suggestions
        </button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="helper" style={{ display: 'block', marginBottom: 6 }}>Rewrite bullets (one per line)</label>
        <textarea
          className="textarea"
          rows="4"
          value={bulletsText}
          onChange={(e) => { setBulletsText(e.target.value); setError(null); }}
          placeholder="e.g. Improved uptime by 99% over 6 months"
        />
        <div className="card-controls" style={{ marginTop: 12 }}>
          <button className="btn btn-primary btn-sm" onClick={handleRewrite} disabled={loading}>
            Rewrite Bullets
          </button>
          <div className="helper">Paste bullets and click rewrite — results appear in Preview.</div>
        </div>
      </div>

      {loading && <div className="helper" style={{ marginTop: 8 }}>Thinking…</div>}
      {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{`Error: ${error}`}</div>}

      {lastOp && (
        <div className="llm-box" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>Last result</div>
          <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(lastOp.raw, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
