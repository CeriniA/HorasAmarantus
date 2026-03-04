# 🚀 Deploy Rápido - Render.com

## ✅ Preparación (Ya Hecho)

- [x] Código en GitHub: `https://github.com/CeriniA/HorasAmarantus.git`
- [x] `vercel.json` creado
- [x] `package.json` con engines
- [x] Health check endpoint

---

## 📋 PASO 1: Backend en Render (10 min)

### 1.1 Crear Servicio

1. Ir a https://render.com
2. Sign up con GitHub
3. **New +** → **Web Service**
4. Conectar repo: `HorasAmarantus`

### 1.2 Configurar

```
Name: horas-amarantus-backend
Region: Oregon
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### 1.3 Variables de Entorno

Click en **Advanced** → **Add Environment Variable**:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=mi-secreto-super-seguro-de-al-menos-32-caracteres-aleatorios
FRONTEND_URL=https://horas-amarantus.vercel.app
```

### 1.4 Deploy

- Click **Create Web Service**
- Esperar ~5 min
- URL: `https://horas-amarantus-backend.onrender.com`

### 1.5 Verificar

Abrir: `https://horas-amarantus-backend.onrender.com/health`

Debe responder:
```json
{"status":"ok","timestamp":"2026-03-04T..."}
```

---

## 🎨 PASO 2: Frontend en Vercel (5 min)

### 2.1 Crear Proyecto

1. Ir a https://vercel.com
2. Sign up con GitHub
3. **Add New** → **Project**
4. Importar: `HorasAmarantus`

### 2.2 Configurar

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

### 2.3 Variables de Entorno

```
VITE_API_URL=https://horas-amarantus-backend.onrender.com
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.4 Deploy

- Click **Deploy**
- Esperar ~2 min
- URL: `https://horas-amarantus.vercel.app`

### 2.5 Verificar

Abrir: `https://horas-amarantus.vercel.app`

Debe mostrar página de login.

---

## 🔄 PASO 3: Actualizar CORS (2 min)

### 3.1 En Render

1. Dashboard → `horas-amarantus-backend`
2. **Environment**
3. Editar `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://horas-amarantus.vercel.app
   ```
4. **Save Changes**
5. Esperar redespliegue (~2 min)

---

## ✅ PASO 4: Probar

1. Ir a `https://horas-amarantus.vercel.app`
2. Hacer login
3. Verificar que funciona

---

## 🔧 Mantener Backend Despierto (Opcional)

### Usar cron-job.org

1. Ir a https://cron-job.org
2. Crear cuenta
3. **Create cronjob**:
   - Title: `Keep Backend Alive`
   - URL: `https://horas-amarantus-backend.onrender.com/health`
   - Schedule: `*/10 * * * *` (cada 10 min)
4. Save

---

## 📊 URLs Finales

```
Frontend: https://horas-amarantus.vercel.app
Backend: https://horas-amarantus-backend.onrender.com
Health: https://horas-amarantus-backend.onrender.com/health
```

---

## 🆘 Problemas Comunes

### Error de CORS

**Solución**: Verificar que `FRONTEND_URL` en Render coincide exactamente con URL de Vercel.

### Backend tarda en responder

**Normal**: Plan Free se duerme. Primera request tarda ~30s.

**Solución**: Configurar cron-job (arriba).

### Variables no funcionan

**Frontend**: Deben empezar con `VITE_`

**Backend**: Redesplegar manualmente en Render.

---

## 💰 Costo

```
Render Free: $0/mes
Vercel Hobby: $0/mes
Supabase Free: $0/mes

TOTAL: $0/mes
```

---

**Guía completa**: `Mds/GUIA_RENDER_PASO_A_PASO.md`

**¡Listo en 15 minutos!** 🎉
