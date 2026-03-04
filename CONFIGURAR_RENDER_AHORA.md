# 🚨 CONFIGURAR RENDER AHORA - URGENTE

## ⚠️ Problema Actual

El backend está respondiendo `404` en `/auth/login` porque:
1. El request llega sin el prefijo `/api`
2. O las variables de entorno no están configuradas

**Fix aplicado**: Agregadas rutas alternativas sin `/api` para compatibilidad.

---

## 🔧 PASO 1: Configurar Backend en Render

### Ir a Render Dashboard

1. **Abrir**: https://dashboard.render.com
2. **Seleccionar**: `horasamarantus-backend` (Web Service)
3. **Click en**: **Environment** (menú izquierdo)

### Agregar/Verificar Variables

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZ3h1bG5zbml3bHJtb3Vyc3N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU0ODc0MiwiZXhwIjoyMDg4MTI0NzQyfQ.Zj5L7d74u25nautUwht4I9yhKDbbc-2Q1mdpOkczskY
JWT_SECRET=4cf78a86c57206b2901ae74d676290f494585b5a99dbd5de77d69bd4584a276d8c7d42358c6b163a4ed85f0982a87fc4ef99b34e22aa23cf4a69448878d52bf6
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://horasamarantus.onrender.com
```

**⚠️ IMPORTANTE**:
- `FRONTEND_URL` debe ser **EXACTAMENTE**: `https://horasamarantus.onrender.com`
- Sin `/` al final
- Sin espacios

### Guardar y Redesplegar

1. **Click en**: **Save Changes**
2. Render redesplegará automáticamente (~5 min)

---

## 🔧 PASO 2: Configurar Frontend en Render

### Ir a Render Dashboard

1. **Abrir**: https://dashboard.render.com
2. **Seleccionar**: `horasamarantus` (Static Site)
3. **Click en**: **Environment** (menú izquierdo)

### Agregar/Verificar Variables

```env
VITE_API_URL=https://horasamarantus-backend.onrender.com
VITE_SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZ3h1bG5zbml3bHJtb3Vyc3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg3NDIsImV4cCI6MjA4ODEyNDc0Mn0.Pk2e4lwuS4tSnnm6YtNsC-7YWcZqM_HideRRRJ4_sTM
```

**⚠️ IMPORTANTE**:
- `VITE_API_URL` debe ser **EXACTAMENTE**: `https://horasamarantus-backend.onrender.com`
- Sin `/api` al final
- Sin espacios

### Guardar y Redesplegar

1. **Click en**: **Save Changes**
2. **Click en**: **Manual Deploy** → **Clear build cache & deploy**

---

## 🚀 PASO 3: Hacer Deploy del Código

Ejecuta en tu terminal:

```bash
cd "c:\Users\Adri\Desktop\Sistema Horas\app-web"
git add .
git commit -m "Fix: Agregar rutas alternativas sin /api"
git push
```

---

## ⏱️ Esperar Deploy

- **Backend**: ~5 minutos
- **Frontend**: ~3 minutos

**Total**: ~8 minutos

---

## ✅ PASO 4: Verificar que Funciona

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

### 2. Verificar Login Directo

Abre **Postman** o **Thunder Client** y haz:

**POST**: `https://horasamarantus-backend.onrender.com/api/auth/login`

**Body** (JSON):
```json
{
  "email": "superadmin",
  "password": "ContraseñaDificil123!"
}
```

**Debe responder**:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "superadmin"
  }
}
```

---

### 3. Verificar Frontend

1. Abre: `https://horasamarantus.onrender.com`
2. Intenta login con:
   - Usuario: `superadmin`
   - Contraseña: `ContraseñaDificil123!`
3. Debería funcionar ✅

---

## 🐛 Si Sigue Sin Funcionar

### Verificar Logs del Backend

1. **Render Dashboard** → `horasamarantus-backend`
2. **Click en**: **Logs**
3. Buscar errores

### Verificar CORS

Si ves error de CORS:
```
Access to fetch at '...' has been blocked by CORS policy
```

**Solución**:
1. Verificar que `FRONTEND_URL` en backend sea exactamente: `https://horasamarantus.onrender.com`
2. Redesplegar backend

---

### Verificar que Backend Está Activo

1. **Render Dashboard** → `horasamarantus-backend`
2. **Status** debe ser: **Live** (verde)
3. Si está **Suspended** o **Failed**, click en **Manual Deploy**

---

## 📋 Checklist Final

### Backend
- [ ] Variables de entorno configuradas
- [ ] `FRONTEND_URL=https://horasamarantus.onrender.com`
- [ ] Status: **Live**
- [ ] `/health` responde 200 OK
- [ ] Logs sin errores

### Frontend
- [ ] Variables de entorno configuradas
- [ ] `VITE_API_URL=https://horasamarantus-backend.onrender.com`
- [ ] Build exitoso
- [ ] Status: **Live**

### Integración
- [ ] Login funciona desde frontend
- [ ] No hay errores de CORS
- [ ] Health check funciona
- [ ] Requests llegan al backend

---

## 🎯 URLs Finales

```
Frontend:     https://horasamarantus.onrender.com
Backend:      https://horasamarantus-backend.onrender.com
Health:       https://horasamarantus-backend.onrender.com/health
Login:        https://horasamarantus-backend.onrender.com/api/auth/login
```

---

## 💡 Notas Importantes

### Plan Free de Render

- Backend se duerme después de 15 min sin uso
- Primera request tarda ~30 segundos (despertar)
- Solución: Upgrade a Starter ($7/mes) o usar cron-job

### CORS

- Debe estar configurado exactamente
- Sin espacios, sin `/` al final
- Protocolo correcto (`https://`)

### Variables de Entorno

- Cambios requieren redespliegue
- Frontend: Clear build cache
- Backend: Redeploy automático

---

**¡Configura las variables AHORA y espera el deploy!** 🚀
