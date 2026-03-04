# 🚀 Deploy Completo en Render.com

## 🎯 Ventajas de Usar Solo Render

- ✅ Todo en un solo lugar (frontend + backend)
- ✅ Fácil de administrar
- ✅ Un solo dashboard
- ✅ Configuración más simple

---

## 💰 Costos

### Opción 1: Todo Gratis
```
Backend (Web Service Free): $0/mes
Frontend (Static Site Free): $0/mes

TOTAL: $0/mes
```

**Limitación**: Backend se duerme después de 15 min inactivo.

### Opción 2: Backend Siempre Activo
```
Backend (Starter): $7/mes
Frontend (Static Site Free): $0/mes

TOTAL: $7/mes
```

**Ventaja**: Backend nunca se duerme, mejor performance.

---

## 📋 PARTE 1: Backend en Render

### Paso 1.1: Crear Web Service

1. Ir a https://render.com
2. **Sign Up** con GitHub
3. Autorizar Render
4. En Dashboard, click **"New +"** → **"Web Service"**

### Paso 1.2: Conectar Repositorio

1. Buscar: `HorasAmarantus`
2. Click **"Connect"**

### Paso 1.3: Configurar Backend

```
Name: horas-amarantus-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### Paso 1.4: Variables de Entorno

Click en **"Advanced"** → **"Add Environment Variable"**

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
JWT_SECRET=un-secreto-super-seguro-aleatorio-de-al-menos-32-caracteres
FRONTEND_URL=https://horas-amarantus.onrender.com
```

**⚠️ IMPORTANTE**:
- `SUPABASE_SERVICE_ROLE_KEY`: Obtenerlo de Supabase → Settings → API → service_role key
- `JWT_SECRET`: Generar uno aleatorio (mínimo 32 caracteres)
- `FRONTEND_URL`: Será la URL del frontend en Render (lo actualizaremos después)

### Paso 1.5: Crear Servicio

1. Click **"Create Web Service"**
2. Esperar ~5-10 minutos
3. Ver logs en tiempo real

### Paso 1.6: Verificar Backend

Una vez desplegado:

1. Copiar URL: `https://horas-amarantus-backend.onrender.com`
2. Abrir en navegador:
   ```
   https://horas-amarantus-backend.onrender.com/health
   ```
3. Debe responder:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-03-04T..."
   }
   ```

✅ **Backend listo!**

---

## 🎨 PARTE 2: Frontend en Render

### Paso 2.1: Crear Static Site

1. En Dashboard de Render, click **"New +"** → **"Static Site"**
2. Seleccionar mismo repositorio: `HorasAmarantus`
3. Click **"Connect"**

### Paso 2.2: Configurar Frontend

```
Name: horas-amarantus
Branch: main
Root Directory: frontend
Build Command: npm run build
Publish Directory: dist
```

### Paso 2.3: Variables de Entorno

En **"Advanced"** → **"Add Environment Variable"**:

```
VITE_API_URL=https://horas-amarantus-backend.onrender.com
VITE_SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZ3h1bG5zbml3bHJtb3Vyc3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg3NDIsImV4cCI6MjA4ODEyNDc0Mn0.Pk2e4lwuS4tSnnm6YtNsC-7YWcZqM_HideRRRJ4_sTM
```

**⚠️ IMPORTANTE**:
- `VITE_API_URL`: URL del backend (del Paso 1.6)
- Variables deben empezar con `VITE_`

### Paso 2.4: Crear Static Site

1. Click **"Create Static Site"**
2. Esperar ~3-5 minutos
3. Ver logs de build

### Paso 2.5: Verificar Frontend

Una vez desplegado:

1. Copiar URL: `https://horas-amarantus.onrender.com`
2. Abrir en navegador
3. Debe mostrar página de login

✅ **Frontend listo!**

---

## 🔄 PARTE 3: Actualizar CORS en Backend

### Paso 3.1: Actualizar Variable

1. Ir a Dashboard → **"horas-amarantus-backend"**
2. Click en **"Environment"**
3. Editar `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://horas-amarantus.onrender.com
   ```
4. Click **"Save Changes"**
5. El servicio se redesplegará automáticamente (~2 min)

---

## ✅ PARTE 4: Verificación Final

### Paso 4.1: Probar Login

1. Ir a `https://horas-amarantus.onrender.com`
2. Intentar login con usuario existente
3. Debe funcionar correctamente

### Paso 4.2: Verificar Consola

1. Abrir DevTools (F12)
2. Ir a pestaña **Console**
3. No debe haber errores de CORS
4. No debe haber errores de conexión

### Paso 4.3: Probar Funcionalidades

- [ ] Login funciona
- [ ] Dashboard carga
- [ ] Crear registro de horas
- [ ] Ver reportes
- [ ] PWA funciona
- [ ] Offline mode funciona

---

## 🔧 PARTE 5: Mantener Backend Despierto (Plan Free)

Si usas el plan Free, el backend se duerme después de 15 min de inactividad.

### Opción A: Cron Job Externo (Recomendado)

1. Ir a https://cron-job.org
2. Crear cuenta gratis
3. Click **"Create cronjob"**
4. Configurar:
   ```
   Title: Keep Horas Backend Alive
   URL: https://horas-amarantus-backend.onrender.com/health
   Schedule: */10 * * * * (cada 10 minutos)
   ```
5. Click **"Create"**

### Opción B: Upgrade a Plan Starter ($7/mes)

1. En Render Dashboard → Backend
2. **"Settings"** → **"Instance Type"**
3. Cambiar a **"Starter"**
4. Confirmar

**Ventajas**:
- Nunca se duerme
- Mejor performance
- Más recursos

---

## 📊 Dashboard de Render

### Ver Logs

**Backend**:
1. Dashboard → `horas-amarantus-backend`
2. Pestaña **"Logs"**
3. Ver en tiempo real

**Frontend**:
1. Dashboard → `horas-amarantus`
2. Pestaña **"Logs"**
3. Ver builds

### Ver Métricas

1. Pestaña **"Metrics"**
2. Ver:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

---

## 🔄 Actualizar la App

### Flujo Automático

```bash
# 1. Hacer cambios en código local
# 2. Commit y push
git add .
git commit -m "Descripción de cambios"
git push origin main

# 3. Render detecta el push y redesplega automáticamente
# Backend: ~5 min
# Frontend: ~3 min
```

### Despliegue Manual

**Si quieres forzar redespliegue**:

1. Dashboard → Servicio
2. Click **"Manual Deploy"**
3. Seleccionar **"Deploy latest commit"**

---

## 🐛 Troubleshooting

### Problema 1: Error 500 en Backend

**Síntoma**: Backend responde con error 500

**Solución**:
1. Dashboard → Backend → **"Logs"**
2. Ver error específico
3. Verificar variables de entorno
4. Verificar que `PORT=10000`

### Problema 2: Error de CORS

**Síntoma**: 
```
Access to fetch at '...' has been blocked by CORS
```

**Solución**:
1. Verificar `FRONTEND_URL` en backend
2. Debe ser exactamente: `https://horas-amarantus.onrender.com`
3. Sin `/` al final
4. Esperar redespliegue (~2 min)

### Problema 3: Build Falla en Frontend

**Síntoma**: Error durante build

**Solución**:
1. Ver logs completos en Render
2. Verificar que todas las variables empiezan con `VITE_`
3. Probar build local:
   ```bash
   cd frontend
   npm run build
   ```

### Problema 4: Backend Tarda en Responder

**Síntoma**: Primera request tarda ~30 segundos

**Causa**: Plan Free se duerme después de 15 min

**Soluciones**:
- Configurar cron-job (ver Parte 5)
- O upgrade a plan Starter ($7/mes)

### Problema 5: Variables de Entorno No Funcionan

**Frontend**:
1. Verificar que empiezan con `VITE_`
2. Redesplegar:
   - **"Manual Deploy"** → **"Clear build cache & deploy"**

**Backend**:
1. Verificar nombres exactos
2. Redesplegar:
   - **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🔐 Seguridad

### Headers de Seguridad

Ya configurados en `vercel.json`:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block

### HTTPS

- ✅ Automático en Render
- ✅ Certificado SSL gratis
- ✅ Renovación automática

### Variables Sensibles

**⚠️ NUNCA** commitear:
- `.env`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

Siempre usar variables de entorno en Render.

---

## 🌐 Dominio Personalizado (Opcional)

### Configurar Dominio

1. Comprar dominio (ej: Namecheap, GoDaddy)

2. **Para Frontend**:
   - Dashboard → `horas-amarantus`
   - **"Settings"** → **"Custom Domain"**
   - Agregar: `horas.tu-dominio.com`
   - Configurar DNS:
     ```
     Type: CNAME
     Name: horas
     Value: horas-amarantus.onrender.com
     ```

3. **Para Backend**:
   - Dashboard → `horas-amarantus-backend`
   - **"Settings"** → **"Custom Domain"**
   - Agregar: `api.tu-dominio.com`
   - Configurar DNS:
     ```
     Type: CNAME
     Name: api
     Value: horas-amarantus-backend.onrender.com
     ```

4. **Actualizar Variables**:
   - Backend → `FRONTEND_URL=https://horas.tu-dominio.com`
   - Frontend → `VITE_API_URL=https://api.tu-dominio.com`

---

## 📊 Monitoreo

### Configurar Alertas

1. Dashboard → Servicio
2. **"Settings"** → **"Notifications"**
3. Agregar email
4. Seleccionar eventos:
   - Deploy failed
   - Service down
   - High memory usage

### Uptime Monitoring

**Usar UptimeRobot** (gratis):

1. Ir a https://uptimerobot.com
2. Crear cuenta
3. **"Add New Monitor"**:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Horas Backend
   URL: https://horas-amarantus-backend.onrender.com/health
   Monitoring Interval: 5 minutes
   ```
4. Agregar email para alertas

---

## 💡 Optimizaciones

### 1. Caché en Frontend

Ya configurado en `vercel.json`:
```json
{
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

### 2. Comprimir Assets

Frontend ya usa Vite que comprime automáticamente.

### 3. Lazy Loading

Ya implementado en el código con React.lazy().

---

## 📝 Checklist Final

### Backend ✅
- [ ] Web Service creado
- [ ] Variables de entorno configuradas
- [ ] `/health` responde OK
- [ ] Logs sin errores
- [ ] CORS configurado

### Frontend ✅
- [ ] Static Site creado
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Login funciona
- [ ] PWA funciona

### Integración ✅
- [ ] Frontend se conecta al backend
- [ ] No hay errores de CORS
- [ ] Todas las funcionalidades probadas
- [ ] Cron-job configurado (si plan Free)

---

## 🎯 URLs Finales

```
Frontend: https://horas-amarantus.onrender.com
Backend: https://horas-amarantus-backend.onrender.com
Health Check: https://horas-amarantus-backend.onrender.com/health
```

---

## 💰 Resumen de Costos

### Plan Actual (Todo Gratis)

```
Backend Free: $0/mes
- 750 horas/mes
- Se duerme después de 15 min
- 512 MB RAM

Frontend Free: $0/mes
- 100 GB bandwidth/mes
- Builds ilimitados

Supabase Free: $0/mes
- 500 MB database
- 1 GB storage

TOTAL: $0/mes
```

### Upgrade Recomendado

```
Backend Starter: $7/mes
- Siempre activo
- 512 MB RAM
- Mejor performance

Frontend Free: $0/mes

Supabase Free: $0/mes

TOTAL: $7/mes
```

---

## 🆘 Soporte

### Documentación Render
- https://render.com/docs
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/static-sites

### Status
- https://status.render.com

### Community
- https://community.render.com

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en producción con:

- ✅ Frontend en Render
- ✅ Backend en Render
- ✅ Base de datos en Supabase
- ✅ HTTPS automático
- ✅ Auto-deploy desde GitHub
- ✅ Costo: $0/mes

**Próximos pasos**:
1. Compartir URL con usuarios
2. Configurar cron-job para mantener backend despierto
3. Monitorear logs
4. Considerar upgrade a Starter si necesitas mejor performance

---

**¿Necesitas ayuda? Consulta los logs en Render Dashboard.** 🚀
