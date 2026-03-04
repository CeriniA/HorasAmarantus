# 🚀 Guía de Deployment a Producción

## 📋 Checklist Pre-Deployment

### Backend

- [ ] Cambiar `NODE_ENV=production` en `.env`
- [ ] Generar nuevo `JWT_SECRET` para producción
- [ ] Actualizar `FRONTEND_URL` con dominio real
- [ ] Verificar `SUPABASE_SERVICE_ROLE_KEY` de producción
- [ ] Configurar HTTPS (obligatorio)
- [ ] Configurar rate limiting según tráfico esperado
- [ ] Revisar logs y eliminar console.log sensibles

### Frontend

- [ ] Actualizar `VITE_API_URL` con URL del backend en producción
- [ ] Build de producción: `npm run build`
- [ ] Verificar que no haya API keys expuestas
- [ ] Configurar HTTPS
- [ ] Configurar Service Worker para PWA

### Base de Datos

- [ ] Ejecutar `schema-simple.sql` en Supabase de producción
- [ ] Crear usuario admin con password seguro
- [ ] Backup de base de datos
- [ ] Configurar políticas de backup automático

---

## 🔒 Seguridad CORS en Producción

### Configuración Actual

**Desarrollo** (NODE_ENV=development):
```javascript
// Permite múltiples orígenes localhost
allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
]
```

**Producción** (NODE_ENV=production):
```javascript
// Solo permite el dominio configurado en .env
allowedOrigins = [process.env.FRONTEND_URL]
// Ejemplo: ['https://sistema-horas.tuempresa.com']
```

### ¿Por qué es seguro?

1. **En desarrollo**: Flexibilidad para probar en diferentes puertos
2. **En producción**: Solo tu dominio puede hacer requests al backend
3. **Bloquea ataques**: Otros sitios no pueden robar datos de tu API

---

## 🌐 Opciones de Deployment

### Opción 1: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend en Vercel
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Configurar variables de entorno en Vercel Dashboard
VITE_API_URL=https://tu-backend.railway.app/api
```

#### Backend en Railway
```bash
# 1. Crear cuenta en railway.app
# 2. Conectar repositorio GitHub
# 3. Configurar variables de entorno:
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
```

---

### Opción 2: Todo en un VPS (DigitalOcean, AWS, etc.)

#### Nginx como Reverse Proxy
```nginx
# /etc/nginx/sites-available/sistema-horas

# Backend
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name app.tudominio.com;

    root /var/www/sistema-horas/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### PM2 para mantener backend corriendo
```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd backend
pm2 start src/app.js --name sistema-horas-api

# Auto-start en reboot
pm2 startup
pm2 save
```

---

### Opción 3: Docker + Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - FRONTEND_URL=https://tudominio.com
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## 🔐 Generar JWT Secret para Producción

```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opción 3: Online (solo si confías en el sitio)
# https://generate-secret.vercel.app/32
```

---

## 📊 Monitoreo en Producción

### Logs
```bash
# Ver logs del backend
pm2 logs sistema-horas-api

# O si usas Railway/Render
# Ver logs en el dashboard
```

### Health Check
```bash
# Verificar que el backend responde
curl https://api.tudominio.com/health

# Debería retornar:
# {"status":"ok","timestamp":"2024-..."}
```

---

## 🚨 Troubleshooting CORS en Producción

### Error: "CORS bloqueado"

1. **Verificar NODE_ENV**
   ```bash
   echo $NODE_ENV
   # Debe ser: production
   ```

2. **Verificar FRONTEND_URL**
   ```bash
   echo $FRONTEND_URL
   # Debe coincidir EXACTAMENTE con el dominio del frontend
   # Incluir https:// y sin / al final
   ```

3. **Verificar en logs del backend**
   ```
   ⚠️  CORS bloqueado para origin: https://otro-dominio.com
   ```

4. **Solución**: Actualizar `FRONTEND_URL` en `.env` y reiniciar backend

---

## ✅ Checklist Final

Antes de lanzar a producción:

- [ ] HTTPS configurado (obligatorio)
- [ ] Variables de entorno correctas
- [ ] JWT_SECRET único y seguro
- [ ] CORS configurado para dominio de producción
- [ ] Rate limiting ajustado
- [ ] Logs de errores configurados
- [ ] Backup de base de datos
- [ ] Health checks funcionando
- [ ] Pruebas de login/logout
- [ ] Pruebas de CRUD de todas las entidades
- [ ] Verificar que offline mode funciona (PWA)

---

## 📞 Soporte

Si tienes problemas en producción:

1. Revisar logs del backend
2. Verificar variables de entorno
3. Probar health check: `/health`
4. Verificar CORS en Network tab del navegador
5. Revisar que Supabase esté accesible

---

**¡Listo para producción!** 🎉
