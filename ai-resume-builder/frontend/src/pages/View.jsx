import React, { useEffect, useState } from 'react';
import Preview from '../components/Preview';

// Default to relative base so proxy works in dev.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function View({ slug: initialSlug }) {
  const urlParts = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
  const slug = initialSlug || (urlParts[0] === 'view' ? urlParts[1] : null);

  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError('No slug provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/v1/resumes/${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(json => {
        if (!json.ok) throw new Error(json.error || 'not_found');
        setResume(json.resume.data || json.resume);
      })
      .catch(err => {
        console.error('Fetch resume failed', err);
        setError(String(err.message || err));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!resume) return <div className="p-6">No resume to show.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <a className="text-sm text-slate-600 underline" href="/editor">← Back to editor</a>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <Preview resume={resume} />
      </div>
    </div>
  );
}
