import React from 'react';
import Editor from './pages/Editor';
import View from './pages/View';

/**
 * Very small router based on location.pathname.
 * Routes:
 *  - / or /editor  => Editor
 *  - /view/:slug   => View
 *
 * This keeps dependencies minimal (no react-router) and is easy to replace later.
 */
export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const parts = path.split('/').filter(Boolean);

  if (parts[0] === 'view' && parts[1]) {
    const slug = parts[1];
    return <View slug={slug} />;
  }

  // default to editor
  return <Editor />;
}
