# ✅ Verificar Variables de Entorno en Render

## 🎯 Problema Resuelto

El `SyncManager.js` estaba haciendo fetch a `/api/health` sin usar la URL base del backend.

**Fix aplicado**: Ahora usa `${API_URL}/api/health` correctamente.

---

## 🔧 Variables de Entorno Requeridas

### 📱 FRONTEND (Static Site)

**Render Dashboard** → `horasamarantus` → **Environment**

```env
VITE_API_URL=https://horasamarantus-backend.onrender.com
VITE_SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZ3h1bG5zbml3bHJtb3Vyc3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg3NDIsImV4cCI6MjA4ODEyNDc0Mn0.Pk2e4lwuS4tSnnm6YtNsC-7YWcZqM_HideRRRJ4_sTM
```

**⚠️ IMPORTANTE**:
- `VITE_API_URL` **SIN** `/api` al final
- `VITE_API_URL` debe apuntar al **backend**, no al frontend

---

### 🔧 BACKEND (Web Service)

**Render Dashboard** → `horasamarantus-backend` → **Environment**

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
JWT_SECRET=4cf78a86c57206b2901ae74d676290f494585b5a99dbd5de77d69bd4584a276d8c7d42358c6b163a4ed85f0982a87fc4ef99b34e22aa23cf4a69448878d52bf6
FRONTEND_URL=https://horasamarantus.onrender.com
```

**⚠️ IMPORTANTE**:
- `PORT=10000` (Render usa este puerto)
- `FRONTEND_URL` debe apuntar al **frontend** (para CORS)

---

## 🔍 Verificar Configuración

### 1. Verificar Backend Health

Abre en navegador:
```
https://horasamarantus-backend.onrender.com/health
```

**Debe responder**:
```json
{
  "status": "ok",
  "timestamp": "2026-03-04T..."
}
```

---

### 2. Verificar Frontend Variables

Abre la app:
```
https://horasamarantus.onrender.com
```

Abre **DevTools** (F12) → **Console** → Escribe:
```javascript
import.meta.env.VITE_API_URL
```

**Debe mostrar**:
```
"https://horasamarantus-backend.onrender.com"
```

---

### 3. Verificar Health Check desde Frontend

En **Console**:
```javascript
fetch('https://horasamarantus-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Debe mostrar**:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## 🚀 Después del Deploy

### Esperar ~3 minutos

Render redesplegará el frontend automáticamente.

### Verificar que funciona:

1. **Abrir app**: `https://horasamarantus.onrender.com`
2. **Abrir DevTools** (F12) → **Network**
3. **Filtrar por**: `health`
4. **Verificar URL**: Debe ser `https://horasamarantus-backend.onrender.com/api/health`
5. **Status**: Debe ser `200 OK`

---

## 📋 Checklist de Verificación

### Backend
- [ ] Servicio activo en Render
- [ ] Variables de entorno configuradas
- [ ] `/health` responde 200 OK
- [ ] `/api/health` responde 200 OK

### Frontend
- [ ] Static Site activo en Render
- [ ] `VITE_API_URL` apunta al backend
- [ ] Build exitoso
- [ ] Health check usa URL correcta

### Integración
- [ ] Login funciona
- [ ] No hay errores de CORS
- [ ] Health check responde desde backend
- [ ] Sincronización offline funciona

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Causa**: CORS mal configurado

**Solución**:
1. Verificar `FRONTEND_URL` en backend
2. Debe ser exactamente: `https://horasamarantus.onrender.com`
3. Sin `/` al final

---

### Error: "404 Not Found" en /api/health

**Causa**: URL incorrecta o backend caído

**Solución**:
1. Verificar que backend esté activo en Render
2. Verificar `VITE_API_URL` en frontend
3. Debe apuntar a: `https://horasamarantus-backend.onrender.com`

---

### Error: "Network request failed"

**Causa**: Backend se durmió (plan Free)

**Solución**:
1. Esperar ~30 segundos (backend despierta)
2. O configurar cron-job en cron-job.org
3. O upgrade a plan Starter ($7/mes)

---

## 📊 URLs Finales

```
Frontend:     https://horasamarantus.onrender.com
Backend:      https://horasamarantus-backend.onrender.com
Health Check: https://horasamarantus-backend.onrender.com/health
API Health:   https://horasamarantus-backend.onrender.com/api/health
Login:        https://horasamarantus-backend.onrender.com/api/auth/login
```

---

## ✅ Resumen del Fix

**Problema**: `SyncManager.js` usaba `/api/health` relativo

**Solución**: Ahora usa `${API_URL}/api/health` absoluto

**Archivo modificado**: `frontend/src/offline/sync/SyncManager.js`

**Cambio**:
```javascript
// ❌ Antes
fetch('/api/health', ...)

// ✅ Después
fetch(`${API_URL}/api/health`, ...)
```

---

**Después del deploy, el health check funcionará correctamente.** 🎉
