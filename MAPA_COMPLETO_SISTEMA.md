# 🗺️ MAPA COMPLETO DEL SISTEMA DE HORAS

> **Documento de Referencia Definitivo**  
> Última actualización: 22 de marzo de 2026  
> Este documento es la ÚNICA fuente de verdad para el sistema.

---

## 📋 ÍNDICE

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Datos](#estructura-de-datos)
3. [API Endpoints](#api-endpoints)
4. [Frontend - Componentes](#frontend-componentes)
5. [Offline & Sync](#offline-sync)
6. [Flujos Principales](#flujos-principales)

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │   Services   │  │
│  │              │  │              │  │              │  │
│  │ TimeEntries  │→ │ BulkTimeEntry│→ │   api.js     │  │
│  │ Dashboard    │  │ Modal        │  │ syncManager  │  │
│  │ Reports      │  │ Card, Input  │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↓                                    ↓           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         IndexedDB (Offline Storage)              │   │
│  │  - time_entries  - sync_queue  - sync_metadata  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↕ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routes     │  │  Middleware  │  │  Database    │  │
│  │              │  │              │  │              │  │
│  │ timeEntries  │→ │ validators   │→ │ PostgreSQL   │  │
│  │ auth         │  │ auth         │  │              │  │
│  │ orgUnits     │  │ permissions  │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 ESTRUCTURA DE DATOS

### 1. Time Entry (Registro de Horas)

**Base de Datos (PostgreSQL):**
```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  organizational_unit_id UUID NOT NULL REFERENCES organizational_units(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Formato API (JSON):**
```javascript
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "organizational_unit_id": "789e0123-e45b-67c8-d901-234567890abc",
  "start_time": "2026-03-22T08:00:00",
  "end_time": "2026-03-22T10:30:00",
  "description": null,
  "created_at": "2026-03-22T08:00:00",
  "updated_at": "2026-03-22T08:00:00",
  "organizational_units": {
    "id": "789e0123-e45b-67c8-d901-234567890abc",
    "name": "Cosecha - Finca Norte",
    "areas": {
      "name": "Cosecha"
    }
  }
}
```

**Frontend (Estado React):**
```javascript
// Mismo formato que API + campos offline
{
  ...apiFormat,
  pending_sync: false,
  synced_at: "2026-03-22T10:00:00",
  client_id: "temp_123456789" // Solo para registros no sincronizados
}
```

### 2. Organizational Unit (Tarea/Unidad)

```javascript
{
  "id": "789e0123-e45b-67c8-d901-234567890abc",
  "name": "Cosecha - Finca Norte",
  "area_id": "456e7890-a12b-34c5-d678-901234567def",
  "parent_id": null,
  "areas": {
    "id": "456e7890-a12b-34c5-d678-901234567def",
    "name": "Cosecha"
  }
}
```

### 3. User (Usuario)

```javascript
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "jperez",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "worker", // worker | admin | superadmin
  "active": true
}
```

---

## 🔌 API ENDPOINTS

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### POST /auth/login
```javascript
// Request
{
  "username": "jperez",
  "password": "password123"
}

// Response 200
{
  "user": { ...userData },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
```javascript
// Headers: Authorization: Bearer {token}
// Response 200
{
  "message": "Logout successful"
}
```

---

### Time Entries

#### GET /time-entries
```javascript
// Headers: Authorization: Bearer {token}
// Query params (opcionales):
// - user_id: UUID
// - start_date: YYYY-MM-DD
// - end_date: YYYY-MM-DD

// Response 200
{
  "timeEntries": [
    { ...timeEntry1 },
    { ...timeEntry2 }
  ]
}
```

#### POST /time-entries
```javascript
// Headers: Authorization: Bearer {token}
// Request
{
  "organizational_unit_id": "789e0123-e45b-67c8-d901-234567890abc",
  "start_time": "2026-03-22T08:00:00",
  "end_time": "2026-03-22T10:30:00",
  "description": null
}

// Response 201
{
  "timeEntry": { ...createdEntry }
}
```

#### PUT /time-entries/:id
```javascript
// Headers: Authorization: Bearer {token}
// Request
{
  "start_time": "2026-03-22T08:30:00",
  "end_time": "2026-03-22T11:00:00"
}

// Response 200
{
  "timeEntry": { ...updatedEntry }
}
```

#### DELETE /time-entries/:id
```javascript
// Headers: Authorization: Bearer {token}
// Response 200
{
  "message": "Time entry deleted successfully"
}
```

---

### Organizational Units

#### GET /organizational-units
```javascript
// Headers: Authorization: Bearer {token}
// Response 200
{
  "units": [
    {
      "id": "...",
      "name": "Cosecha - Finca Norte",
      "area_id": "...",
      "areas": {
        "name": "Cosecha"
      }
    }
  ]
}
```

---

## 🎨 FRONTEND - COMPONENTES

### Estructura de Carpetas
```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Alert.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   ├── layout/
│   │   └── Navbar.jsx
│   └── timeEntry/
│       └── BulkTimeEntry.jsx
├── pages/
│   ├── TimeEntries.jsx
│   ├── Dashboard.jsx
│   └── Reports.jsx
├── services/
│   └── api.js
├── offline/
│   ├── index.js
│   ├── repositories/
│   │   └── TimeEntryRepository.js
│   ├── SyncQueue.js
│   └── SyncManager.js
├── hooks/
│   ├── useTimeEntries.js
│   ├── useOrganizationalUnits.js
│   └── useOffline.js
├── context/
│   └── AuthContext.jsx
└── utils/
    └── areaColors.js
```

### Componentes Clave

#### 1. TimeEntries.jsx (Página Principal)
**Responsabilidades:**
- Mostrar historial de registros agrupados por día
- Botón "📋 Cargar Horas" → Abre BulkTimeEntry
- Editar/Eliminar registros individuales
- Días colapsables (click para expandir/colapsar)

**Estados:**
```javascript
const [showBulkEntry, setShowBulkEntry] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [editingEntry, setEditingEntry] = useState(null);
const [editForm, setEditForm] = useState({ startTime: '', endTime: '' });
const [alert, setAlert] = useState(null);
const [saving, setSaving] = useState(false);
const [expandedDays, setExpandedDays] = useState(new Set());
```

**Hooks usados:**
```javascript
const { user } = useAuthContext();
const { timeEntries, createEntry, updateEntry, deleteEntry } = useTimeEntries(user?.id);
const { units } = useOrganizationalUnits();
```

#### 2. BulkTimeEntry.jsx (Modal de Carga Múltiple)
**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  units: Array<OrganizationalUnit>,
  onSave: (entries) => Promise<void>,
  loading: boolean
}
```

**Funcionalidad:**
- Seleccionar fecha
- Agregar múltiples tareas con horas y minutos
- Total acumulado en tiempo real
- Colores por área para identificación visual
- Validación: no permitir guardar sin tareas

**Formato de salida:**
```javascript
[
  {
    organizational_unit_id: "uuid-string",
    start_time: "2026-03-22T00:00:00",
    end_time: "2026-03-22T02:30:00",
    description: null
  }
]
```

#### 3. useTimeEntries.js (Hook Principal)
**Métodos:**
```javascript
{
  timeEntries: Array,
  loading: boolean,
  error: string,
  loadTimeEntries: () => Promise<void>,
  createEntry: (entry) => Promise<{ success, error }>,
  updateEntry: (id, updates) => Promise<{ success, error }>,
  deleteEntry: (id) => Promise<{ success, error }>,
  getTotalHours: (startDate, endDate) => number,
  getEntriesByDateRange: (startDate, endDate) => Array
}
```

**Lógica:**
1. Intenta cargar desde backend (si online)
2. Guarda en IndexedDB como cache
3. Si offline, carga desde IndexedDB
4. Operaciones CUD → Agrega a sync queue si offline

---

## 💾 OFFLINE & SYNC

### IndexedDB Stores

#### 1. time_entries
```javascript
{
  keyPath: 'id',
  indexes: [
    { name: 'user_id', keyPath: 'user_id' },
    { name: 'start_time', keyPath: 'start_time' },
    { name: 'pending_sync', keyPath: 'pending_sync' }
  ]
}
```

#### 2. sync_queue
```javascript
{
  keyPath: 'id',
  autoIncrement: true,
  data: {
    id: number,
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'time_entry',
    data: object,
    client_id: string,
    retry_count: number,
    error: string,
    created_at: timestamp
  }
}
```

#### 3. sync_metadata
```javascript
{
  keyPath: 'key',
  data: {
    key: string,
    value: any,
    updated_at: timestamp
  }
}
```

### Flujo de Sincronización

```
┌─────────────────────────────────────────────┐
│ 1. Usuario crea/edita/elimina registro      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. ¿Está online?                            │
│    SÍ → Enviar a backend directamente       │
│    NO → Guardar en sync_queue               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. Guardar en IndexedDB (cache local)       │
│    - Marcar pending_sync: true si offline   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 4. Actualizar UI inmediatamente             │
│    - Usuario ve cambios sin esperar         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 5. Cuando vuelve online:                    │
│    - SyncManager procesa sync_queue         │
│    - Envía pendientes al backend            │
│    - Actualiza IDs temporales por reales    │
│    - Marca pending_sync: false              │
└─────────────────────────────────────────────┘
```

### SyncManager - Métodos Clave

```javascript
class SyncManager {
  // Sincronizar todos los cambios pendientes
  async sync() { ... }
  
  // Sincronizar un item específico
  async syncItem(item) { ... }
  
  // Clasificar errores (temporal vs permanente)
  classifyError(error) { ... }
  
  // Exponential backoff para reintentos
  shouldSkipRetry(item) { ... }
  
  // Listeners para eventos de sync
  addListener(callback) { ... }
}
```

---

## 🔄 FLUJOS PRINCIPALES

### 1. Carga Múltiple de Horas (Bulk Entry)

```
Usuario → Click "📋 Cargar Horas"
       ↓
Modal BulkTimeEntry se abre
       ↓
Usuario selecciona fecha: 22/03/2026
       ↓
Usuario agrega tareas:
  - Cosecha: 2h 30min
  - Empaque: 3h 15min
  - Riego: 1h 45min
       ↓
Total mostrado: 7h 30min
       ↓
Click "💾 Guardar"
       ↓
Frontend convierte a formato API:
  [
    {
      organizational_unit_id: "uuid-cosecha",
      start_time: "2026-03-22T00:00:00",
      end_time: "2026-03-22T02:30:00"
    },
    {
      organizational_unit_id: "uuid-empaque",
      start_time: "2026-03-22T02:30:00",
      end_time: "2026-03-22T05:45:00"
    },
    {
      organizational_unit_id: "uuid-riego",
      start_time: "2026-03-22T05:45:00",
      end_time: "2026-03-22T07:30:00"
    }
  ]
       ↓
Para cada entrada:
  - createEntry() en useTimeEntries
  - Si online: POST /api/time-entries
  - Si offline: Guardar en sync_queue
       ↓
Actualizar UI con nuevos registros
       ↓
Mostrar alerta de éxito
```

### 2. Edición de Registro

```
Usuario → Click ✏️ en un registro
       ↓
Modal de edición se abre con datos actuales
       ↓
Usuario modifica:
  - Hora inicio: 08:00 → 08:30
  - Hora fin: 10:30 → 11:00
       ↓
Total recalculado automáticamente: 2.5h
       ↓
Click "💾 Guardar Cambios"
       ↓
updateEntry(id, { start_time, end_time })
       ↓
Si online: PUT /api/time-entries/:id
Si offline: Agregar a sync_queue
       ↓
Actualizar IndexedDB
       ↓
Actualizar UI
       ↓
Cerrar modal y mostrar éxito
```

### 3. Visualización por Día (Colapsable)

```
timeEntries cargados desde backend/IndexedDB
       ↓
Agrupar por fecha:
  {
    "2026-03-22": [entry1, entry2, entry3],
    "2026-03-21": [entry4, entry5],
    "2026-03-20": [entry6]
  }
       ↓
Ordenar por fecha descendente
       ↓
Para cada día:
  - Calcular total de horas
  - Renderizar header con fecha y total
  - Estado: expandido/colapsado (Set)
       ↓
Click en header → Toggle expandido
       ↓
Si expandido:
  - Mostrar tabla con registros
  - Columnas: Tarea | Horas | Acciones
```

---

## 🎨 UTILIDADES

### areaColors.js
Asigna colores consistentes a cada área:

```javascript
const AREA_COLORS = {
  'Cosecha': 'bg-green-100 text-green-800 border-green-300',
  'Empaque': 'bg-blue-100 text-blue-800 border-blue-300',
  'Riego': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Mantenimiento': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Administración': 'bg-purple-100 text-purple-800 border-purple-300',
  // ... más áreas
};

export const getAreaColor = (areaName) => {
  return AREA_COLORS[areaName] || 'bg-gray-100 text-gray-800 border-gray-300';
};
```

---

## 🔐 VALIDACIONES

### Backend (validators.js)

```javascript
validateCreateTimeEntry: [
  body('organizational_unit_id')
    .isUUID()
    .withMessage('organizational_unit_id debe ser UUID válido'),
  
  body('start_time')
    .isISO8601()
    .withMessage('start_time debe estar en formato ISO 8601'),
  
  body('end_time')
    .isISO8601()
    .withMessage('end_time debe estar en formato ISO 8601')
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.start_time)) {
        throw new Error('end_time debe ser posterior a start_time');
      }
      return true;
    }),
  
  body('description')
    .optional({ nullable: true })
    .isString()
]
```

### Frontend

```javascript
// Validación en BulkTimeEntry
- Fecha requerida
- Al menos una tarea
- Horas >= 0
- Minutos >= 0 y < 60

// Validación en Edit Modal
- start_time < end_time
- Campos requeridos no vacíos
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints (Tailwind)
```
sm: 640px   → Tablets pequeñas
md: 768px   → Tablets
lg: 1024px  → Laptops
xl: 1280px  → Desktops
```

### Adaptaciones Clave

**Navbar:**
- Mobile: Menú hamburguesa, iconos compactos
- Desktop: Menú horizontal completo

**TimeEntries:**
- Mobile: Tabla simplificada, 2 columnas (Tarea + Horas)
- Desktop: Tabla completa con todas las columnas

**BulkTimeEntry Modal:**
- Mobile: Inputs apilados verticalmente
- Desktop: Grid de 2 columnas

---

## 🚀 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Filtros de Visualización
- **Por Mes**: Selector de mes/año (input type="month")
- **Por Año**: Selector numérico de año
- **Todos**: Ver todos los registros sin filtro
- **Contador dinámico**: Muestra cantidad de registros filtrados

### ✅ Gestión de Registros
- **Carga múltiple**: Modal BulkTimeEntry para cargar varias tareas a la vez
- **Edición**: Modificar horarios de registros existentes
- **Eliminación**: Borrar registros con confirmación
- **Vista colapsable**: Días agrupados que se expanden/colapsan

### ✅ UI Optimizada
- **Diseño compacto**: Historial en un solo card con divisores
- **Responsive**: Adaptado para mobile y desktop
- **Sin horarios visibles**: Solo muestra horas totales (más simple)
- **Colores por área**: Identificación visual en modal de carga

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

1. **Búsqueda por tarea**
2. **Exportar a Excel/PDF**
3. **Gráficos de horas por área**
4. **Notificaciones push para recordatorios**
5. **Modo oscuro**
6. **Filtro por rango de fechas personalizado**

---

## 📝 REGLAS DE ORO

### ✅ SIEMPRE:
1. **UUIDs como strings** en payloads
2. **Fechas en ISO 8601** (YYYY-MM-DDTHH:mm:ss)
3. **description puede ser null**, no string vacío
4. **Validar en backend Y frontend**
5. **Guardar en IndexedDB** para offline
6. **Feedback inmediato** al usuario (optimistic UI)

### ❌ NUNCA:
1. Enviar IDs numéricos donde se esperan UUIDs
2. Usar formatos de fecha locales
3. Asumir que hay conexión
4. Modificar DB sin actualizar este documento
5. Crear componentes sin considerar mobile

---

## 🔍 DEBUGGING

### Ver datos en IndexedDB
```javascript
// En consola del navegador
const db = await window.indexedDB.open('time_tracking_db', 1);
// Inspeccionar en DevTools → Application → IndexedDB
```

### Ver sync queue
```javascript
import { syncQueue } from './offline';
const pending = await syncQueue.getPending();
console.log('Pendientes:', pending);
```

### Logs de API
```javascript
// Backend: backend/src/services/api.js
// Todos los errores se loguean con detalles completos
```

---

## 📞 CONTACTO Y MANTENIMIENTO

**Última revisión:** 22 de marzo de 2026  
**Próxima revisión:** Cada vez que se modifique la estructura de datos o API

---

**FIN DEL MAPA COMPLETO**
