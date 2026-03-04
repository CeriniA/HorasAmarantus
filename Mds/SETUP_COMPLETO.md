# 🚀 Setup Completo - Sistema de Horas con Backend

## 📋 Arquitectura

```
Frontend (React) → Backend (Node.js/Express) → Supabase (PostgreSQL)
     ↓                      ↓                        ↓
  JWT Token          Validaciones              Sin RLS
  IndexedDB          Permisos por rol          service_role key
```

---

## 🔧 PASO 1: Configurar Supabase

### 1.1 Ejecutar Schema Simplificado

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y ejecuta todo el contenido de `supabase/schema-simple.sql`

### 1.2 Obtener Service Role Key

1. Ve a **Settings** → **API**
2. Copia la **`service_role`** key (⚠️ NO la anon key)
3. Guárdala para el siguiente paso

---

## 🔧 PASO 2: Configurar Backend

### 2.1 Instalar Dependencias

```bash
cd backend
npm install
```

### 2.2 Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env`:

```env
SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui  # ⚠️ La que copiaste en 1.2

JWT_SECRET=mi-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2.3 Crear Primer Usuario Admin

Ejecuta en Supabase SQL Editor:

```sql
-- Generar hash de password (usa bcrypt online o Node.js)
-- Password: ContraseñaSegura123!
-- Hash: $2a$10$ejemplo... (genera uno real)

INSERT INTO users (id, email, password_hash, name, role)
VALUES (
  '1fa2dea5-5852-4eed-94f8-757aef724d9f',
  'admin@horticola.com',
  '$2a$10$TU_HASH_REAL_AQUI',  -- ⚠️ Genera un hash real
  'Juan Pérez',
  'admin'
);
```

**Para generar el hash:**

```javascript
// En Node.js
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('ContraseñaSegura123!', 10);
console.log(hash);
```

O usa: https://bcrypt-generator.com/

### 2.4 Iniciar Backend

```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor backend corriendo en http://localhost:3001
📝 Ambiente: development
```

---

## 🔧 PASO 3: Configurar Frontend

### 3.1 Verificar .env

El archivo `frontend/.env` ya debería estar configurado:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Sistema Horas Hortícola
VITE_APP_VERSION=1.0.0
```

### 3.2 Instalar Dependencias (si no lo hiciste)

```bash
cd frontend
npm install
```

### 3.3 Iniciar Frontend

```bash
npm run dev
```

---

## ✅ PASO 4: Probar el Sistema

### 4.1 Login

1. Abre http://localhost:5173
2. Login con:
   - Email: `admin@horticola.com`
   - Password: `ContraseñaSegura123!`

### 4.2 Verificar Funcionalidades

- ✅ Dashboard carga correctamente
- ✅ Puedes ver unidades organizacionales
- ✅ Puedes crear registros de horas
- ✅ Puedes ver tus registros
- ✅ (Admin) Puedes ver todos los registros

---

## 🔒 Permisos por Rol

### Operario
- ✅ Ver sus propios registros
- ✅ Crear registros para sí mismo
- ✅ Editar sus propios registros
- ✅ Eliminar sus propios registros
- ❌ Ver registros de otros

### Supervisor
- ✅ Ver registros de su área
- ✅ Crear/editar unidades organizacionales
- ✅ Ver usuarios de su área
- ❌ Ver registros de otras áreas

### Admin
- ✅ Ver todos los registros
- ✅ Crear/editar/eliminar cualquier registro
- ✅ Crear/editar/eliminar usuarios
- ✅ Gestionar unidades organizacionales

---

## 🐛 Troubleshooting

### Error: "Token no proporcionado"
- El frontend no está enviando el token
- Verifica que el login funcione correctamente
- Revisa la consola del navegador

### Error: "Credenciales inválidas"
- El password hash no coincide
- Genera un nuevo hash con bcrypt
- Actualiza el usuario en la DB

### Error: "Cannot connect to backend"
- Verifica que el backend esté corriendo en puerto 3001
- Verifica CORS en `backend/src/app.js`
- Revisa `VITE_API_URL` en `frontend/.env`

### Error: "Permission denied for schema auth"
- Estás usando la anon key en lugar de service_role key
- Verifica `SUPABASE_SERVICE_ROLE_KEY` en `backend/.env`

---

## 📁 Estructura de Archivos

```
app-web/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Supabase con service_role
│   │   │   └── auth.js          # JWT config
│   │   ├── middleware/
│   │   │   ├── auth.js          # Verificar JWT
│   │   │   └── roles.js         # Verificar roles
│   │   ├── routes/
│   │   │   ├── auth.js          # Login, register
│   │   │   ├── timeEntries.js   # CRUD registros
│   │   │   ├── users.js         # CRUD usuarios
│   │   │   └── organizationalUnits.js
│   │   └── app.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js           # Cliente API
│   │   ├── hooks/
│   │   │   ├── useAuth.js       # Hook de autenticación
│   │   │   ├── useTimeEntriesNew.js
│   │   │   └── useOrganizationalUnits.js
│   │   └── ...
│   └── .env
└── supabase/
    └── schema-simple.sql         # Schema SIN RLS
```

---

## 🎯 Próximos Pasos

1. ✅ Crear más usuarios de prueba (supervisores, operarios)
2. ✅ Crear unidades organizacionales
3. ✅ Probar permisos por rol
4. ✅ Implementar seed.sql con datos de prueba
5. ✅ Configurar para producción

---

## 🚀 Deploy a Producción

### Backend
- Usar Render, Railway, o Heroku
- Configurar variables de entorno
- Cambiar `JWT_SECRET` a uno seguro

### Frontend
- Usar Vercel o Netlify
- Configurar `VITE_API_URL` con la URL del backend en producción

### Supabase
- Ya está en la nube
- Solo asegúrate de usar HTTPS en producción
