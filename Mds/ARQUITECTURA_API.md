# 🏗️ Arquitectura de API - Sistema Horas

## 📋 Resumen de la Solución

### ✅ Configuración Final

**Variables de Entorno**:
```env
VITE_API_URL=https://horasamarantus-backend.onrender.com
```

**Sin** `/api` al final - El código lo agrega automáticamente.

---

## 🔌 Endpoints del Backend

### Health Check
```
GET /health              ✅ Sin /api (usado por SyncManager)
GET /api/health          ✅ Con /api (alternativo)
```

### Autenticación
```
POST /auth/login         ✅ Sin /api (compatible)
POST /api/auth/login     ✅ Con /api (estándar)
```

### Time Entries
```
GET    /time-entries           ✅ Sin /api
GET    /api/time-entries       ✅ Con /api
POST   /time-entries           ✅ Sin /api
POST   /api/time-entries       ✅ Con /api
PUT    /time-entries/:id       ✅ Sin /api
PUT    /api/time-entries/:id   ✅ Con /api
DELETE /time-entries/:id       ✅ Sin /api
DELETE /api/time-entries/:id   ✅ Con /api
```

### Users
```
GET    /users           ✅ Sin /api
GET    /api/users       ✅ Con /api
POST   /users           ✅ Sin /api
POST   /api/users       ✅ Con /api
PUT    /users/:id       ✅ Sin /api
PUT    /api/users/:id   ✅ Con /api
DELETE /users/:id       ✅ Sin /api
DELETE /api/users/:id   ✅ Con /api
```

### Organizational Units
```
GET    /organizational-units           ✅ Sin /api
GET    /api/organizational-units       ✅ Con /api
POST   /organizational-units           ✅ Sin /api
POST   /api/organizational-units       ✅ Con /api
PUT    /organizational-units/:id       ✅ Sin /api
PUT    /api/organizational-units/:id   ✅ Con /api
DELETE /organizational-units/:id       ✅ Sin /api
DELETE /api/organizational-units/:id   ✅ Con /api
```

---

## 🎯 Cómo Funciona el Frontend

### 1. **api.js** (Servicios Principales)

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// API_URL = "https://horasamarantus-backend.onrender.com"

// Login
authService.login(email, password)
// → POST https://horasamarantus-backend.onrender.com/api/auth/login

// Get Time Entries
timeEntriesService.getAll()
// → GET https://horasamarantus-backend.onrender.com/api/time-entries
```

**Rutas usadas**: `/api/auth/login`, `/api/time-entries`, etc.

---

### 2. **SyncManager.js** (Health Check)

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// API_URL = "https://horasamarantus-backend.onrender.com"

// Health Check
fetch(`${API_URL}/health`)
// → HEAD https://horasamarantus-backend.onrender.com/health
```

**Ruta usada**: `/health` (sin `/api`)

---

## 🔄 Flujo de Requests

### Login
```
Frontend (Login.jsx)
  ↓
authService.login("superadmin", "password")
  ↓
api.post('/auth/login', { email, password })
  ↓
fetch('https://horasamarantus-backend.onrender.com/api/auth/login')
  ↓
Backend: app.use('/api/auth', authRoutes)
  ↓
authRoutes: router.post('/login', ...)
  ↓
✅ Response: { token, user }
```

---

### Health Check
```
SyncManager.isOnline()
  ↓
fetch('https://horasamarantus-backend.onrender.com/health')
  ↓
Backend: app.get('/health', ...)
  ↓
✅ Response: { status: 'ok', timestamp: '...' }
```

---

## 📊 Tabla de URLs

| Servicio | Frontend Llama | Backend Recibe | Ruta Montada |
|----------|---------------|----------------|--------------|
| Login | `/api/auth/login` | `/api/auth/login` | `/api/auth` + `/login` |
| Health | `/health` | `/health` | `/health` |
| Time Entries | `/api/time-entries` | `/api/time-entries` | `/api/time-entries` |
| Users | `/api/users` | `/api/users` | `/api/users` |

---

## ✅ Ventajas de Esta Arquitectura

### 1. **Compatibilidad Dual**
- ✅ Funciona con `/api/auth/login`
- ✅ Funciona con `/auth/login`
- ✅ No importa si hay rewrites o proxies

### 2. **Health Check Simple**
- ✅ `/health` sin `/api` (más directo)
- ✅ No pasa por rate limiting
- ✅ Más rápido para checks

### 3. **Consistencia**
- ✅ `VITE_API_URL` sin `/api` al final
- ✅ Código agrega `/api` donde corresponde
- ✅ Fácil de entender y mantener

---

## 🔧 Variables de Entorno

### Frontend (Render Static Site)
```env
VITE_API_URL=https://horasamarantus-backend.onrender.com
VITE_SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Backend (Render Web Service)
```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=4cf78a86c57206b2901ae74d676290f4...
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://horasamarantus.onrender.com
```

---

## 🐛 Troubleshooting

### Error: "Ruta no encontrada: POST /auth/login"

**Causa**: Request llega sin `/api`

**Solución**: Ya está solucionado con rutas duales

---

### Error: "404 en /api/api/health"

**Causa**: Doble `/api` en la URL

**Solución**: ✅ Ya corregido
- `VITE_API_URL` sin `/api` al final
- `SyncManager` usa `/health` (sin `/api`)

---

### Error: CORS

**Causa**: `FRONTEND_URL` mal configurado

**Solución**: Verificar que sea exactamente:
```
FRONTEND_URL=https://horasamarantus.onrender.com
```

---

## 📝 Resumen de Cambios

### Archivos Modificados

1. **`backend/src/app.js`**
   - ✅ Agregadas rutas duales (con y sin `/api`)

2. **`frontend/src/services/api.js`**
   - ✅ Quitado `/api` del fallback de `API_URL`

3. **`frontend/src/offline/sync/SyncManager.js`**
   - ✅ Agregado import de `API_URL`
   - ✅ Cambiado `/api/health` → `/health`

---

## ✅ Estado Final

```
✅ Login funciona con username o email
✅ Health check usa URL correcta
✅ No hay doble /api
✅ Compatible con rewrites/proxies
✅ CORS configurado correctamente
✅ Rate limiting solo en /api/*
✅ Rutas duales para compatibilidad
```

---

## 🎯 URLs de Producción

```
Frontend:     https://horasamarantus.onrender.com
Backend:      https://horasamarantus-backend.onrender.com
Health:       https://horasamarantus-backend.onrender.com/health
Login:        https://horasamarantus-backend.onrender.com/api/auth/login
```

---

**¡Arquitectura completa y compatible!** 🚀
