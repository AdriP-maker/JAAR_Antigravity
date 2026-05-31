import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Global design system

// Register Service Worker for PWA capabilities
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // A minimal service worker for caching static assets can be added later
    // navigator.serviceWorker.register('/JAAR_Antigravity/sw.js').catch(err => {
    //   console.log('SW registration failed: ', err);
    // });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
