# Backend API - Sistema de Horas Hortícola

Backend Node.js/Express con autenticación JWT y control de permisos por roles.

## 🚀 Setup

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` y configurar:

- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: **Service Role Key** (NO la anon key)
  - Obtener desde: Supabase Dashboard > Settings > API > service_role key
- `JWT_SECRET`: Un string aleatorio seguro
- `PORT`: Puerto del servidor (default: 3001)
- `FRONTEND_URL`: URL del frontend (default: http://localhost:5173)

### 3. Ejecutar schema simplificado en Supabase

```bash
# En Supabase SQL Editor, ejecutar:
supabase/schema-simple.sql
```

### 4. Iniciar servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

## 📡 API Endpoints

### Autenticación

#### POST /api/auth/login
Login de usuario (solo por username)

**Request:**
```json
{
  "username": "admin",
  "password": "ContraseñaSegura123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@horticola.com",
    "name": "Juan Pérez",
    "role": "admin"
  }
}
```

#### POST /api/auth/register
Crear nuevo usuario (requiere ser admin)

#### GET /api/auth/me
Obtener usuario actual (requiere token)

### Registros de Horas

#### GET /api/time-entries
Obtener registros según rol:
- **Operario**: Solo sus registros
- **Supervisor**: Registros de su área
- **Admin**: Todos los registros

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /api/time-entries
Crear nuevo registro

**Request:**
```json
{
  "organizational_unit_id": "uuid",
  "description": "Arado del sector norte",
  "start_time": "2026-03-03T08:00:00Z",
  "end_time": "2026-03-03T12:00:00Z"
}
```

#### PUT /api/time-entries/:id
Actualizar registro (solo propios o admin)

#### DELETE /api/time-entries/:id
Eliminar registro (solo propios o admin)

## 🔒 Roles y Permisos

### Operario
- ✅ Ver sus propios registros
- ✅ Crear registros para sí mismo
- ✅ Editar sus propios registros
- ✅ Eliminar sus propios registros
- ❌ Ver registros de otros

### Supervisor
- ✅ Ver registros de su área
- ✅ Crear/editar unidades organizacionales
- ❌ Ver registros de otras áreas
- ❌ Crear usuarios

### Admin
- ✅ Ver todos los registros
- ✅ Crear/editar/eliminar cualquier registro
- ✅ Crear/editar/eliminar usuarios
- ✅ Gestionar unidades organizacionales

## 🛠️ Estructura

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Conexión Supabase (service_role)
│   │   └── auth.js          # JWT config
│   ├── middleware/
│   │   ├── auth.js          # Verificar JWT
│   │   └── roles.js         # Verificar roles
│   ├── routes/
│   │   ├── auth.js          # Login, register
│   │   └── timeEntries.js   # CRUD registros
│   └── app.js               # Express app
├── package.json
└── .env
```

## 🔐 Seguridad

### Implementado
- ✅ **JWT** para autenticación (128 bits mínimo)
- ✅ **Bcrypt** para passwords (10 rounds)
- ✅ **Helmet** con CSP (Content Security Policy)
- ✅ **CORS** dinámico (múltiples orígenes en producción)
- ✅ **Rate limiting** global (100 req/15min en producción)
- ✅ **Validación de inputs** (express-validator)
- ✅ **Stack traces ocultos** en producción
- ✅ **Service role key** (NO expuesta al frontend)
- ✅ **Login solo por username** (email es informativo)

### Configuración de Producción

**CORS múltiples orígenes:**
```bash
# En .env de producción
ALLOWED_ORIGINS=https://app1.com,https://app2.com,https://app3.com
```

**Rate Limiting:**
```bash
ENABLE_RATE_LIMIT=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

**JWT Secret:**
```bash
# Generar con:
npm run generate-jwt
# Copiar el resultado a JWT_SECRET
```

### Protecciones Activas

1. **Filtrado en BD**: Operarios solo reciben sus datos
2. **Validación de permisos**: En cada endpoint
3. **Errores sanitizados**: Sin stack traces en producción
4. **Headers de seguridad**: X-Frame-Options, X-Content-Type-Options, etc.

## 📝 Notas

- El backend usa la **service_role key** que bypasea RLS
- Todos los permisos se manejan en el código del backend
- El frontend debe enviar el JWT en cada request
- HTTPS es provisto por Render.com en producción
