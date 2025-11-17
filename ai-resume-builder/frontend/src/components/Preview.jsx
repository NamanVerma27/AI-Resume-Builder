import React from 'react';

function Skills({ skills = [] }) {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="mt-2">
      <h3 className="font-semibold text-sm">Skills</h3>
      <div className="flex flex-wrap gap-2 mt-1">
        {skills.map((s, i) => (
          <span key={i} className="text-xs px-2 py-1 bg-slate-100 rounded">{s}</span>
        ))}
      </div>
    </div>
  );
}

function Experience({ experience = [] }) {
  if (!experience || experience.length === 0) return null;
  return (
    <div className="mt-3">
      <h3 className="font-semibold text-sm">Experience</h3>
      <ul className="mt-1 list-disc pl-5 text-sm">
        {experience.map((e, i) => (
          <li key={i}>
            <div className="font-medium">{e.company || e.role || 'Company'}</div>
            <div className="text-slate-600 text-sm">{e.summary || ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Preview({ resume = {} }) {
  if (resume.raw && typeof resume.raw === 'string') {
    // fallback when user typed invalid JSON — show raw text
    return <pre className="whitespace-pre-wrap text-sm">{resume.raw}</pre>;
  }

  const name = resume.name || resume.basics?.name || 'Your name';
  const summary = resume.summary || resume.basics?.summary || '';
  return (
    <div>
      <div className="text-xl font-semibold">{name}</div>
      <div className="text-slate-600 mt-1">{summary}</div>
      <Skills skills={resume.skills} />
      <Experience experience={resume.experience} />
    </div>
  );
}
