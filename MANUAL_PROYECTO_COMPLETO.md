# 📘 **MANUAL COMPLETO DEL PROYECTO - Sistema de Horas Amarantus**

**Versión:** 2.0  
**Fecha:** 10 de Abril de 2026  
**Estado:** DOCUMENTO ÚNICO Y DEFINITIVO

---

## 📑 **ÍNDICE**

1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Estructura de Archivos](#2-estructura-de-archivos)
3. [Reglas de Programación](#3-reglas-de-programación)
4. [Base de Datos en la Nube](#4-base-de-datos-en-la-nube)
5. [Sistema RBAC](#5-sistema-rbac)
6. [Flujo de Trabajo](#6-flujo-de-trabajo)
7. [Constantes y Configuración](#7-constantes-y-configuración)
8. [Patrones y Convenciones](#8-patrones-y-convenciones)
9. [Testing y Validación](#9-testing-y-validación)

---

# 1. ARQUITECTURA DEL SISTEMA

## 1.1 Capas del Backend (3 capas estrictas)

```
┌─────────────────────────────────────┐
│  ROUTES (Rutas HTTP)                │  ← Solo define endpoints
│  - Valida request                   │
│  - Llama a Controller               │
│  - NO lógica de negocio             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  CONTROLLERS (Controladores)        │  ← Orquesta el flujo
│  - Recibe datos del route           │
│  - Llama a Services                 │
│  - Formatea respuesta               │
│  - NO accede a DB directamente      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  SERVICES (Lógica de Negocio)       │  ← Toda la lógica aquí
│  - Validaciones de negocio          │
│  - Acceso a DB                      │
│  - Cálculos y transformaciones      │
│  - Puede llamar otros Services      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  DATABASE (Supabase/PostgreSQL)     │
└─────────────────────────────────────┘
```

## 1.2 Capas del Frontend (4 capas estrictas)

```
┌─────────────────────────────────────┐
│  PAGES (Páginas)                    │  ← Solo layout y composición
│  - Compone componentes              │
│  - Usa hooks                        │
│  - NO lógica de negocio             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  COMPONENTS (Componentes UI)        │  ← Solo presentación
│  - Recibe props                     │
│  - Renderiza UI                     │
│  - NO llama APIs directamente       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  HOOKS (Lógica de Estado)           │  ← Gestión de estado
│  - useState, useEffect              │
│  - Llama a Services                 │
│  - Maneja loading/error             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  SERVICES (API Calls)               │  ← Comunicación con backend
│  - Fetch/Axios                      │
│  - Maneja errores HTTP              │
│  - Transforma datos                 │
└─────────────────────────────────────┘
```

## 1.3 Prohibiciones Absolutas

### Backend
❌ **NUNCA:**
- Lógica de negocio en routes
- Acceso directo a DB desde controllers
- Queries SQL en routes
- Validaciones de negocio en routes
- Múltiples responsabilidades en una función

✅ **SIEMPRE:**
- Route → Controller → Service → DB
- Una función = una responsabilidad
- Validaciones en middleware o service
- Errores con códigos HTTP correctos
- Logs con logger centralizado

### Frontend
❌ **NUNCA:**
- Fetch directo en componentes
- Lógica de negocio en componentes
- Estado global sin Context/Store
- console.log (usar logger)
- Duplicar código

✅ **SIEMPRE:**
- Component → Hook → Service → API
- Props tipadas (PropTypes o TypeScript)
- Manejo de loading/error en hooks
- Componentes reutilizables
- Un componente = una responsabilidad

---

# 2. ESTRUCTURA DE ARCHIVOS

## 2.1 Backend

```
backend/
├── src/
│   ├── routes/              # Solo endpoints HTTP
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── timeEntries.js
│   │   ├── organizationalUnits.js
│   │   ├── reports.js
│   │   ├── objectives.routes.js
│   │   ├── roles.js
│   │   └── permissions.js
│   │
│   ├── controllers/         # Orquestación
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── timeEntries.controller.js
│   │   ├── organizationalUnits.controller.js
│   │   ├── reports.controller.js
│   │   ├── objectives.controller.js
│   │   ├── roles.controller.js
│   │   └── permissions.controller.js
│   │
│   ├── services/            # Lógica de negocio
│   │   ├── auth.service.js
│   │   ├── users.service.js
│   │   ├── timeEntries.service.js
│   │   ├── organizationalUnits.service.js
│   │   ├── reports.service.js
│   │   ├── objectives.service.js
│   │   └── permissions.service.js
│   │
│   ├── middleware/          # Validaciones, auth
│   │   ├── auth.js
│   │   ├── roles.js
│   │   ├── permissions.js
│   │   ├── validators.js
│   │   └── errorHandler.js
│   │
│   ├── models/              # Constantes y tipos
│   │   ├── constants.js
│   │   └── types.js
│   │
│   ├── utils/               # Helpers puros
│   │   ├── logger.js
│   │   └── dateHelpers.js
│   │
│   ├── config/              # Configuración
│   │   ├── database.js
│   │   ├── auth.js
│   │   └── env.js
│   │
│   └── app.js               # Aplicación principal
│
├── migrations/              # Migraciones SQL puras
│   ├── 20260410_create_rbac_system.sql
│   └── 20260410_seed_rbac_data.sql
│
└── package.json
```

## 2.2 Frontend

```
frontend/
├── src/
│   ├── pages/               # Páginas (layout)
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TimeEntries.jsx
│   │   ├── UserManagement.jsx
│   │   ├── OrganizationalUnits.jsx
│   │   ├── Reports.jsx
│   │   └── Objectives.jsx
│   │
│   ├── components/          # UI reutilizable
│   │   ├── common/          # Componentes genéricos
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── HierarchicalSelect.jsx
│   │   │
│   │   ├── layout/          # Layout
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── timeEntry/       # Específicos de time entries
│   │   ├── users/           # Específicos de usuarios
│   │   ├── objectives/      # Específicos de objetivos
│   │   └── reports/         # Específicos de reportes
│   │
│   ├── hooks/               # Lógica de estado
│   │   ├── useAuth.js
│   │   ├── usePermissions.js
│   │   ├── usePermissions.v2.js  # RBAC
│   │   ├── useUsers.js
│   │   ├── useTimeEntries.js
│   │   ├── useOrganizationalUnits.js
│   │   └── useObjectives.js
│   │
│   ├── services/            # API calls
│   │   └── api.js           # Cliente API centralizado
│   │
│   ├── context/             # Estado global
│   │   └── AuthContext.jsx
│   │
│   ├── constants/           # Constantes
│   │   ├── index.js         # Constantes principales
│   │   └── messages.js      # Mensajes de UI
│   │
│   ├── utils/               # Helpers puros
│   │   ├── logger.js
│   │   ├── dateHelpers.js
│   │   ├── reportCalculations.js
│   │   └── roleHelpers.js
│   │
│   ├── offline/             # PWA/Offline
│   │   ├── core/
│   │   │   └── db.js
│   │   ├── sync/
│   │   └── repositories/
│   │
│   └── App.jsx              # Aplicación principal
│
└── package.json
```

---

# 3. REGLAS DE PROGRAMACIÓN

## 3.1 Principios Fundamentales

### DRY (Don't Repeat Yourself)
**NUNCA duplicar código. SIEMPRE crear helpers/componentes reutilizables.**

```javascript
// ❌ MAL - Repetido en 5 archivos
if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) {
  // ...
}

// ✅ BIEN - Una sola función
if (isAdminOrSuperadmin(user)) {
  // ...
}
```

### Single Source of Truth
**NUNCA hardcodear valores. SIEMPRE usar constantes centralizadas.**

```javascript
// ❌ MAL
if (user.role === 'admin') { }
const hours = 8;
alert('Usuario creado');

// ✅ BIEN
if (user.role === USER_ROLES.ADMIN) { }
const hours = REPORT_CONSTANTS.STANDARD_DAILY_HOURS;
showSuccess(MESSAGES.USER_CREATED_SUCCESS);
```

### Separation of Concerns
**NUNCA mezclar lógica de negocio con UI. SIEMPRE separar en capas.**

### KISS (Keep It Simple, Stupid)
**NUNCA sobre-complicar. SIEMPRE buscar la solución más simple.**

## 3.2 Reglas Específicas

### NUNCA Hardcodear Valores

```javascript
// ❌ MAL
const maxUsers = 5;
const defaultHours = 8;
const role = 'admin';

// ✅ BIEN
const maxUsers = REPORT_CONSTANTS.MAX_USERS_COMPARISON;
const defaultHours = REPORT_CONSTANTS.STANDARD_DAILY_HOURS;
const role = USER_ROLES.ADMIN;
```

### NUNCA Usar alert/confirm Directamente

```javascript
// ❌ MAL
alert('Usuario creado');
if (confirm('¿Eliminar?')) { }

// ✅ BIEN
setAlert({ type: 'success', message: MESSAGES.USER_CREATED });
// Usar componente Alert del proyecto
```

### NUNCA Usar console.log

```javascript
// ❌ MAL
console.log('Usuario:', user);
console.error('Error:', error);

// ✅ BIEN
logger.info('Usuario:', user);
logger.error('Error:', error);
```

### NUNCA Crear Componentes Inline

```javascript
// ❌ MAL
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>

// ✅ BIEN
<Spinner />
```

### SIEMPRE Verificar Helpers Existentes

**ANTES de escribir código:**
1. Revisar `utils/` para funciones existentes
2. Usar `dateHelpers.js` para fechas
3. Usar `reportCalculations.js` para cálculos
4. NO duplicar lógica que ya existe

### SIEMPRE Una Función = Una Responsabilidad

```javascript
// ❌ MAL
const processUser = (user) => {
  validateUser(user);
  saveToDatabase(user);
  sendEmail(user);
  updateCache(user);
};

// ✅ BIEN
const validateUser = (user) => { /* ... */ };
const saveUser = (user) => { /* ... */ };
const notifyUser = (user) => { /* ... */ };
const updateUserCache = (user) => { /* ... */ };
```

## 3.3 Nomenclatura

### Variables y Funciones
- **camelCase:** `userName`, `getUserById`
- **Descriptivos:** No usar `x`, `temp`, `data` genéricos
- **Booleanos:** Prefijo `is`, `has`, `can`: `isActive`, `hasPermission`, `canEdit`

### Constantes
- **SCREAMING_SNAKE_CASE:** `USER_ROLES`, `MAX_RETRIES`, `API_URL`
- **Agrupadas por contexto:** `REPORT_CONSTANTS`, `TIME_ENTRY_STATUS`

### Componentes React
- **PascalCase:** `UserManagement`, `TimeEntryForm`
- **Descriptivos:** Indicar qué hace: `UserList` no `List`

### Archivos
- **Backend:** `users.service.js`, `auth.controller.js`, `timeEntries.routes.js`
- **Frontend:** `useUsers.js`, `UserManagement.jsx`, `Button.jsx`

---

# 4. BASE DE DATOS EN LA NUBE

## 4.1 Configuración

**Base de Datos:** Supabase (PostgreSQL en la nube)  
**Acceso:** Solo mediante consola web de Supabase  
**NO hay acceso directo desde terminal local**

## 4.2 Migraciones

### ⚠️ REGLAS OBLIGATORIAS

1. **SIEMPRE crear archivos .sql puros** (NO scripts de Node.js, NO ORMs)
2. **Los archivos SQL deben ser copiables** y ejecutables directamente en la consola de Supabase
3. **Incluir comentarios claros** en español
4. **Usar transacciones** cuando sea apropiado
5. **Incluir mensajes de verificación** con `RAISE NOTICE`
6. **NO asumir** que se pueden ejecutar comandos desde terminal local

### Ubicación y Formato

```
backend/migrations/
├── YYYYMMDD_descripcion.sql
└── YYYYMMDD_seed_data.sql
```

**Ejemplo:**
```
20260410_create_rbac_system.sql
20260410_seed_rbac_data.sql
```

### Estructura de una Migración

```sql
-- ============================================================================
-- MIGRACIÓN: Descripción clara
-- Fecha: YYYY-MM-DD
-- Descripción: Qué hace esta migración
-- ============================================================================

-- Crear tabla
CREATE TABLE IF NOT EXISTS mi_tabla (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_mi_tabla_nombre ON mi_tabla(nombre);

-- Comentarios
COMMENT ON TABLE mi_tabla IS 'Descripción de la tabla';
COMMENT ON COLUMN mi_tabla.nombre IS 'Descripción de la columna';

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada exitosamente';
  RAISE NOTICE 'Tablas creadas: mi_tabla';
END $$;
```

## 4.3 Proceso de Ejecución

1. **Abrir Supabase SQL Editor**
   - Ir a proyecto en Supabase
   - Click en "SQL Editor"

2. **Copiar SQL**
   - Abrir archivo de migración
   - Copiar TODO el contenido

3. **Ejecutar**
   - Pegar en SQL Editor
   - Click en "Run"
   - Verificar mensajes de éxito

4. **Verificar**
   - Ejecutar queries de verificación
   - Comprobar que todo se creó correctamente

## 4.4 Conexión desde Backend

```javascript
// config/database.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
```

**Variables de entorno (.env):**
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key
```

---

# 5. SISTEMA RBAC

## 5.1 Estructura

### Tablas

```sql
roles                    -- Roles del sistema
├── id (UUID)
├── name (VARCHAR)
├── slug (VARCHAR)       -- Identificador único
├── description (TEXT)
├── is_system (BOOLEAN)  -- No se puede eliminar
└── is_active (BOOLEAN)

permissions              -- Catálogo de permisos
├── id (UUID)
├── resource (VARCHAR)   -- users, time_entries, etc.
├── action (VARCHAR)     -- view, create, update, delete
├── scope (VARCHAR)      -- all, team, own
└── description (TEXT)

role_permissions         -- Permisos por rol
├── id (UUID)
├── role_id (UUID)
└── permission_id (UUID)

user_permissions         -- Excepciones por usuario
├── id (UUID)
├── user_id (UUID)
├── permission_id (UUID)
└── granted (BOOLEAN)    -- true = conceder, false = revocar

users
└── role_id (UUID)       -- Nueva columna
```

### Roles Predefinidos

1. **superadmin** - Acceso total sin restricciones
2. **admin** - Gestión completa (excepto otros admins)
3. **supervisor** - Supervisión de equipos
4. **team_lead** - Coordinación de equipo
5. **operario** - Registro básico

### Formato de Permisos

```
{resource}.{action}.{scope}

Ejemplos:
users.view.all          → Ver todos los usuarios
time_entries.create.own → Crear sus propios registros
objectives.update.team  → Editar objetivos del equipo
reports.export.all      → Exportar todos los reportes
```

### Recursos Disponibles

- `users` - Usuarios
- `time_entries` - Registros de tiempo
- `org_units` - Unidades organizacionales
- `objectives` - Objetivos
- `reports` - Reportes
- `settings` - Configuración
- `roles` - Roles
- `permissions` - Permisos

### Acciones Disponibles

- `view` - Ver/Consultar
- `create` - Crear
- `update` - Actualizar
- `delete` - Eliminar
- `export` - Exportar
- `import` - Importar
- `activate` - Activar/Desactivar
- `complete` - Marcar como completado
- `manage` - Gestionar (admin)
- `assign` - Asignar

### Alcances Disponibles

- `all` - Todos los registros
- `team` - Solo del equipo/área
- `own` - Solo propios

## 5.2 Uso en Backend

### En Rutas

```javascript
import { checkPermission } from '../middleware/permissions.js';

// Verificar permiso específico
router.get('/users', 
  authenticate, 
  checkPermission('users', 'view', 'all'),
  usersController.getAll
);

// Verificar múltiples permisos (OR)
import { checkAnyPermission } from '../middleware/permissions.js';

router.get('/entries',
  authenticate,
  checkAnyPermission([
    { resource: 'time_entries', action: 'view', scope: 'all' },
    { resource: 'time_entries', action: 'view', scope: 'team' }
  ]),
  controller.getAll
);

// Verificar acceso a recurso específico
import { checkResourceAccess } from '../middleware/permissions.js';

router.put('/users/:id',
  authenticate,
  checkResourceAccess('users', 'update', async (req) => {
    return await usersService.getById(req.params.id);
  }),
  usersController.update
);
```

### En Servicios

```javascript
import permissionsService from './permissions.service.js';

// Verificar permiso
const hasPermission = await permissionsService.userCan(
  userId,
  'users',
  'view',
  'all'
);

// Verificar acceso a recurso
const canAccess = await permissionsService.canAccessResource(
  userId,
  'time_entries',
  'update',
  timeEntry
);
```

## 5.3 Uso en Frontend

### En Componentes

```javascript
import { usePermissions } from '../hooks/usePermissions.v2';

const MyComponent = () => {
  const { 
    userCan, 
    can, 
    canViewAllUsers, 
    canCreateUsers 
  } = usePermissions();

  // Método 1: Verificar permiso específico
  if (userCan('users', 'view', 'all')) {
    // Mostrar todos los usuarios
  }

  // Método 2: Método compatible con código existente
  if (can('view', 'users', targetUser)) {
    // Mostrar usuario
  }

  // Método 3: Shortcuts
  if (canViewAllUsers()) {
    // Mostrar todos los usuarios
  }

  return (
    <>
      {canCreateUsers() && (
        <Button onClick={handleCreate}>Crear Usuario</Button>
      )}
    </>
  );
};
```

### Shortcuts Disponibles

```javascript
const {
  // Verificadores de rol
  isSuperadmin,
  isAdmin,
  isSupervisor,
  isTeamLead,
  isOperario,
  
  // Permisos de usuarios
  canViewAllUsers,
  canCreateUsers,
  
  // Permisos de registros
  canViewAllTimeEntries,
  canViewTeamTimeEntries,
  
  // Permisos de org units
  canManageOrgUnits,
  
  // Permisos de reportes
  canViewReports,
  canExportReports,
  
  // Permisos de roles
  canManageRoles,
  
  // Permisos de objetivos
  canManageCompanyObjectives,
  canAssignObjectives,
  canCreatePersonalObjectives
} = usePermissions();
```

---

# 6. FLUJO DE TRABAJO

## 6.1 Desarrollo de Nueva Funcionalidad

### Checklist Obligatorio

```bash
# 1. ¿Respeta la arquitectura de capas?
□ Routes solo definen endpoints
□ Controllers solo orquestan
□ Services tienen toda la lógica
□ Components solo renderizan
□ Hooks manejan estado

# 2. ¿Sigue las reglas de código?
□ Una función = una responsabilidad
□ No hay código duplicado
□ Usa logger en lugar de console.log
□ Maneja errores correctamente
□ Nombres descriptivos

# 3. ¿Usa constantes?
□ No hay valores hardcodeados
□ Usa constantes de constants/index.js
□ Usa mensajes de constants/messages.js

# 4. ¿Está documentado?
□ JSDoc en funciones públicas
□ Comentarios en lógica compleja
□ README actualizado si es necesario

# 5. ¿Verifica helpers existentes?
□ Revisó utils/ antes de crear funciones
□ Usa dateHelpers para fechas
□ Usa reportCalculations para cálculos
□ No duplica lógica existente
```

## 6.2 Ejemplo Completo: Crear Time Entry

### Backend

```javascript
// 1. ROUTE (routes/timeEntries.js)
router.post('/', 
  authenticate,
  checkPermission('time_entries', 'create', 'own'),
  validateTimeEntry,
  timeEntriesController.create
);

// 2. CONTROLLER (controllers/timeEntries.controller.js)
const create = asyncHandler(async (req, res) => {
  const entry = await timeEntriesService.createEntry(req.body, req.user.id);
  res.status(201).json({ timeEntry: entry });
});

// 3. SERVICE (services/timeEntries.service.js)
const createEntry = async (data, userId) => {
  // Validar
  if (!data.start_time || !data.end_time) {
    throw new ValidationError('start_time y end_time son requeridos');
  }
  
  // Calcular horas
  const hours = calculateHours(data.start_time, data.end_time);
  
  // Guardar en DB
  const { data: entry, error } = await supabase
    .from('time_entries')
    .insert({
      ...data,
      user_id: userId,
      total_hours: hours
    })
    .select()
    .single();
    
  if (error) throw error;
  
  logger.info('Time entry creado:', entry.id);
  return entry;
};
```

### Frontend

```javascript
// 1. PAGE (pages/TimeEntries.jsx)
const TimeEntries = () => {
  const { timeEntries, loading, createEntry } = useTimeEntries(user?.id);
  const { canCreateTimeEntries } = usePermissions();
  
  if (loading) return <Spinner />;
  
  return (
    <div>
      {canCreateTimeEntries() && (
        <Button onClick={handleCreate}>Crear Registro</Button>
      )}
      <TimeEntriesList entries={timeEntries} />
    </div>
  );
};

// 2. HOOK (hooks/useTimeEntries.js)
const useTimeEntries = (userId) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await timeEntriesService.getAll();
      setTimeEntries(data);
    } catch (err) {
      logger.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  const createEntry = async (data) => {
    const entry = await timeEntriesService.create(data);
    setTimeEntries(prev => [...prev, entry]);
    return entry;
  };
  
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);
  
  return { timeEntries, loading, createEntry };
};

// 3. SERVICE (services/api.js)
export const timeEntriesService = {
  getAll: () => api.get('/time-entries'),
  create: (data) => api.post('/time-entries', data),
};
```

---

# 7. CONSTANTES Y CONFIGURACIÓN

## 7.1 Constantes del Sistema

**Ubicación:** `constants/index.js` (frontend) y `models/constants.js` (backend)

### Roles

```javascript
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  TEAM_LEAD: 'team_lead',
  OPERARIO: 'operario'
};
```

### Recursos RBAC

```javascript
export const RESOURCES = {
  USERS: 'users',
  TIME_ENTRIES: 'time_entries',
  ORG_UNITS: 'org_units',
  OBJECTIVES: 'objectives',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  ROLES: 'roles',
  PERMISSIONS: 'permissions'
};
```

### Acciones RBAC

```javascript
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  ACTIVATE: 'activate',
  COMPLETE: 'complete',
  MANAGE: 'manage',
  ASSIGN: 'assign'
};
```

### Alcances RBAC

```javascript
export const SCOPES = {
  ALL: 'all',
  TEAM: 'team',
  OWN: 'own'
};
```

### Constantes de Reportes

```javascript
export const REPORT_CONSTANTS = {
  STANDARD_DAILY_HOURS: 8,
  STANDARD_WEEKLY_HOURS: 40,
  DEFAULT_WEEKLY_GOAL: 40,
  DEFAULT_MONTHLY_GOAL: 160,
  MAX_USERS_COMPARISON: 5,
  ENTRIES_PER_PAGE_DETAIL: 20,
  MAX_MONTHS_TRENDS: 12
};
```

## 7.2 Mensajes de UI

**Ubicación:** `constants/messages.js`

```javascript
export const MESSAGES = {
  // Éxito
  USER_CREATED_SUCCESS: 'Usuario creado correctamente',
  USER_UPDATED_SUCCESS: 'Usuario actualizado correctamente',
  
  // Errores
  ERROR_LOADING_DATA: 'Error al cargar los datos',
  ERROR_SAVING_DATA: 'Error al guardar los datos',
  
  // Confirmaciones
  CONFIRM_DELETE_USER: (name) => `¿Estás seguro de eliminar al usuario "${name}"?`,
  CONFIRM_DELETE_ENTRY: '¿Estás seguro de eliminar este registro?'
};
```

## 7.3 Variables de Entorno

### Backend (.env)

```bash
# Base de datos
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=7d

# Servidor
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3001
```

---

# 8. PATRONES Y CONVENCIONES

## 8.1 Manejo de Errores

### Backend

```javascript
// Usar asyncHandler para capturar errores
import { asyncHandler } from '../middleware/errorHandler.js';

const myController = asyncHandler(async (req, res) => {
  const data = await myService.getData();
  res.json({ data });
});

// Lanzar errores específicos
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

if (!data) {
  throw new NotFoundError('Recurso no encontrado');
}

if (!isValid) {
  throw new ValidationError('Datos inválidos');
}
```

### Frontend

```javascript
// En hooks
try {
  setLoading(true);
  const data = await service.getData();
  setData(data);
} catch (err) {
  logger.error('Error:', err);
  setError(err.message);
} finally {
  setLoading(false);
}

// En componentes
if (error) {
  return <Alert type="error" message={error} />;
}
```

## 8.2 Loading States

```javascript
// Hook
const [loading, setLoading] = useState(true);

// Componente
if (loading) return <Spinner />;
```

## 8.3 Validaciones

### Backend

```javascript
// En middleware
export const validateCreateUser = (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'username, email y password son requeridos' 
    });
  }
  
  next();
};

// En service
const validateUser = (user) => {
  if (!isValidEmail(user.email)) {
    throw new ValidationError('Email inválido');
  }
  
  if (user.password.length < 8) {
    throw new ValidationError('Password debe tener al menos 8 caracteres');
  }
};
```

### Frontend

```javascript
// En formularios
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!formData.name.trim()) {
    setError('El nombre es requerido');
    return;
  }
  
  onSubmit(formData);
};
```

## 8.4 Logging

```javascript
// Backend
import logger from '../utils/logger.js';

logger.info('Usuario creado:', user.id);
logger.warn('Intento de acceso no autorizado:', userId);
logger.error('Error en base de datos:', error);

// Frontend
import logger from '../utils/logger';

logger.info('Componente montado');
logger.error('Error cargando datos:', error);
```

---

# 9. TESTING Y VALIDACIÓN

## 9.1 Checklist Pre-Commit

```bash
# Backend
□ Todas las rutas tienen autenticación
□ Todas las rutas tienen validación de permisos
□ Todos los servicios manejan errores
□ Todos los logs usan logger
□ No hay console.log
□ No hay valores hardcodeados
□ Sigue arquitectura Route → Controller → Service

# Frontend
□ Todos los componentes manejan loading/error
□ Todos los hooks usan useCallback/useMemo apropiadamente
□ No hay fetch directo en componentes
□ No hay console.log (usar logger)
□ No hay valores hardcodeados
□ Sigue arquitectura Component → Hook → Service

# General
□ No hay código duplicado
□ Nombres descriptivos
□ Funciones documentadas
□ Una función = una responsabilidad
```

## 9.2 Verificación de Permisos

```javascript
// Backend - Probar endpoints
// Como admin
GET /api/users → ✅ 200 OK

// Como operario
GET /api/users → ❌ 403 Forbidden

// Frontend - Probar UI
// Como admin
canViewAllUsers() → true
<Button> visible

// Como operario
canViewAllUsers() → false
<Button> oculto
```

## 9.3 Queries de Verificación

```sql
-- Verificar roles
SELECT * FROM roles;

-- Verificar permisos
SELECT COUNT(*) FROM permissions;

-- Verificar permisos de un rol
SELECT r.name, p.resource, p.action, p.scope
FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.slug = 'admin';

-- Verificar usuarios migrados
SELECT username, role, role_id FROM users;
```

---

# 10. RESUMEN RÁPIDO

## ⚡ Comandos Esenciales

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Ejecutar migración (en Supabase SQL Editor)
# Copiar y pegar contenido de archivo .sql
```

## 📋 Antes de Programar

1. ✅ Revisar helpers existentes en `utils/`
2. ✅ Verificar constantes en `constants/`
3. ✅ Seguir arquitectura de capas
4. ✅ No duplicar código
5. ✅ Usar logger, no console.log

## 🚀 Flujo de Trabajo

```
Backend: Route → Controller → Service → DB
Frontend: Component → Hook → Service → API
```

## 🔐 Permisos

```
Formato: {resource}.{action}.{scope}
Ejemplo: users.view.all
```

## 📁 Archivos Clave

```
Backend:
- models/constants.js
- services/permissions.service.js
- middleware/permissions.js

Frontend:
- constants/index.js
- hooks/usePermissions.v2.js
- hooks/useAuth.js
```

---

**Fecha de creación:** 10 de Abril de 2026  
**Versión:** 2.0  
**Estado:** DOCUMENTO ÚNICO Y DEFINITIVO  
**Mantenido por:** Equipo de Desarrollo

---

## 📝 NOTAS FINALES

Este documento es la **ÚNICA FUENTE DE VERDAD** del proyecto. Todos los archivos fraccionados deben ser eliminados y se debe consultar únicamente este manual.

**Archivos a eliminar:**
- ARQUITECTURA_OBLIGATORIA.md
- ESTANDARES_DESARROLLO.md
- RBAC_IMPLEMENTATION_PROGRESS.md
- RBAC_IMPLEMENTATION_COMPLETE.md
- Cualquier otro MD de documentación fragmentada

**Actualización:**
Este documento debe actualizarse cada vez que se agreguen nuevas funcionalidades, patrones o reglas al proyecto.
