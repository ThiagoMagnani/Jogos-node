import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// A aplicação inteira é renderizada dentro da <div id="root"> do public/index.html
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
