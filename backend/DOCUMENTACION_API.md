# 📚 DOCUMENTACIÓN COMPLETA DEL BACKEND - API REST

**Sistema de Gestión de Horas Amarantus**  
**Versión:** 1.0  
**Última actualización:** Abril 2026

---

## 📋 ÍNDICE

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
4. [Configuración](#configuración)
5. [Middleware](#middleware)
6. [Endpoints por Módulo](#endpoints-por-módulo)
7. [Sistema RBAC](#sistema-rbac)
8. [Base de Datos](#base-de-datos)
9. [Seguridad](#seguridad)
10. [Logging y Monitoreo](#logging-y-monitoreo)

---

## 🏗️ ARQUITECTURA GENERAL

### **Patrón de 3 Capas**

```
┌─────────────────────────────────────────────────┐
│              CAPA DE RUTAS (Routes)             │
│  - Define endpoints HTTP                        │
│  - Aplica middleware (auth, validación, RBAC)  │
│  - Delega a Controllers                         │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          CAPA DE CONTROLADORES (Controllers)    │
│  - Maneja request/response HTTP                 │
│  - Validación de entrada                        │
│  - Delega lógica de negocio a Services         │
│  - Manejo de errores HTTP                       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│            CAPA DE SERVICIOS (Services)         │
│  - Lógica de negocio                            │
│  - Acceso a base de datos (Supabase)           │
│  - Cálculos y transformaciones                  │
│  - Validaciones de negocio                      │
└─────────────────────────────────────────────────┘
```

### **Principios de Diseño**

✅ **Separación de Responsabilidades**: Cada capa tiene una función específica  
✅ **DRY (Don't Repeat Yourself)**: Lógica reutilizable en utils y services  
✅ **RBAC (Role-Based Access Control)**: Control de acceso granular  
✅ **Single Source of Truth**: Configuración centralizada  
✅ **Error Handling**: Manejo centralizado de errores  
✅ **Logging**: Sistema de logs estructurado  

---

## 📁 ESTRUCTURA DE CARPETAS

```
backend/
├── src/
│   ├── app.js                      # Punto de entrada de la aplicación
│   │
│   ├── config/                     # Configuración centralizada
│   │   ├── auth.js                 # Configuración de JWT
│   │   ├── database.js             # Cliente de Supabase
│   │   └── env.js                  # Variables de entorno
│   │
│   ├── routes/                     # Definición de endpoints HTTP
│   │   ├── auth.js                 # Rutas de autenticación
│   │   ├── timeEntries.js          # Rutas de registros de tiempo
│   │   ├── users.js                # Rutas de usuarios
│   │   ├── organizationalUnits.js  # Rutas de unidades organizacionales
│   │   ├── objectives.routes.js    # Rutas de objetivos
│   │   ├── roles.js                # Rutas de roles
│   │   ├── permissions.js          # Rutas de permisos
│   │   └── reports.js              # Rutas de reportes optimizados
│   │
│   ├── controllers/                # Controladores HTTP
│   │   ├── auth.controller.js
│   │   ├── timeEntries.controller.js
│   │   ├── users.controller.js
│   │   ├── organizationalUnits.controller.js
│   │   ├── objectives.controller.js
│   │   ├── roles.controller.js
│   │   └── permissions.controller.js
│   │
│   ├── services/                   # Lógica de negocio
│   │   ├── auth.service.js
│   │   ├── timeEntries.service.js
│   │   ├── users.service.js
│   │   ├── organizationalUnits.service.js
│   │   ├── objectives.service.js
│   │   ├── roles.service.js
│   │   └── permissions.service.js
│   │
│   ├── middleware/                 # Middleware de Express
│   │   ├── auth.js                 # Autenticación JWT
│   │   ├── permissions.js          # Verificación RBAC
│   │   ├── roles.js                # Helpers de roles
│   │   ├── validators.js           # Validación de datos
│   │   └── errorHandler.js         # Manejo de errores
│   │
│   ├── utils/                      # Utilidades
│   │   ├── logger.js               # Sistema de logging
│   │   ├── objectiveCalculations.js # Cálculos de objetivos
│   │   └── objectiveStatus.js      # Estado de objetivos
│   │
│   └── models/                     # (Opcional) Definiciones de tipos
│
├── migrations/                     # Migraciones SQL
│   ├── 20240101_initial_schema.sql
│   ├── 20240115_add_objectives.sql
│   └── ...
│
├── scripts/                        # Scripts de utilidad
│   ├── seed.js                     # Datos de prueba
│   └── migrate.js                  # Ejecutar migraciones
│
├── .env                            # Variables de entorno (local)
├── .env.example                    # Ejemplo de variables
├── .env.production.example         # Ejemplo para producción
├── package.json                    # Dependencias
└── README.md                       # Documentación básica
```

---

## 🛠️ TECNOLOGÍAS Y DEPENDENCIAS

### **Runtime y Framework**

- **Node.js**: v18+ (ES Modules)
- **Express.js**: Framework web minimalista

### **Base de Datos**

- **Supabase**: PostgreSQL en la nube
- **@supabase/supabase-js**: Cliente oficial

### **Autenticación y Seguridad**

- **jsonwebtoken**: Generación y verificación de JWT
- **bcryptjs**: Hash de contraseñas
- **helmet**: Headers de seguridad HTTP
- **cors**: Control de CORS
- **express-rate-limit**: Limitación de peticiones

### **Utilidades**

- **dotenv**: Variables de entorno
- **winston**: Sistema de logging estructurado
- **date-fns**: Manipulación de fechas

### **Desarrollo**

- **nodemon**: Auto-reload en desarrollo

---

## ⚙️ CONFIGURACIÓN

### **Variables de Entorno (.env)**

```bash
# Servidor
PORT=3001
NODE_ENV=development

# Base de Datos (Supabase)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# JWT
JWT_SECRET=tu-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### **Configuración Centralizada (config/env.js)**

Todas las variables de entorno se validan y centralizan en `config/env.js`:

```javascript
export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  cors: {
    frontendUrl: process.env.FRONTEND_URL,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || []
  },
  
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};
```

---

## 🔒 MIDDLEWARE

### **1. Autenticación (middleware/auth.js)**

**Función:** `authenticate`

Verifica que el usuario esté autenticado mediante JWT.

```javascript
// Uso en rutas
router.use(authenticate);
```

**Proceso:**
1. Extrae token del header `Authorization: Bearer <token>`
2. Verifica y decodifica el JWT
3. Carga datos del usuario desde DB
4. Adjunta `req.user` con los datos del usuario
5. Si falla, retorna 401 Unauthorized

### **2. Permisos RBAC (middleware/permissions.js)**

**Funciones principales:**

#### `checkPermission(resource, action, scope)`
Verifica un permiso específico.

```javascript
// Solo superadmin puede crear roles
router.post('/roles', 
  checkPermission('roles', 'manage', 'all'),
  rolesController.create
);
```

#### `checkAnyPermission(permissions[])`
Verifica si el usuario tiene AL MENOS UNO de los permisos.

```javascript
// Puede crear si tiene create.all o create.own
router.post('/time-entries', 
  checkAnyPermission([
    { resource: 'time_entries', action: 'create', scope: 'all' },
    { resource: 'time_entries', action: 'create', scope: 'own' }
  ]),
  timeEntriesController.create
);
```

#### `checkResourceAccess(resource, action, getResourceFn)`
Verifica acceso a un recurso específico (ej: editar solo tus propios registros).

```javascript
// Solo puede editar si es suyo o tiene permiso 'all'
router.put('/time-entries/:id', 
  checkResourceAccess('time_entries', 'update', async (req) => {
    return await timeEntriesService.getById(req.params.id);
  }),
  timeEntriesController.update
);
```

### **3. Validación (middleware/validators.js)**

Valida datos de entrada antes de procesarlos.

**Validadores disponibles:**
- `validateLogin`: Email y contraseña
- `validateRegister`: Datos de nuevo usuario
- `validateCreateTimeEntry`: Datos de registro de tiempo
- `validateUpdateTimeEntry`: Actualización de registro
- `validateCreateUser`: Creación de usuario
- `validateUpdateUser`: Actualización de usuario
- `validateCreateOrgUnit`: Creación de unidad organizacional
- `validateUpdateOrgUnit`: Actualización de unidad

### **4. Manejo de Errores (middleware/errorHandler.js)**

**Funciones:**

#### `notFoundHandler`
Maneja rutas no encontradas (404).

#### `errorHandler`
Maneja todos los errores de la aplicación de forma centralizada.

**Tipos de errores manejados:**
- Errores de validación (400)
- No autenticado (401)
- Sin permisos (403)
- No encontrado (404)
- Errores de base de datos (500)
- Errores genéricos (500)

---

## 🌐 ENDPOINTS POR MÓDULO

### **🔐 AUTENTICACIÓN (/api/auth)**

| Método | Endpoint | Descripción | Auth | Permisos |
|--------|----------|-------------|------|----------|
| POST | `/login` | Iniciar sesión | ❌ | Público |
| POST | `/register` | Registrar nuevo usuario | ❌ | Público |
| GET | `/me` | Obtener usuario actual | ✅ | Propio |
| POST | `/change-password` | Cambiar contraseña | ✅ | Propio |
| PUT | `/me/email` | Actualizar email | ✅ | Propio |
| PUT | `/me/goal` | Actualizar meta semanal | ✅ | Propio |

**Ejemplos:**

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}

# Respuesta
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "admin"
  }
}

# Obtener usuario actual
GET /api/auth/me
Authorization: Bearer <token>

# Respuesta
{
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "admin",
    "weekly_goal": 40,
    "organizational_unit_id": "uuid"
  }
}
```

---

### **⏱️ REGISTROS DE TIEMPO (/api/time-entries)**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/` | Listar registros (según RBAC) | view.all / view.own |
| POST | `/` | Crear registro | create.all / create.own |
| PUT | `/:id` | Actualizar registro | update.all / update.own |
| DELETE | `/:id` | Eliminar registro | delete.all / delete.own |
| POST | `/bulk` | Crear múltiples registros | create.all / create.own |
| DELETE | `/bulk` | Eliminar múltiples registros | delete.all / delete.own |

**Ejemplos:**

```bash
# Listar registros
GET /api/time-entries
Authorization: Bearer <token>

# Respuesta
{
  "timeEntries": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "organizational_unit_id": "uuid",
      "start_time": "2026-04-23T08:00:00Z",
      "end_time": "2026-04-23T10:00:00Z",
      "total_hours": 2.0,
      "description": "Desarrollo de feature X",
      "status": "completed",
      "users": { "name": "Juan Pérez" },
      "organizational_units": { "name": "Desarrollo", "type": "proceso" }
    }
  ]
}

# Crear registro
POST /api/time-entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "organizational_unit_id": "uuid",
  "start_time": "2026-04-23T08:00:00Z",
  "end_time": "2026-04-23T10:00:00Z",
  "total_hours": 2.0,
  "description": "Desarrollo de feature X"
}

# Crear múltiples registros (bulk)
POST /api/time-entries/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "entries": [
    {
      "organizational_unit_id": "uuid1",
      "start_time": "2026-04-23T08:00:00Z",
      "end_time": "2026-04-23T10:00:00Z",
      "total_hours": 2.0,
      "description": "Tarea 1"
    },
    {
      "organizational_unit_id": "uuid2",
      "start_time": "2026-04-23T10:00:00Z",
      "end_time": "2026-04-23T12:00:00Z",
      "total_hours": 2.0,
      "description": "Tarea 2"
    }
  ]
}
```

---

### **👥 USUARIOS (/api/users)**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/` | Listar usuarios (según RBAC) | view.all / view.own |
| GET | `/:id` | Obtener usuario específico | view.all / view.own |
| POST | `/` | Crear usuario | create.all |
| PUT | `/:id` | Actualizar usuario | update.all / update.own |
| DELETE | `/:id` | Eliminar usuario | delete.all |

**Ejemplos:**

```bash
# Listar usuarios
GET /api/users
Authorization: Bearer <token>

# Respuesta
{
  "users": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "admin",
      "weekly_goal": 40,
      "organizational_unit_id": "uuid",
      "is_active": true
    }
  ]
}

# Crear usuario
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "María López",
  "email": "maria@ejemplo.com",
  "password": "contraseña123",
  "role": "operario",
  "organizational_unit_id": "uuid",
  "weekly_goal": 40
}
```

---

### **🏢 UNIDADES ORGANIZACIONALES (/api/organizational-units)**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/` | Listar unidades | Todos |
| GET | `/:id` | Obtener unidad específica | Todos |
| POST | `/` | Crear unidad | create.all |
| POST | `/bulk` | Crear múltiples unidades | create.all |
| PUT | `/:id` | Actualizar unidad | update.all |
| DELETE | `/:id` | Eliminar unidad | delete.all |

**Tipos de unidades:**
- `area`: Área organizacional (ej: Desarrollo, Marketing)
- `proceso`: Proceso interno (ej: Frontend, Backend, Testing)

**Ejemplos:**

```bash
# Listar unidades
GET /api/organizational-units
Authorization: Bearer <token>

# Respuesta
{
  "organizationalUnits": [
    {
      "id": "uuid",
      "name": "Desarrollo",
      "type": "area",
      "parent_id": null,
      "is_active": true
    },
    {
      "id": "uuid2",
      "name": "Frontend",
      "type": "proceso",
      "parent_id": "uuid",
      "is_active": true
    }
  ]
}

# Crear unidad
POST /api/organizational-units
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Backend",
  "type": "proceso",
  "parent_id": "uuid-del-area-desarrollo"
}
```

---

### **🎯 OBJETIVOS (/api/objectives)**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/` | Listar objetivos (con filtros) | view.all |
| GET | `/:id` | Obtener objetivo específico | view.all |
| GET | `/:id/analysis` | Análisis de objetivo (horas reales vs objetivo) | view.all |
| GET | `/:id/schedule` | Obtener distribución semanal | view.all |
| POST | `/` | Crear objetivo | create.company / create.assigned / create.personal |
| POST | `/:id/schedule` | Guardar distribución semanal | update.all |
| POST | `/:id/complete` | Marcar como completado | update.all |
| PUT | `/:id` | Actualizar objetivo | update.all |
| DELETE | `/:id` | Eliminar objetivo | delete.all |
| GET | `/user/:userId/can-create-personal` | Verificar si puede crear objetivo personal | Todos |

**Query params para GET /:**
- `status`: Filtrar por estado (planned, in_progress, completed, etc.)
- `organizational_unit_id`: Filtrar por unidad
- `start_date`: Fecha inicio
- `end_date`: Fecha fin

**Tipos de objetivos:**
- `company`: Objetivo de empresa
- `assigned`: Objetivo asignado a usuario
- `personal`: Objetivo personal del usuario

**Ejemplos:**

```bash
# Listar objetivos
GET /api/objectives?status=in_progress
Authorization: Bearer <token>

# Respuesta
{
  "objectives": [
    {
      "id": "uuid",
      "name": "Implementar módulo de reportes",
      "type": "company",
      "status": "in_progress",
      "target_hours": 80,
      "start_date": "2026-04-01",
      "end_date": "2026-04-30",
      "organizational_unit_id": "uuid",
      "assigned_to": null,
      "progress_percentage": 45.5
    }
  ]
}

# Crear objetivo
POST /api/objectives
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Implementar módulo de reportes",
  "description": "Crear sistema completo de reportes",
  "type": "company",
  "target_hours": 80,
  "start_date": "2026-04-01",
  "end_date": "2026-04-30",
  "organizational_unit_id": "uuid",
  "success_criteria": "Reportes funcionales y testeados"
}

# Análisis de objetivo
GET /api/objectives/uuid/analysis
Authorization: Bearer <token>

# Respuesta
{
  "objective": { /* datos del objetivo */ },
  "analysis": {
    "target_hours": 80,
    "actual_hours": 36.5,
    "remaining_hours": 43.5,
    "progress_percentage": 45.6,
    "days_elapsed": 15,
    "days_remaining": 15,
    "is_on_track": true,
    "expected_hours_by_now": 40,
    "variance": -3.5
  }
}
```

---

### **🔑 ROLES (/api/roles)**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/` | Listar roles | view.all |
| GET | `/:id` | Obtener rol específico | view.all |
| GET | `/:id/permissions` | Ver permisos del rol | view.all |
| POST | `/` | Crear rol | manage.all (superadmin) |
| PUT | `/:id` | Actualizar rol | manage.all (superadmin) |
| PUT | `/:id/permissions` | Actualizar todos los permisos del rol | manage.all (superadmin) |
| POST | `/:id/permissions` | Asignar permiso a rol | manage.all (superadmin) |
| DELETE | `/:id/permissions/:permissionId` | Remover permiso de rol | manage.all (superadmin) |
| DELETE | `/:id` | Eliminar rol | manage.all (superadmin) |

**Roles del sistema:**
- `superadmin`: Control total del sistema
- `admin`: Administrador con permisos amplios
- `operario`: Usuario estándar con permisos limitados

**Ejemplos:**

```bash
# Listar roles
GET /api/roles
Authorization: Bearer <token>

# Respuesta
{
  "roles": [
    {
      "id": "uuid",
      "name": "admin",
      "description": "Administrador del sistema",
      "is_system_role": true
    }
  ]
}

# Obtener permisos de un rol
GET /api/roles/uuid/permissions
Authorization: Bearer <token>

# Respuesta
{
  "permissions": [
    {
      "id": "uuid",
      "resource": "time_entries",
      "action": "view",
      "scope": "all"
    },
    {
      "id": "uuid2",
      "resource": "users",
      "action": "create",
      "scope": "all"
    }
  ]
}
```

---

### **🔐 PERMISOS (/api/permissions)**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/` | Obtener todos los permisos disponibles | manage.all (superadmin) |
| GET | `/me` | Obtener mis permisos | Todos |
| GET | `/user/:userId` | Obtener permisos de un usuario | manage.all (superadmin) |
| POST | `/user/:userId` | Asignar permiso a usuario | manage.all (superadmin) |
| DELETE | `/user/:userId/:permissionId` | Remover permiso de usuario | manage.all (superadmin) |

**Estructura de permisos:**
- `resource`: Recurso (time_entries, users, roles, etc.)
- `action`: Acción (view, create, update, delete, manage)
- `scope`: Alcance (all, team, own, assigned, company, personal)

**Ejemplos:**

```bash
# Obtener mis permisos
GET /api/permissions/me
Authorization: Bearer <token>

# Respuesta
{
  "permissions": [
    {
      "resource": "time_entries",
      "action": "view",
      "scope": "all"
    },
    {
      "resource": "time_entries",
      "action": "create",
      "scope": "own"
    }
  ]
}
```

---

### **📊 REPORTES (/api/reports)**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/summary` | Resumen agregado con filtros | view.all / view.team / view.own |

**Query params para /summary:**
- `start_date`: Fecha inicio (YYYY-MM-DD) **requerido**
- `end_date`: Fecha fin (YYYY-MM-DD) **requerido**
- `user_id`: Filtrar por usuario (opcional)
- `unit_id`: Filtrar por unidad organizacional (opcional)
- `group_by`: Agrupar por (user, unit, day, week, month)

**Ejemplos:**

```bash
# Resumen por usuario
GET /api/reports/summary?start_date=2026-04-01&end_date=2026-04-30&group_by=user
Authorization: Bearer <token>

# Respuesta
{
  "summary": {
    "total_hours": 320.5,
    "total_entries": 156,
    "avg_daily_hours": 7.8,
    "users_count": 5,
    "units_count": 8,
    "date_range": {
      "start_date": "2026-04-01",
      "end_date": "2026-04-30"
    }
  },
  "grouped_data": {
    "by_user": [
      {
        "user_id": "uuid",
        "user_name": "Juan Pérez",
        "total_hours": 85.5,
        "entries_count": 42
      }
    ],
    "by_unit": [
      {
        "unit_id": "uuid",
        "unit_name": "Desarrollo",
        "total_hours": 156.0,
        "entries_count": 78
      }
    ]
  }
}
```

---

## 🔒 SISTEMA RBAC (Role-Based Access Control)

### **Recursos y Acciones**

| Recurso | Acciones Disponibles | Scopes |
|---------|---------------------|--------|
| `time_entries` | view, create, update, delete | all, team, own |
| `users` | view, create, update, delete | all, team, own |
| `organizational_units` | view, create, update, delete | all |
| `objectives` | view, create, update, delete | all, assigned, company, personal |
| `roles` | view, manage | all |
| `permissions` | view, manage | all |
| `reports` | view | all, team, own |

### **Matriz de Permisos por Rol**

#### **Superadmin**
- ✅ **TODO**: Control total del sistema
- Puede gestionar roles y permisos
- Acceso a todos los recursos con scope `all`

#### **Admin**
- ✅ Ver y gestionar usuarios
- ✅ Ver y gestionar time entries (all)
- ✅ Ver y gestionar unidades organizacionales
- ✅ Ver y gestionar objetivos
- ✅ Ver reportes (all)
- ❌ NO puede gestionar roles ni permisos

#### **Operario**
- ✅ Ver sus propios time entries
- ✅ Crear sus propios time entries
- ✅ Editar/eliminar sus propios time entries
- ✅ Ver su propio perfil
- ✅ Ver reportes propios
- ❌ NO puede ver datos de otros usuarios
- ❌ NO puede gestionar usuarios, roles, ni unidades

### **Verificación de Permisos**

El sistema verifica permisos en 3 niveles:

1. **Nivel de Rol**: ¿El usuario tiene el rol adecuado?
2. **Nivel de Recurso**: ¿Tiene permiso sobre este recurso?
3. **Nivel de Scope**: ¿Puede acceder a ESTE registro específico?

**Ejemplo:**

```javascript
// Usuario operario intenta editar time entry
// 1. Tiene rol 'operario' ✅
// 2. Tiene permiso 'time_entries.update.own' ✅
// 3. ¿Es dueño del registro? 
//    - Si es suyo → ✅ Permitir
//    - Si es de otro → ❌ Denegar (403 Forbidden)
```

---

## 💾 BASE DE DATOS

### **Tablas Principales**

#### **users**
```sql
- id (uuid, PK)
- name (text)
- email (text, unique)
- password_hash (text)
- role (text) -- 'superadmin', 'admin', 'operario'
- organizational_unit_id (uuid, FK)
- weekly_goal (numeric)
- monthly_goal (numeric)
- standard_daily_hours (numeric)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### **time_entries**
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- organizational_unit_id (uuid, FK)
- start_time (timestamp)
- end_time (timestamp)
- total_hours (numeric)
- description (text)
- status (text) -- 'draft', 'completed', 'approved'
- created_at (timestamp)
- updated_at (timestamp)
```

#### **organizational_units**
```sql
- id (uuid, PK)
- name (text)
- type (text) -- 'area', 'proceso'
- parent_id (uuid, FK, nullable)
- is_active (boolean)
- created_at (timestamp)
```

#### **objectives**
```sql
- id (uuid, PK)
- name (text)
- description (text)
- type (text) -- 'company', 'assigned', 'personal'
- status (text) -- 'planned', 'in_progress', 'completed', etc.
- target_hours (numeric)
- start_date (date)
- end_date (date)
- organizational_unit_id (uuid, FK)
- assigned_to (uuid, FK, nullable)
- created_by (uuid, FK)
- success_criteria (text)
- completion_notes (text)
- is_completed (boolean)
- completed_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### **roles**
```sql
- id (uuid, PK)
- name (text, unique)
- description (text)
- is_system_role (boolean)
- created_at (timestamp)
```

#### **permissions**
```sql
- id (uuid, PK)
- resource (text) -- 'time_entries', 'users', etc.
- action (text) -- 'view', 'create', 'update', 'delete'
- scope (text) -- 'all', 'team', 'own'
- description (text)
```

#### **role_permissions**
```sql
- role_id (uuid, FK)
- permission_id (uuid, FK)
- PRIMARY KEY (role_id, permission_id)
```

#### **user_permissions**
```sql
- user_id (uuid, FK)
- permission_id (uuid, FK)
- PRIMARY KEY (user_id, permission_id)
```

---

## 🛡️ SEGURIDAD

### **Medidas Implementadas**

#### **1. Autenticación**
- ✅ JWT con expiración configurable
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Tokens en header `Authorization: Bearer <token>`

#### **2. Autorización**
- ✅ Sistema RBAC granular
- ✅ Verificación de permisos en cada endpoint
- ✅ Scope-based access control

#### **3. Headers de Seguridad (Helmet)**
- ✅ Content Security Policy (CSP)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ Strict-Transport-Security (HSTS)

#### **4. CORS**
- ✅ Orígenes permitidos configurables
- ✅ Credentials habilitados
- ✅ Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS

#### **5. Rate Limiting**
- ✅ Límite de peticiones por IP
- ✅ Configurable (por defecto: 100 req/15min)
- ✅ Solo en rutas `/api/*`

#### **6. Validación de Entrada**
- ✅ Validación de datos en middleware
- ✅ Sanitización de inputs
- ✅ Prevención de SQL injection (Supabase client)

#### **7. Logging**
- ✅ Registro de errores
- ✅ Registro de accesos no autorizados
- ✅ Registro de cambios críticos

---

## 📝 LOGGING Y MONITOREO

### **Sistema de Logging (Winston)**

**Niveles de log:**
- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `debug`: Información de depuración

**Formato:**
```
[2026-04-23 10:30:45] [INFO] Usuario autenticado: juan@ejemplo.com
[2026-04-23 10:31:12] [ERROR] Error al crear time entry: Validation failed
[2026-04-23 10:32:05] [WARN] CORS bloqueado para origin: http://malicious.com
```

**Uso en código:**

```javascript
import logger from './utils/logger.js';

logger.info('Usuario autenticado', { userId, email });
logger.error('Error al crear registro', { error, userId });
logger.warn('Intento de acceso no autorizado', { userId, resource });
logger.debug('Query ejecutada', { query, params });
```

---

## 🚀 INICIAR EL SERVIDOR

### **Desarrollo**

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar en modo desarrollo (con auto-reload)
npm run dev
```

### **Producción**

```bash
# Configurar variables de entorno de producción
cp .env.production.example .env

# Iniciar servidor
npm start
```

### **Scripts Disponibles**

```json
{
  "start": "node src/app.js",
  "dev": "nodemon src/app.js",
  "migrate": "node scripts/migrate.js",
  "seed": "node scripts/seed.js"
}
```

---

## 📌 NOTAS IMPORTANTES

### **Convenciones de Código**

1. **ES Modules**: Usar `import/export` en lugar de `require`
2. **Async/Await**: Preferir sobre callbacks y `.then()`
3. **Error Handling**: Siempre usar try-catch y logger
4. **Naming**: camelCase para variables, PascalCase para clases
5. **Comentarios**: JSDoc para funciones públicas

### **Buenas Prácticas**

✅ **Separación de responsabilidades**: Routes → Controllers → Services  
✅ **DRY**: No repetir código, crear helpers  
✅ **Validación**: Siempre validar inputs  
✅ **Logging**: Registrar errores y eventos importantes  
✅ **RBAC**: Verificar permisos en TODAS las rutas protegidas  
✅ **Testing**: (Pendiente) Implementar tests unitarios y de integración  

### **Migraciones**

- Todas las migraciones en `backend/migrations/`
- Formato: `YYYYMMDD_descripcion.sql`
- Ejecutar manualmente en consola de Supabase
- NO ejecutar desde Node.js (DB en la nube)

---

## 🔗 RECURSOS ADICIONALES

- **Supabase Docs**: https://supabase.com/docs
- **Express.js**: https://expressjs.com/
- **JWT**: https://jwt.io/
- **Winston Logger**: https://github.com/winstonjs/winston

---

**Última actualización:** Abril 2026  
**Mantenido por:** Equipo de Desarrollo Amarantus
