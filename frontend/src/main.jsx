import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { runMigrations } from './offline/core/migrations.js';

// Ejecutar migraciones de IndexedDB
runMigrations().catch(error => {
  console.error('Error ejecutando migraciones:', error);
});

// Importar utilidades de debug en desarrollo
if (import.meta.env.DEV) {
  import('./utils/dbDebug.js');
  import('./offline/utils/debugSync.js');
  import('./offline/utils/debugDuplicates.js');
}

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registrado:', registration.scope);
      },
      (error) => {
        console.log('Error al registrar Service Worker:', error);
      }
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
