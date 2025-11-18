// frontend/src/components/Preview.jsx
import React from 'react';

export default function Preview({ resume, llmResult }) {
  return (
    <div className="panel-card">
      <div className="card-title">Preview</div>

      <div style={{ marginBottom: 10 }}>
        <div className="helper">Name</div>
        <div style={{ fontWeight: 600, marginTop: 6 }}>{resume?.name || '—'}</div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div className="helper">Summary</div>
        <div style={{ marginTop: 6, color: '#334155' }}>{resume?.summary || '—'}</div>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div className="helper">Experience</div>
        <ul className="preview-list" style={{ marginTop: 8 }}>
          {(resume?.experience || []).length === 0 ? (
            <li className="helper">No experience added</li>
          ) : (
            (resume.experience || []).map((e, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{e.summary || '—'}</li>
            ))
          )}
        </ul>
      </div>

      {llmResult && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(15,23,42,0.04)', paddingTop: 12 }}>
          {/* summary */}
          {llmResult.summary && (
            <div className="llm-box" style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>AI summary</div>
              <div>{llmResult.summary}</div>
            </div>
          )}

          {/* rewritten bullets */}
          {llmResult.rewritten && Array.isArray(llmResult.rewritten) && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Rewritten bullets</div>
              <ul className="preview-list">
                {llmResult.rewritten.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {/* ATS */}
          {typeof llmResult.score === 'number' && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontWeight: 700 }}>ATS score: <span style={{ fontWeight: 900 }}>{llmResult.score}</span></div>
              {llmResult.suggestions && llmResult.suggestions.length > 0 && (
                <ul className="preview-list">
                  {llmResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              )}
            </div>
          )}

          <details style={{ marginTop: 8, color: 'var(--muted-500)', fontSize: 12 }}>
            <summary>Raw result</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(llmResult, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
