// frontend/src/App.jsx
import React, { useState } from 'react';
import Editor from './pages/Editor';
import LLMPanel from './components/LLMPanel';
import Preview from './components/Preview';
import './styles.css';

export default function App() {
  const [resume, setResume] = useState({
    name: '',
    summary: '',
    experience: [],
    skills: []
  });
  const [llmResult, setLlmResult] = useState(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-title">AI Resume Builder</div>
          <div className="app-sub">Write, refine and export resumes — anonymous by design.</div>
        </div>

        <div className="header-actions">
          <button className="btn btn-ghost">Share</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </header>

      <div className="editor-grid">
        {/* Render Editor directly — Editor likely includes its own card; avoid extra wrapper to prevent duplicate titles/buttons */}
        <div>
          <Editor resume={resume} setResume={setResume} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <LLMPanel resume={resume} onResult={(r) => {
            setLlmResult(r);
            if (r && r.summary) setResume(prev => ({ ...prev, summary: r.summary }));
          }} />
          <Preview resume={resume} llmResult={llmResult} />
        </div>
      </div>
    </div>
  );
}
