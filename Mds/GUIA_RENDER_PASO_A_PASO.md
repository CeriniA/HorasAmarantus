# 🚀 Guía Completa: Desplegar en Render.com

## 📋 Requisitos Previos

✅ Código en GitHub: `https://github.com/CeriniA/HorasAmarantus.git`
✅ Cuenta de Supabase activa
✅ Variables de entorno conocidas

---

## 🎯 PARTE 1: Preparar el Código

### Paso 1.1: Crear `.gitignore` en Backend

**Verificar que existe**: `backend/.gitignore`

```
node_modules/
.env
.env.local
.env.production
*.log
dist/
```

### Paso 1.2: Crear `vercel.json` para Frontend

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
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Paso 1.3: Verificar `package.json` del Backend

**Archivo**: `backend/package.json`

Asegurarse que tenga:

```json
{
  "name": "sistema-horas-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Paso 1.4: Actualizar CORS en Backend

**Archivo**: `backend/src/app.js`

```javascript
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'https://horas-amarantus.vercel.app', // Tu dominio de Vercel
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### Paso 1.5: Crear Endpoint de Health Check

**Archivo**: `backend/src/app.js`

Agregar antes de las rutas:

```javascript
// Health check para Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Paso 1.6: Hacer Commit y Push

```bash
cd "c:\Users\Adri\Desktop\Sistema Horas\app-web"
git add .
git commit -m "Preparar para deploy en Render"
git push origin main
```

---

## 🔧 PARTE 2: Desplegar Backend en Render

### Paso 2.1: Crear Cuenta en Render

1. Ir a https://render.com
2. Click en **"Get Started"**
3. Registrarse con **GitHub**
4. Autorizar Render a acceder a tus repositorios

### Paso 2.2: Crear Web Service para Backend

1. En el Dashboard, click **"New +"** → **"Web Service"**

2. **Conectar Repositorio**:
   - Buscar: `HorasAmarantus`
   - Click en **"Connect"**

3. **Configurar el Servicio**:

   ```
   Name: horas-amarantus-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Seleccionar Plan**:
   - **Free** (para empezar)
   - Click en **"Advanced"** para configurar variables

### Paso 2.3: Configurar Variables de Entorno

En la sección **Environment Variables**, agregar:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
JWT_SECRET=un-secreto-super-seguro-aleatorio-de-al-menos-32-caracteres
FRONTEND_URL=https://horas-amarantus.vercel.app
```

**⚠️ IMPORTANTE**: 
- `PORT=10000` (Render usa este puerto por defecto)
- `JWT_SECRET` debe ser una cadena aleatoria larga
- `FRONTEND_URL` lo actualizaremos después de desplegar el frontend

### Paso 2.4: Desplegar

1. Click en **"Create Web Service"**
2. Esperar ~5-10 minutos mientras se despliega
3. Ver logs en tiempo real

### Paso 2.5: Verificar Despliegue

Una vez completado:

1. Copiar la URL: `https://horas-amarantus-backend.onrender.com`
2. Probar en navegador:
   ```
   https://horas-amarantus-backend.onrender.com/health
   ```
3. Debería responder:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-03-04T...",
     "uptime": 123.45
   }
   ```

---

## 🎨 PARTE 3: Desplegar Frontend en Vercel

### Paso 3.1: Crear Cuenta en Vercel

1. Ir a https://vercel.com
2. Click en **"Sign Up"**
3. Registrarse con **GitHub**
4. Autorizar Vercel

### Paso 3.2: Importar Proyecto

1. En el Dashboard, click **"Add New..."** → **"Project"**
2. Buscar repositorio: `HorasAmarantus`
3. Click en **"Import"**

### Paso 3.3: Configurar el Proyecto

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Paso 3.4: Configurar Variables de Entorno

En **Environment Variables**, agregar:

```
VITE_API_URL=https://horas-amarantus-backend.onrender.com
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**⚠️ IMPORTANTE**: 
- Usar la URL del backend de Render (del Paso 2.5)
- Las variables deben empezar con `VITE_`

### Paso 3.5: Desplegar

1. Click en **"Deploy"**
2. Esperar ~2-3 minutos
3. Ver logs de build

### Paso 3.6: Verificar Despliegue

Una vez completado:

1. Copiar la URL: `https://horas-amarantus.vercel.app`
2. Abrir en navegador
3. Debería cargar la página de login

---

## 🔄 PARTE 4: Actualizar CORS en Backend

### Paso 4.1: Actualizar Variable de Entorno

1. Ir a Render Dashboard
2. Seleccionar `horas-amarantus-backend`
3. Ir a **Environment**
4. Editar `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://horas-amarantus.vercel.app
   ```
5. Click en **"Save Changes"**
6. El servicio se redesplegará automáticamente (~2 min)

---

## ✅ PARTE 5: Verificación Final

### Paso 5.1: Probar Login

1. Ir a `https://horas-amarantus.vercel.app`
2. Intentar hacer login con un usuario existente
3. Debería funcionar correctamente

### Paso 5.2: Verificar PWA

1. En Chrome, abrir DevTools (F12)
2. Ir a pestaña **Application**
3. Verificar **Service Worker** está registrado
4. Verificar **Manifest** está cargado

### Paso 5.3: Probar Offline

1. En DevTools, ir a **Network**
2. Marcar checkbox **Offline**
3. Recargar página
4. Debería funcionar offline

### Paso 5.4: Verificar HTTPS

1. Click en el candado en la barra de direcciones
2. Verificar que dice **"Conexión segura"**
3. Certificado SSL válido (automático en Vercel/Render)

---

## 🐛 PARTE 6: Troubleshooting

### Problema 1: Error 500 en Backend

**Síntoma**: Backend responde con error 500

**Solución**:
1. Ir a Render Dashboard → Logs
2. Ver el error específico
3. Verificar variables de entorno
4. Verificar que `PORT=10000`

### Problema 2: Error de CORS

**Síntoma**: 
```
Access to fetch at '...' from origin '...' has been blocked by CORS
```

**Solución**:
1. Verificar `FRONTEND_URL` en Render
2. Verificar que coincide exactamente con URL de Vercel
3. No incluir `/` al final
4. Esperar ~2 min a que se redespliegue

### Problema 3: Variables de Entorno No Funcionan

**Síntoma**: App no se conecta a Supabase

**Solución Frontend**:
1. Verificar que variables empiezan con `VITE_`
2. Redesplegar en Vercel:
   - Ir a **Deployments**
   - Click en **"..."** → **"Redeploy"**

**Solución Backend**:
1. Verificar nombres exactos de variables
2. En Render, click **"Manual Deploy"** → **"Deploy latest commit"**

### Problema 4: Backend Se Duerme (Plan Free)

**Síntoma**: Primera request tarda ~30 segundos

**Solución**: Usar cron-job para mantenerlo despierto

1. Ir a https://cron-job.org
2. Crear cuenta gratis
3. Crear nuevo cron job:
   - **Title**: Keep Backend Alive
   - **URL**: `https://horas-amarantus-backend.onrender.com/health`
   - **Schedule**: Every 10 minutes
   - **Enabled**: Yes
4. Guardar

### Problema 5: Build Falla en Vercel

**Síntoma**: Error durante build

**Solución**:
1. Ver logs completos en Vercel
2. Verificar que `package.json` tiene todas las dependencias
3. Verificar que `vite.config.js` está correcto
4. Probar build local:
   ```bash
   cd frontend
   npm run build
   ```

---

## 🔧 PARTE 7: Configuración Adicional (Opcional)

### Dominio Personalizado en Vercel

1. Comprar dominio (ej: Namecheap, GoDaddy)
2. En Vercel Dashboard:
   - **Settings** → **Domains**
   - Click **"Add"**
   - Ingresar dominio: `horas.tu-dominio.com`
3. Configurar DNS según instrucciones de Vercel
4. Esperar propagación (~24 horas máximo)

### Dominio Personalizado en Render

1. En Render Dashboard:
   - **Settings** → **Custom Domain**
   - Click **"Add Custom Domain"**
   - Ingresar: `api.tu-dominio.com`
2. Configurar DNS:
   ```
   Type: CNAME
   Name: api
   Value: horas-amarantus-backend.onrender.com
   ```
3. Esperar verificación (~10 min)

### Configurar Redirects en Vercel

**Crear**: `frontend/vercel.json`

```json
{
  "redirects": [
    {
      "source": "/api/:path*",
      "destination": "https://horas-amarantus-backend.onrender.com/:path*"
    }
  ]
}
```

Esto permite llamar al backend como `/api/...` en vez de URL completa.

---

## 📊 PARTE 8: Monitoreo

### Ver Logs en Render

1. Dashboard → `horas-amarantus-backend`
2. Pestaña **Logs**
3. Ver logs en tiempo real
4. Filtrar por nivel: Info, Warning, Error

### Ver Analytics en Vercel

1. Dashboard → Proyecto
2. Pestaña **Analytics**
3. Ver:
   - Visitas
   - Performance
   - Errores

### Configurar Alertas

**En Render**:
1. **Settings** → **Notifications**
2. Agregar email para alertas de:
   - Deploy fallido
   - Servicio caído
   - Uso de recursos

---

## 🚀 PARTE 9: Actualizar la App

### Flujo de Actualización

```bash
# 1. Hacer cambios en código local
# 2. Probar localmente
npm run dev

# 3. Commit y push
git add .
git commit -m "Descripción de cambios"
git push origin main

# 4. Auto-deploy
# Render y Vercel detectan el push y redesplegan automáticamente
```

### Rollback en Caso de Error

**En Vercel**:
1. **Deployments**
2. Buscar deployment anterior que funcionaba
3. Click **"..."** → **"Promote to Production"**

**En Render**:
1. **Deploys**
2. Buscar deploy anterior
3. Click **"..."** → **"Redeploy"**

---

## 📝 Checklist Final

### Backend en Render ✅
- [ ] Servicio creado y desplegado
- [ ] Variables de entorno configuradas
- [ ] `/health` responde correctamente
- [ ] Logs sin errores
- [ ] CORS configurado

### Frontend en Vercel ✅
- [ ] Proyecto importado y desplegado
- [ ] Variables de entorno configuradas
- [ ] Login funciona
- [ ] PWA funciona
- [ ] Offline mode funciona
- [ ] HTTPS activo

### Integración ✅
- [ ] Frontend se conecta al backend
- [ ] No hay errores de CORS
- [ ] Supabase conectado
- [ ] Todas las funcionalidades probadas

---

## 💰 Costos

### Plan Actual (Free)

```
Render Free:
- 750 horas/mes
- Se duerme después de 15 min inactivo
- 512 MB RAM
- Costo: $0/mes

Vercel Hobby:
- 100 GB bandwidth
- Builds ilimitados
- Costo: $0/mes

Supabase Free:
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- Costo: $0/mes

TOTAL: $0/mes
```

### Upgrade Futuro

Si necesitas más recursos:

```
Render Starter: $7/mes
- Siempre activo (no se duerme)
- 512 MB RAM
- Mejor performance

Railway Hobby: $5/mes
- Alternativa a Render
- $5 de crédito incluido
- Mejor uptime
```

---

## 🎯 URLs Finales

```
Frontend: https://horas-amarantus.vercel.app
Backend: https://horas-amarantus-backend.onrender.com
Health Check: https://horas-amarantus-backend.onrender.com/health
```

---

## 📞 Soporte

### Render
- Docs: https://render.com/docs
- Status: https://status.render.com
- Community: https://community.render.com

### Vercel
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com
- Support: https://vercel.com/support

---

**¡Listo! Tu app está en producción.** 🎉

**Próximos pasos**:
1. Compartir URL con usuarios
2. Monitorear logs
3. Configurar dominio personalizado (opcional)
4. Configurar cron-job para mantener backend despierto
