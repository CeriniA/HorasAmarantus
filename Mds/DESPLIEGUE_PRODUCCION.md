# 🚀 Despliegue a Producción - Guía Completa

## 🎯 Tu Stack Actual

- **Frontend**: React (Vite) + PWA
- **Backend**: Node.js + Express
- **Base de Datos**: Supabase (ya en la nube)
- **Archivos estáticos**: Frontend compilado

---

## 💰 Comparación de Opciones (Ordenadas por Precio)

### 🏆 OPCIÓN 1: VERCEL (Frontend) + RENDER (Backend) - GRATIS

#### Costos:
- **Vercel**: $0/mes (plan Hobby)
- **Render**: $0/mes (plan Free)
- **Supabase**: $0/mes (ya lo tienes)
- **TOTAL**: **$0/mes** ✅

#### Características:
- ✅ **Frontend en Vercel**: Despliegue automático desde Git
- ✅ **Backend en Render**: 750 horas gratis/mes
- ✅ **SSL gratis** en ambos
- ✅ **Dominio gratis**: `tu-app.vercel.app` y `tu-api.onrender.com`
- ⚠️ **Limitación**: Backend se duerme después de 15 min inactivo (tarda ~30s en despertar)

#### Ideal para:
- ✅ Uso interno con pocos usuarios
- ✅ No requiere 100% uptime
- ✅ Presupuesto $0

---

### 🥈 OPCIÓN 2: NETLIFY (Frontend) + RAILWAY (Backend) - $5/mes

#### Costos:
- **Netlify**: $0/mes (plan Free)
- **Railway**: $5/mes (plan Hobby)
- **Supabase**: $0/mes
- **TOTAL**: **$5/mes** ✅

#### Características:
- ✅ **Frontend en Netlify**: Similar a Vercel
- ✅ **Backend en Railway**: NO se duerme, siempre activo
- ✅ **SSL gratis**
- ✅ **$5 de crédito gratis** al inicio
- ✅ **Mejor performance** que Render Free

#### Ideal para:
- ✅ Uso profesional
- ✅ Necesitas que esté siempre activo
- ✅ Presupuesto bajo

---

### 🥉 OPCIÓN 3: HOSTINGER VPS - $4-8/mes

#### Costos:
- **Hostinger VPS**: $4-8/mes (según plan)
- **Supabase**: $0/mes
- **TOTAL**: **$4-8/mes**

#### Características:
- ✅ **Control total** del servidor
- ✅ **Frontend + Backend** en el mismo servidor
- ✅ **Dominio incluido** (algunos planes)
- ⚠️ **Requiere configuración manual**: Nginx, PM2, SSL, etc.
- ⚠️ **Mantenimiento**: Actualizaciones de seguridad, etc.

#### Ideal para:
- ✅ Quieres control total
- ✅ Sabes administrar servidores Linux
- ✅ Necesitas personalización

---

### 💎 OPCIÓN 4: RENDER PAID - $7/mes

#### Costos:
- **Render**: $7/mes (Starter)
- **Supabase**: $0/mes
- **TOTAL**: **$7/mes**

#### Características:
- ✅ **Frontend + Backend** en Render
- ✅ **NO se duerme**
- ✅ **SSL gratis**
- ✅ **Fácil configuración**
- ✅ **Auto-deploy** desde Git

#### Ideal para:
- ✅ Quieres todo en un lugar
- ✅ Fácil de mantener
- ✅ Presupuesto moderado

---

### ❌ NO RECOMENDADO: HOSTINGER HOSTING COMPARTIDO

#### Por qué NO:
- ❌ **No soporta Node.js** bien (solo PHP)
- ❌ **Limitaciones** en procesos
- ❌ **No es para apps modernas**

---

## 🏆 RECOMENDACIÓN FINAL

### Para Empezar (Presupuesto $0):

```
✅ Frontend: VERCEL (gratis)
✅ Backend: RENDER FREE (gratis)
✅ Base de Datos: SUPABASE (gratis)

TOTAL: $0/mes
```

**Ventajas**:
- Sin costo inicial
- Fácil de configurar
- Puedes escalar después

**Desventajas**:
- Backend se duerme (30s delay al despertar)

---

### Para Producción Seria (Presupuesto $5/mes):

```
✅ Frontend: NETLIFY (gratis)
✅ Backend: RAILWAY ($5/mes)
✅ Base de Datos: SUPABASE (gratis)

TOTAL: $5/mes
```

**Ventajas**:
- Siempre activo
- Mejor performance
- Muy económico

**Desventajas**:
- Costo mensual (mínimo)

---

## 📊 Tabla Comparativa Detallada

| Característica | Vercel+Render Free | Netlify+Railway | Hostinger VPS | Render Paid |
|----------------|-------------------|-----------------|---------------|-------------|
| **Costo/mes** | $0 | $5 | $4-8 | $7 |
| **Siempre activo** | ❌ | ✅ | ✅ | ✅ |
| **SSL gratis** | ✅ | ✅ | ⚠️ Manual | ✅ |
| **Auto-deploy** | ✅ | ✅ | ❌ | ✅ |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Escalabilidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🚀 Guía de Despliegue: VERCEL + RENDER (GRATIS)

### PASO 1: Preparar el Código

#### 1.1 Crear archivo de configuración para Vercel

**Crear**: `frontend/vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

#### 1.2 Actualizar variables de entorno

**Frontend** (`.env.production`):
```env
VITE_API_URL=https://tu-backend.onrender.com
VITE_SUPABASE_URL=tu-url-supabase
VITE_SUPABASE_ANON_KEY=tu-key-supabase
```

**Backend** (`.env` en Render):
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=tu-url-supabase
SUPABASE_SERVICE_ROLE_KEY=tu-service-key
FRONTEND_URL=https://tu-app.vercel.app
JWT_SECRET=tu-secret-super-seguro
```

---

### PASO 2: Desplegar Backend en Render

#### 2.1 Crear cuenta en Render

1. Ir a https://render.com
2. Registrarse con GitHub
3. Click en **"New +"** → **"Web Service"**

#### 2.2 Conectar repositorio

1. Seleccionar tu repositorio
2. Configurar:
   - **Name**: `sistema-horas-backend`
   - **Region**: Oregon (más cercano a Supabase)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### 2.3 Agregar variables de entorno

En la sección **Environment**:
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=https://tu-app.vercel.app
JWT_SECRET=...
```

#### 2.4 Desplegar

Click en **"Create Web Service"**

Esperar ~5 minutos. URL será: `https://sistema-horas-backend.onrender.com`

---

### PASO 3: Desplegar Frontend en Vercel

#### 3.1 Crear cuenta en Vercel

1. Ir a https://vercel.com
2. Registrarse con GitHub
3. Click en **"Add New..."** → **"Project"**

#### 3.2 Importar repositorio

1. Seleccionar tu repositorio
2. Configurar:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 3.3 Agregar variables de entorno

```
VITE_API_URL=https://sistema-horas-backend.onrender.com
VITE_SUPABASE_URL=tu-url-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

#### 3.4 Desplegar

Click en **"Deploy"**

Esperar ~2 minutos. URL será: `https://sistema-horas.vercel.app`

---

### PASO 4: Configurar CORS en Backend

**Archivo**: `backend/src/app.js`

```javascript
const corsOptions = {
  origin: [
    'https://sistema-horas.vercel.app',
    'http://localhost:5173' // Para desarrollo
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

Hacer commit y push → Render auto-desplegará.

---

### PASO 5: Verificar

1. **Backend**: https://sistema-horas-backend.onrender.com/health
2. **Frontend**: https://sistema-horas.vercel.app
3. **Login**: Probar con usuario existente

---

## 🔧 Configuración Adicional

### Dominio Personalizado (Opcional)

#### En Vercel:
1. **Settings** → **Domains**
2. Agregar `tu-dominio.com`
3. Configurar DNS según instrucciones

#### En Render:
1. **Settings** → **Custom Domain**
2. Agregar `api.tu-dominio.com`
3. Configurar DNS

---

### Mantener Backend Despierto (Render Free)

**Crear**: `backend/keep-alive.js`

```javascript
import https from 'https';

const BACKEND_URL = 'https://sistema-horas-backend.onrender.com';

function ping() {
  https.get(`${BACKEND_URL}/health`, (res) => {
    console.log(`✅ Ping: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('❌ Error:', err.message);
  });
}

// Ping cada 10 minutos
setInterval(ping, 10 * 60 * 1000);

console.log('🔄 Keep-alive iniciado');
```

**Usar servicio externo** (más fácil):
- https://cron-job.org (gratis)
- Configurar ping a `https://tu-backend.onrender.com/health` cada 10 min

---

## 💡 Tips de Optimización

### 1. Comprimir Assets

**Frontend** - `vite.config.js`:

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
});
```

---

### 2. Caché en Backend

```javascript
// Cache de respuestas frecuentes
const cache = new Map();

app.get('/api/organizational-units', authenticate, (req, res) => {
  const cacheKey = `units_${req.user.id}`;
  
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  // Obtener datos...
  cache.set(cacheKey, data);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000); // 5 min
  
  res.json(data);
});
```

---

### 3. Lazy Loading en Frontend

```javascript
// App.jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/reports" element={<Reports />} />
  </Routes>
</Suspense>
```

---

## 📊 Costos a Largo Plazo

### Escenario 1: Empezar Gratis

```
Mes 1-6: $0/mes (Vercel + Render Free)
Mes 7+: $5/mes (Migrar a Railway si crece)
```

### Escenario 2: Empezar con Railway

```
Mes 1+: $5/mes (Netlify + Railway)
```

### Escenario 3: Escalar

```
Mes 1-12: $5/mes (Railway)
Mes 13+: $20/mes (Railway Pro si necesitas más recursos)
```

---

## ✅ Checklist de Despliegue

- [ ] Código en GitHub
- [ ] Variables de entorno configuradas
- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Vercel
- [ ] CORS configurado
- [ ] SSL funcionando (automático)
- [ ] Login probado
- [ ] PWA funcionando
- [ ] Offline mode probado
- [ ] Dominio personalizado (opcional)

---

## 🆘 Troubleshooting

### Backend se duerme muy rápido

**Solución**: Usar cron-job.org para hacer ping cada 10 min

### Error de CORS

**Verificar**: `FRONTEND_URL` en backend coincide con URL de Vercel

### PWA no funciona

**Verificar**: HTTPS está activo (automático en Vercel/Render)

### Variables de entorno no funcionan

**Verificar**: Nombres correctos (`VITE_` prefix en frontend)

---

## 🎯 RESUMEN EJECUTIVO

### Opción Recomendada: VERCEL + RENDER FREE

**Costo**: $0/mes

**Pasos**:
1. Push código a GitHub
2. Conectar Render (backend)
3. Conectar Vercel (frontend)
4. Configurar variables de entorno
5. ¡Listo!

**Tiempo total**: ~30 minutos

**Migración futura**: Si crece, migrar backend a Railway ($5/mes)

---

**¿Listo para desplegar? Puedo guiarte paso a paso.** 🚀
