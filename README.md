# Sistema de Horas Hortícola

Sistema de registro de horas de trabajo con soporte offline-first, autenticación JWT y control de permisos por roles.

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Base de Datos

Ejecutar en Supabase SQL Editor:
```bash
supabase/schema-simple.sql
```

### 4. Crear Superadmin

```bash
cd backend
npm run create-superadmin
```

---

## 📚 Documentación

- **[ARQUITECTURA.md](./ARQUITECTURA.md)** - Arquitectura completa del sistema
- **[backend/README.md](./backend/README.md)** - Documentación del API
- **[CREAR_SUPERADMIN.md](./CREAR_SUPERADMIN.md)** - Crear primer usuario
- **[DEPLOY_RENDER_COMPLETO.md](./DEPLOY_RENDER_COMPLETO.md)** - Deploy a producción

---

## ✨ Características

### Funcionalidades
- ✅ Registro de horas por tarea/proceso
- ✅ Jerarquía organizacional (Área → Proceso → Subproceso → Tarea)
- ✅ Reportes con gráficos
- ✅ Dashboard personalizado por rol
- ✅ Modo offline con sincronización automática
- ✅ PWA instalable

### Seguridad
- ✅ Autenticación JWT (128 bits)
- ✅ Login solo por username
- ✅ Passwords hasheados (bcrypt)
- ✅ Helmet + CSP
- ✅ Rate limiting (100 req/15min)
- ✅ CORS dinámico
- ✅ Stack traces ocultos en producción

### Roles
- **Operario**: Ver/crear sus propios registros
- **Admin**: Gestionar todo excepto otros admins
- **Superadmin**: Control total del sistema

---

## 🛠️ Stack

**Backend:** Node.js, Express, Supabase (PostgreSQL), JWT  
**Frontend:** React 18, TailwindCSS, Dexie.js (IndexedDB)  
**Deploy:** Render.com (HTTPS automático)

---

## 📊 Estructura de Datos

### TimeEntry
```javascript
{
  id: "uuid",
  user_id: "uuid",
  organizational_unit_id: "uuid",
  description: "string",
  start_time: "ISO8601",
  end_time: "ISO8601",
  total_hours: number,  // Calculado automáticamente
  status: "completed"
}
```

---

## 🔐 Seguridad

### Protecciones Implementadas
1. **JWT firmado** - Rol no modificable por cliente
2. **Filtrado en BD** - Operarios solo reciben sus datos
3. **Validación de inputs** - Express-validator en todos los endpoints
4. **Helmet + CSP** - Headers de seguridad HTTP
5. **Rate Limiting** - Protección contra abuso
6. **Errores sanitizados** - Sin stack traces en producción

### Configuración de Producción

**Backend (.env):**
```bash
NODE_ENV=production
JWT_SECRET=<generar-con-npm-run-generate-jwt>
ALLOWED_ORIGINS=https://app1.com,https://app2.com,https://app3.com
ENABLE_RATE_LIMIT=true
```

**Frontend (.env):**
```bash
VITE_API_URL=https://api.tudominio.com
```

---

## 🔄 Modo Offline

El sistema funciona completamente offline:

1. **Offline**: Datos se guardan en IndexedDB
2. **Reconexión**: Sincronización automática
3. **Conflictos**: Last-write-wins (servidor gana)

Ver [ARQUITECTURA.md](./ARQUITECTURA.md) para detalles completos.

---

## 📝 Scripts Útiles

### Backend
```bash
npm run dev              # Desarrollo con auto-reload
npm start                # Producción
npm run create-superadmin # Crear primer usuario
npm run generate-jwt     # Generar JWT secret
```

### Frontend
```bash
npm run dev              # Desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build
```

---

## 🚀 Deploy a Producción

Ver [DEPLOY_RENDER_COMPLETO.md](./DEPLOY_RENDER_COMPLETO.md) para instrucciones paso a paso.

**Resumen:**
1. Push a GitHub
2. Conectar repo en Render.com
3. Configurar variables de entorno
4. Deploy automático

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar [ARQUITECTURA.md](./ARQUITECTURA.md)
2. Revisar logs del servidor
3. Verificar variables de entorno

---

## 📄 Licencia

Propietario - Todos los derechos reservados

---

**Última actualización:** 2026-03-10
