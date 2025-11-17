// Full file (updated): includes LLMPanel integration
import React, { useEffect, useState, useRef } from 'react';
import Preview from '../components/Preview';
import LLMPanel from '../components/LLMPanel';

const LS_KEY = 'resume:draft';
const AUTOSAVE_DELAY_MS = 2000;
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function parseOrDefault(text) {
  try { return JSON.parse(text); } catch (e) { return { raw: text }; }
}

export default function Editor() {
  const initial = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
  const [text, setText] = useState(initial || JSON.stringify({
    name: "Your Name",
    summary: "Short professional summary",
    experience: [{ company: "Acme Inc", summary: "Built stuff", bullets: ["Delivered X", "Reduced Y"] }],
    skills: ["Node.js", "SQL"]
  }, null, 2));
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [parsed, setParsed] = useState(parseOrDefault(initial || text));
  const [saving, setSaving] = useState(false);
  const [serverSlug, setServerSlug] = useState(null);
  const [serverError, setServerError] = useState(null);

  const timer = useRef(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, text);
        setLastSavedAt(new Date().toISOString());
        setParsed(parseOrDefault(text));
      } catch (e) {
        console.error('Autosave failed', e);
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text]);

  const saveNow = () => {
    try {
      localStorage.setItem(LS_KEY, text);
      setLastSavedAt(new Date().toISOString());
      setParsed(parseOrDefault(text));
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(LS_KEY);
    const empty = JSON.stringify({ name: "", summary: "", experience: [], skills: [] }, null, 2);
    setText(empty);
    setParsed(parseOrDefault(empty));
    setLastSavedAt(null);
    setServerSlug(null);
    setServerError(null);
  };

  const saveToServer = async () => {
    setSaving(true);
    setServerError(null);
    setServerSlug(null);
    let payload = parseOrDefault(text);

    try {
      const res = await fetch(`${API_BASE}/api/v1/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || json || 'save_failed');
      setServerSlug(json.slug);
    } catch (err) {
      console.error('Save to server failed', err);
      setServerError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // getDraft for LLMPanel to call
  const getDraft = () => {
    return parseOrDefault(text);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <section className="p-4 bg-white rounded shadow">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-medium">Editor</h2>
          <div className="text-sm text-slate-500">
            {lastSavedAt ? `Saved: ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet'}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-3 w-full h-[55vh] p-3 border rounded text-sm font-mono"
        />

        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 bg-slate-800 text-white rounded" onClick={saveNow}>Save now</button>
          <button className="px-3 py-1 border rounded" onClick={clearDraft}>Clear draft</button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={saveToServer}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save to server (anonymous)'}
          </button>
        </div>

        {serverSlug && (
          <div className="mt-3 text-sm">
            <div>Saved anonymously. Share this link to view:</div>
            <a
              className="text-blue-600 underline"
              href={`/view/${serverSlug}`}
              target="_blank"
              rel="noreferrer"
            >
              {window.location.origin}/view/{serverSlug}
            </a>
            <div className="text-xs text-slate-500 mt-1">Note: this is an anonymous slug — no account required.</div>
          </div>
        )}

        {serverError && <div className="mt-3 text-red-600 text-sm">Error: {serverError}</div>}

        <div className="mt-3 text-xs text-slate-500">
          <strong>Autosave:</strong> drafts saved to <code>{LS_KEY}</code> every {AUTOSAVE_DELAY_MS/1000}s.
        </div>

        {/* LLM panel */}
        <LLMPanel getDraft={getDraft} />
      </section>

      <section className="p-4 bg-white rounded shadow">
        <h2 className="text-lg font-medium">Preview</h2>
        <div className="mt-3">
          <Preview resume={parsed} />
        </div>
      </section>
    </div>
  );
}
