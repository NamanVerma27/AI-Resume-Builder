import React, { useState } from 'react';

/**
 * LLMPanel
 * Props:
 *  - getDraft(): returns parsed resume object to send to server (function)
 *
 * This component calls POST /api/v1/generate with actions 'summary','rewrite','ats'
 * and displays the structured output from the mock adapter.
 */

export default function LLMPanel({ getDraft }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  async function call(action, payload = {}) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || json.details || 'generate_failed');
      setResult({ action, payload, output: json.result });
    } catch (err) {
      console.error('LLM call failed', err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  const doSummary = () => {
    const draft = getDraft();
    call('summary', { resume: draft });
  };

  const doRewrite = () => {
    const draft = getDraft();
    // pick bullets from first experience entry if present, otherwise empty
    const bullets = (draft.experience && draft.experience[0] && draft.experience[0].bullets) || [];
    call('rewrite', { bullets });
  };

  const doAts = () => {
    const draft = getDraft();
    call('ats', { resume: draft });
  };

  return (
    <div className="mt-4 p-3 border-t">
      <h3 className="text-sm font-medium">AI tools</h3>
      <div className="mt-2 flex gap-2">
        <button onClick={doSummary} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded">Generate summary</button>
        <button onClick={doRewrite} disabled={loading} className="px-3 py-1 bg-indigo-600 text-white rounded">Rewrite bullets</button>
        <button onClick={doAts} disabled={loading} className="px-3 py-1 bg-orange-600 text-white rounded">ATS suggestions</button>
      </div>

      {loading && <div className="mt-2 text-sm text-slate-500">Working…</div>}
      {error && <div className="mt-2 text-sm text-red-600">Error: {error}</div>}

      {result && (
        <div className="mt-3 bg-slate-50 p-3 rounded">
          <div className="text-xs text-slate-500">Action: {result.action}</div>
          <pre className="text-sm mt-2 whitespace-pre-wrap">{JSON.stringify(result.output, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
