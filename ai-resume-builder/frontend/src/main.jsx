// frontend/src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';          // or your top-level App / Router
import './styles.css';           // <= important: Tailwind + theme applied here

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
