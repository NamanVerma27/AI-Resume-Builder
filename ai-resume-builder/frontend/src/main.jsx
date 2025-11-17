import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Simple client-side mount
createRoot(document.getElementById('root')).render(<App />);
