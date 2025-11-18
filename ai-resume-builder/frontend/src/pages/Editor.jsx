// frontend/src/pages/Editor.jsx
// Clean Editor: no duplicated header/Share/Save, uses design tokens from styles.css
import React, { useEffect, useState } from 'react';
import '../styles.css'; // ensure our CSS loads

export default function Editor({ resume: propResume, setResume: setPropResume } = {}) {
  // If parent provided resume via props (App.jsx), use it. Otherwise maintain local state.
  const [localMode] = useState(!propResume || !setPropResume);
  const [resume, setResume] = useState(() => {
    if (!localMode && propResume) return propResume;
    try {
      const raw = localStorage.getItem('resume:draft');
      return raw ? JSON.parse(raw) : { name: '', summary: '', experience: [], skills: [] };
    } catch (e) {
      return { name: '', summary: '', experience: [], skills: [] };
    }
  });

  // If being controlled by parent, keep in sync
  useEffect(() => {
    if (!localMode && propResume) setResume(propResume);
  }, [propResume, localMode]);

  useEffect(() => {
    if (localMode) localStorage.setItem('resume:draft', JSON.stringify(resume));
    else setPropResume && setPropResume(resume);
  }, [resume, localMode, setPropResume]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  function updateField(k, v) {
    setResume(prev => ({ ...prev, [k]: v }));
  }
  function addExp() {
    setResume(prev => ({ ...prev, experience: [...(prev.experience || []), { company: '', summary: '' }] }));
  }
  function updateExp(i, k, v) {
    setResume(prev => {
      const ex = [...(prev.experience || [])];
      ex[i] = { ...ex[i], [k]: v };
      return { ...prev, experience: ex };
    });
  }

  async function saveToServer() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/v1/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume),
      });
      const j = await res.json();
      if (j.ok) {
        setMsg(`Saved anonymously — slug: ${j.slug}`);
      } else {
        setMsg('Save failed');
      }
    } catch (e) {
      setMsg(`Save error: ${e.message}`);
    } finally { setSaving(false); }
  }

  return (
    <div className="panel-card" style={{ minHeight: 420 }}>
      <div className="card-title">Editor</div>

      <div style={{ marginBottom: 12 }}>
        <label className="helper" style={{ display: 'block', marginBottom: 6 }}>Name</label>
        <input
          className="input"
          value={resume.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="Full name (optional)"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label className="helper" style={{ display: 'block', marginBottom: 6 }}>Summary</label>
        <input
          className="input"
          value={resume.summary}
          onChange={e => updateField('summary', e.target.value)}
          placeholder="Short professional summary (one sentence)"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Experience</div>

        {(resume.experience || []).length === 0 && (
          <div className="helper" style={{ marginBottom: 8 }}>No experience entries yet — add one below.</div>
        )}

        {(resume.experience || []).map((ex, i) => (
          <div key={i} style={{ marginBottom: 10 }} className="p-3" >
            <input
              className="input"
              placeholder="Company"
              value={ex.company || ''}
              onChange={e => updateExp(i, 'company', e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <textarea
              className="textarea"
              placeholder="Summary — what you did / impact (one or two lines)"
              value={ex.summary || ''}
              onChange={e => updateExp(i, 'summary', e.target.value)}
            />
          </div>
        ))}

        <div style={{ marginTop: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={addExp}
            type="button"
          >
            Add experience
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={saveToServer}
          disabled={saving}
          type="button"
        >
          {saving ? 'Saving…' : 'Save anonymously'}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { navigator.clipboard.writeText(location.href).catch(()=>{}); }}
          type="button"
        >
          Copy link
        </button>

        <div style={{ marginLeft: 'auto' }} className="helper">{msg || ''}</div>
      </div>
    </div>
  );
}
