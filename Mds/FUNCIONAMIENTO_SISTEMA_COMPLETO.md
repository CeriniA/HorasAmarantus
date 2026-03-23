# 🏗️ Funcionamiento Completo del Sistema

## 📚 Índice
1. [Database.js - Conexión a Supabase](#database-js)
2. [Flujo Completo del Sistema](#flujo-completo)
3. [Arquitectura General](#arquitectura)
4. [Configuración y Variables de Entorno](#configuración)
5. [Seguridad](#seguridad)

---

## 🗄️ Database.js - Conexión a Supabase

### Archivo: `backend/src/config/database.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Crear cliente de Supabase con service_role key
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### ¿Qué Hace?

#### 1. **Crea el Cliente de Supabase**
```javascript
createClient(url, key, options)
```

**Parámetros:**
- `url`: URL de tu proyecto Supabase (ej: `https://xxx.supabase.co`)
- `key`: **Service Role Key** (clave con permisos completos)
- `options`: Configuración adicional

#### 2. **Service Role Key vs Anon Key**

```
┌─────────────────────────────────────────────────────────┐
│                  TIPOS DE KEYS                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔓 ANON KEY (Pública)                                 │
│     ├── Para uso en frontend                           │
│     ├── Permisos limitados                             │
│     ├── Respeta RLS (Row Level Security)               │
│     └── Puede exponerse públicamente                   │
│                                                         │
│  🔐 SERVICE ROLE KEY (Privada)                         │
│     ├── Para uso SOLO en backend                       │
│     ├── Permisos COMPLETOS (bypass RLS)                │
│     ├── Acceso total a la base de datos                │
│     └── ⚠️ NUNCA exponerla en frontend                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tu sistema usa SERVICE ROLE KEY porque:**
- ✅ Todo pasa por el backend
- ✅ El backend valida permisos con JWT y middleware
- ✅ No usas RLS (Row Level Security)
- ✅ Necesitas acceso completo para todas las operaciones

#### 3. **Opciones de Configuración**

```javascript
{
  auth: {
    autoRefreshToken: false,  // ← No refrescar tokens automáticamente
    persistSession: false     // ← No guardar sesión (backend stateless)
  }
}
```

**¿Por qué estas opciones?**

- `autoRefreshToken: false`
  - No usas Supabase Auth (tienes JWT custom)
  - No necesitas refrescar tokens de Supabase
  
- `persistSession: false`
  - El backend es stateless (sin estado)
  - Cada request es independiente
  - La sesión se maneja con JWT en el frontend

---

## 🔄 Flujo Completo del Sistema

### Diagrama General:

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                 │
│                    (Navegador Web)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Request
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Páginas:                                                 │  │
│  │  - Login.jsx                                              │  │
│  │  - Dashboard.jsx                                          │  │
│  │  - TimeEntries.jsx                                        │  │
│  │  - Reports.jsx                                            │  │
│  │  - UserManagement.jsx                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Hooks:                                                   │  │
│  │  - useAuth.js (maneja autenticación)                     │  │
│  │  - useTimeEntries.js                                      │  │
│  │  - useUsers.js                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services:                                                │  │
│  │  - api.js (cliente HTTP con JWT)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Offline:                                                 │  │
│  │  - IndexedDB (almacenamiento local)                      │  │
│  │  - SyncManager (sincronización)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Request + JWT Token
                         │ (Authorization: Bearer xxx)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  app.js (Servidor principal)                             │  │
│  │  ├── Helmet (seguridad)                                  │  │
│  │  ├── CORS (orígenes permitidos)                          │  │
│  │  ├── Rate Limiting (límite de requests)                  │  │
│  │  └── Body Parser (JSON)                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware:                                              │  │
│  │  - authenticate (verifica JWT)                           │  │
│  │  - requireRole (verifica permisos)                       │  │
│  │  - validators (valida datos)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes:                                                  │  │
│  │  - /api/auth (login, signup)                             │  │
│  │  - /api/time-entries (CRUD registros)                    │  │
│  │  - /api/users (CRUD usuarios)                            │  │
│  │  - /api/organizational-units (CRUD unidades)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Config:                                                  │  │
│  │  - database.js (cliente Supabase)                        │  │
│  │  - env.js (variables de entorno)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │ (con service_role key)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Schema: public                                           │  │
│  │  ├── users (usuarios del sistema)                        │  │
│  │  ├── organizational_units (estructura jerárquica)        │  │
│  │  └── time_entries (registros de horas)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Enums:                                                   │  │
│  │  - user_role (superadmin, admin, operario)               │  │
│  │  - org_unit_type (area, proceso, subproceso, tarea)      │  │
│  │  - time_entry_status (completed)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Autenticación (Login)

### Paso a Paso:

```
1. Usuario ingresa credenciales
   ↓
2. Frontend envía POST /api/auth/login
   {
     "username": "admin",
     "password": "123456"
   }
   ↓
3. Backend (routes/auth.js):
   - Busca usuario en Supabase
   - Verifica password con bcrypt
   - Genera JWT token
   ↓
4. Backend responde:
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "uuid",
       "username": "admin",
       "role": "superadmin",
       ...
     }
   }
   ↓
5. Frontend guarda:
   - Token en localStorage
   - Usuario en contexto (AuthContext)
   ↓
6. Requests subsiguientes incluyen:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Flujo de Crear Registro de Tiempo

### Paso a Paso:

```
1. Usuario llena formulario en TimeEntries.jsx
   ↓
2. Frontend llama: api.post('/time-entries', data)
   Headers: { Authorization: Bearer <token> }
   Body: {
     "organizational_unit_id": "uuid",
     "description": "Trabajo realizado",
     "start_time": "2026-03-18T08:00:00",
     "end_time": "2026-03-18T12:00:00"
   }
   ↓
3. Backend recibe request en app.js
   ↓
4. Middleware authenticate (middleware/auth.js):
   - Extrae token del header
   - Verifica JWT
   - Decodifica payload
   - Agrega req.user = { id, username, role, ... }
   ↓
5. Middleware validateCreateTimeEntry:
   - Valida que organizational_unit_id exista
   - Valida que start_time < end_time
   - Valida formato de datos
   ↓
6. Route handler (routes/timeEntries.js):
   - Verifica permisos (admin puede crear para otros)
   - Calcula total_hours (trigger en DB)
   - Inserta en Supabase:
     
     const { data, error } = await supabase
       .from('time_entries')
       .insert({
         user_id: req.user.id,
         organizational_unit_id,
         description,
         start_time,
         end_time,
         status: TIME_ENTRY_STATUS.COMPLETED
       })
       .select('*')
       .single();
   ↓
7. Supabase:
   - Ejecuta trigger para calcular total_hours
   - Inserta registro
   - Retorna datos completos
   ↓
8. Backend responde:
   {
     "timeEntry": {
       "id": "uuid",
       "user_id": "uuid",
       "organizational_unit_id": "uuid",
       "description": "Trabajo realizado",
       "start_time": "2026-03-18T08:00:00",
       "end_time": "2026-03-18T12:00:00",
       "total_hours": 4.0,
       "status": "completed",
       "created_at": "2026-03-18T12:00:00",
       "updated_at": "2026-03-18T12:00:00"
     }
   }
   ↓
9. Frontend:
   - Actualiza lista de registros
   - Muestra notificación de éxito
   - Cierra modal
```

---

## ⚙️ Configuración y Variables de Entorno

### Archivo: `backend/src/config/env.js`

#### 1. **Carga de Variables**

```javascript
import dotenv from 'dotenv';
dotenv.config(); // ← Lee archivo .env
```

**Archivo `.env`:**
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=mi-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# Servidor
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Rate Limiting (opcional)
ENABLE_RATE_LIMIT=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 2. **Objeto de Configuración**

```javascript
export const config = {
  // Ambiente
  env: 'development' | 'production',
  isDevelopment: boolean,
  isProduction: boolean,
  
  // Servidor
  port: 3001,
  
  // Supabase
  supabase: {
    url: 'https://xxx.supabase.co',
    serviceRoleKey: 'eyJ...'
  },
  
  // JWT
  jwt: {
    secret: 'mi-secreto',
    expiresIn: '7d'
  },
  
  // CORS
  cors: {
    frontendUrl: 'http://localhost:5173',
    allowedOrigins: ['http://localhost:5173', ...]
  },
  
  // Rate Limiting
  rateLimit: {
    enabled: false,
    windowMs: 900000,  // 15 minutos
    maxRequests: 100
  }
};
```

#### 3. **Validación Automática**

```javascript
export const validateConfig = () => {
  const errors = [];
  
  // Validar Supabase URL
  if (!config.supabase.url.startsWith('http')) {
    errors.push('SUPABASE_URL debe ser una URL válida');
  }
  
  // Validar Service Role Key
  if (config.supabase.serviceRoleKey.length < 20) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY parece inválida');
  }
  
  // Validar JWT Secret en producción
  if (config.isProduction && config.jwt.secret === 'default-secret') {
    errors.push('JWT_SECRET debe cambiarse en producción');
  }
  
  if (errors.length > 0) {
    throw new Error('Configuración inválida');
  }
};
```

**Se ejecuta al iniciar el servidor:**
```javascript
// app.js
validateConfig(); // ← Valida antes de iniciar
```

---

## 🔒 Seguridad del Sistema

### 1. **Helmet - Seguridad HTTP**

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.cors.frontendUrl],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
```

**Protege contra:**
- ✅ XSS (Cross-Site Scripting)
- ✅ Clickjacking
- ✅ MIME type sniffing
- ✅ Inyección de código

### 2. **CORS - Control de Orígenes**

```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman, curl
    
    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true); // ✅ Permitido
    } else {
      callback(new Error('No permitido por CORS')); // ❌ Bloqueado
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Permite solo:**
- ✅ Frontend en localhost:5173 (desarrollo)
- ✅ Frontend en producción (configurado en .env)
- ❌ Bloquea otros orígenes

### 3. **Rate Limiting - Límite de Requests**

```javascript
if (config.rateLimit.enabled) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 100,                   // 100 requests
    message: { error: 'Demasiadas peticiones' }
  });
  app.use('/api/', limiter);
}
```

**Protege contra:**
- ✅ Ataques de fuerza bruta
- ✅ DDoS (Distributed Denial of Service)
- ✅ Abuso de API

### 4. **JWT - Autenticación Segura**

```javascript
// Generar token (routes/auth.js)
const token = jwt.sign(
  {
    id: user.id,
    username: user.username,
    role: user.role
  },
  config.jwt.secret,
  { expiresIn: config.jwt.expiresIn }
);

// Verificar token (middleware/auth.js)
const decoded = jwt.verify(token, config.jwt.secret);
```

**Características:**
- ✅ Stateless (sin sesiones en servidor)
- ✅ Expira automáticamente (7 días)
- ✅ Firmado con secreto (no modificable)
- ✅ Incluye datos del usuario

### 5. **Bcrypt - Passwords Hasheados**

```javascript
// Al crear usuario
const password_hash = await bcrypt.hash(password, 10);

// Al verificar login
const isValid = await bcrypt.compare(password, user.password_hash);
```

**Protege:**
- ✅ Passwords nunca se guardan en texto plano
- ✅ Imposible revertir el hash
- ✅ Salt automático (10 rondas)

### 6. **Validaciones - Datos Seguros**

```javascript
// middleware/validators.js
export const validateCreateTimeEntry = [
  body('organizational_unit_id')
    .isUUID()
    .withMessage('ID de unidad inválido'),
  
  body('start_time')
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  
  body('end_time')
    .isISO8601()
    .custom((value, { req }) => {
      return new Date(value) > new Date(req.body.start_time);
    })
    .withMessage('Fecha de fin debe ser mayor a inicio'),
  
  handleValidationErrors
];
```

**Valida:**
- ✅ Tipos de datos correctos
- ✅ Formatos válidos
- ✅ Lógica de negocio
- ✅ Previene inyección SQL

---

## 📊 Resumen del Flujo

### Request Típico:

```
1. Usuario hace acción en Frontend
   ↓
2. Frontend envía HTTP Request + JWT
   ↓
3. Backend recibe en app.js
   ↓
4. Pasa por middleware:
   - Helmet (seguridad)
   - CORS (origen permitido?)
   - Rate Limit (demasiados requests?)
   - Body Parser (parsear JSON)
   ↓
5. Llega a ruta específica:
   - authenticate (JWT válido?)
   - requireRole (permisos suficientes?)
   - validators (datos válidos?)
   ↓
6. Route handler ejecuta lógica:
   - Consulta Supabase con database.js
   - Procesa datos
   - Retorna respuesta
   ↓
7. Middleware de errores (si hay error)
   ↓
8. Respuesta al Frontend
   ↓
9. Frontend actualiza UI
```

---

## 🎯 Puntos Clave

### Database.js:
- ✅ Crea cliente de Supabase con service_role key
- ✅ Acceso completo a la base de datos
- ✅ Usado en todas las rutas del backend
- ⚠️ NUNCA exponer en frontend

### Configuración (env.js):
- ✅ Centraliza todas las variables de entorno
- ✅ Valida configuración al inicio
- ✅ Provee defaults para desarrollo
- ✅ Requiere valores en producción

### Seguridad:
- ✅ Helmet (headers seguros)
- ✅ CORS (orígenes permitidos)
- ✅ Rate Limiting (límite de requests)
- ✅ JWT (autenticación stateless)
- ✅ Bcrypt (passwords hasheados)
- ✅ Validaciones (datos seguros)

### Arquitectura:
- ✅ Frontend → Backend → Supabase
- ✅ JWT para autenticación
- ✅ Middleware para permisos
- ✅ Offline con IndexedDB
- ✅ Sincronización automática

---

**Tu sistema tiene una arquitectura sólida, segura y bien organizada.** 🎉
