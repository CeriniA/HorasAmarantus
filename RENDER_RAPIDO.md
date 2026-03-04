# ⚡ Deploy Rápido en Render (15 min)

## 🎯 TODO en Render.com

Frontend + Backend en un solo lugar.

---

## 📋 PASO 1: Backend (10 min)

### 1. Crear Web Service

```
render.com → Sign up con GitHub → New + → Web Service
```

### 2. Configurar

```
Repository: HorasAmarantus
Name: horas-amarantus-backend
Region: Oregon
Branch: main
Root: backend
Build: npm install
Start: npm start
Plan: Free
```

### 3. Variables de Entorno

Click **Advanced** → **Add Environment Variable**:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
JWT_SECRET=secreto-aleatorio-minimo-32-caracteres
FRONTEND_URL=https://horas-amarantus.onrender.com
```

**Obtener Service Role Key**:
- Supabase → Settings → API → service_role key (secret)

### 4. Deploy

```
Create Web Service → Esperar 5 min
```

### 5. Verificar

```
https://horas-amarantus-backend.onrender.com/health
```

Debe responder: `{"status":"ok",...}`

---

## 🎨 PASO 2: Frontend (5 min)

### 1. Crear Static Site

```
Dashboard → New + → Static Site → HorasAmarantus
```

### 2. Configurar

```
Name: horas-amarantus
Branch: main
Root: frontend
Build: npm run build
Publish: dist
```

### 3. Variables de Entorno

```
VITE_API_URL=https://horas-amarantus-backend.onrender.com
VITE_SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZ3h1bG5zbml3bHJtb3Vyc3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg3NDIsImV4cCI6MjA4ODEyNDc0Mn0.Pk2e4lwuS4tSnnm6YtNsC-7YWcZqM_HideRRRJ4_sTM
```

### 4. Deploy

```
Create Static Site → Esperar 3 min
```

### 5. Verificar

```
https://horas-amarantus.onrender.com
```

Debe mostrar login.

---

## 🔄 PASO 3: Actualizar CORS (2 min)

```
Backend → Environment → Editar FRONTEND_URL:
FRONTEND_URL=https://horas-amarantus.onrender.com

Save Changes → Esperar redespliegue
```

---

## ✅ PASO 4: Probar

```
https://horas-amarantus.onrender.com
Login → Debe funcionar
```

---

## 🔧 PASO 5: Mantener Despierto (Opcional)

### Si usas plan Free:

```
cron-job.org → Create cronjob:
URL: https://horas-amarantus-backend.onrender.com/health
Schedule: Cada 10 minutos
```

---

## 📊 URLs Finales

```
App: https://horas-amarantus.onrender.com
API: https://horas-amarantus-backend.onrender.com
```

---

## 💰 Costo

```
GRATIS ($0/mes)
```

**Limitación**: Backend se duerme (30s para despertar).

**Solución**: Cron-job o upgrade a $7/mes.

---

## 🆘 Problemas

### Error de CORS
→ Verificar `FRONTEND_URL` en backend

### Variables no funcionan
→ Deben empezar con `VITE_` en frontend

### Backend tarda
→ Normal en plan Free. Configurar cron-job.

---

**Guía completa**: `DEPLOY_RENDER_COMPLETO.md`

**¡Listo en 15 minutos!** 🚀
