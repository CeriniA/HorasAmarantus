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
  import('./utils/syncDebug.js');
  import('./offline/utils/debugSync.js');
  import('./offline/utils/debugDuplicates.js');
}

// ✅ MEJORADO: Service Worker se registra automáticamente con Vite PWA
// Ya no es necesario registrarlo manualmente
// El plugin VitePWA se encarga de todo (desarrollo y producción)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
