# 🏗️ Arquitectura Offline Mejorada

## 📊 Estructura Actual vs Nueva

### ❌ Estructura Actual (Problemática)

```
frontend/src/
├── db/
│   └── indexedDB.js          # 300+ líneas, muchas responsabilidades
├── services/
│   ├── api.js                # Mezcla online/offline
│   └── syncService.js        # Lógica de sync mezclada
└── hooks/
    ├── useTimeEntries.js     # Lógica offline repetida
    ├── useOrganizationalUnits.js
    └── useAuth.js
```

**Problemas**:
- ❌ `indexedDB.js` tiene demasiadas responsabilidades
- ❌ Lógica offline duplicada en hooks
- ❌ No hay separación clara de capas
- ❌ Difícil de testear
- ❌ Difícil de mantener

---

### ✅ Nueva Estructura (Mejorada)

```
frontend/src/
├── offline/                   # 🆕 Módulo offline centralizado
│   ├── core/                  # Capa de datos
│   │   ├── db.js             # Configuración de Dexie
│   │   └── migrations.js     # Migraciones
│   │
│   ├── repositories/          # Patrón Repository
│   │   ├── BaseRepository.js
│   │   ├── TimeEntryRepository.js
│   │   ├── OrgUnitRepository.js
│   │   └── UserRepository.js
│   │
│   ├── sync/                  # Sincronización
│   │   ├── SyncManager.js    # Orquestador principal
│   │   ├── SyncQueue.js      # Gestión de cola
│   │   └── strategies/       # Estrategias de sync
│   │       ├── TimeEntrySync.js
│   │       └── OrgUnitSync.js
│   │
│   └── utils/                 # Utilidades offline
│       ├── networkDetector.js
│       ├── conflictResolver.js
│       └── storageManager.js
│
├── services/
│   └── api.js                # Solo comunicación HTTP
│
└── hooks/
    ├── useTimeEntries.js     # Usa repositories
    └── useOfflineSync.js     # Hook de sincronización
```

---

## 🎯 Principios de la Nueva Arquitectura

### 1. **Separación de Responsabilidades (SRP)**

```javascript
// ❌ ANTES - Todo en un archivo
export const saveTimeEntry = async (entry) => {
  // Validación
  // Generación de UUID
  // Guardar en DB
  // Agregar a cola
  // Logging
};

// ✅ AHORA - Responsabilidades separadas
class TimeEntryRepository {
  async save(entry) {
    const validated = this.validate(entry);
    const withId = this.ensureId(validated);
    return await this.db.save(withId);
  }
}

class SyncQueue {
  async add(entity, action) {
    return await this.db.queue.add({...});
  }
}
```

---

### 2. **Patrón Repository**

```javascript
// Abstrae el acceso a datos
class BaseRepository {
  constructor(tableName) {
    this.table = db[tableName];
  }

  async findAll() {
    return await this.table.toArray();
  }

  async findById(id) {
    return await this.table.get(id);
  }

  async save(entity) {
    return await this.table.put(entity);
  }

  async delete(id) {
    return await this.table.delete(id);
  }
}

// Especialización
class TimeEntryRepository extends BaseRepository {
  constructor() {
    super('time_entries');
  }

  async findPending() {
    const all = await this.findAll();
    return all.filter(e => e.pending_sync === true);
  }

  async findByUser(userId) {
    return await this.table
      .where('user_id')
      .equals(userId)
      .toArray();
  }
}
```

---

### 3. **Strategy Pattern para Sincronización**

```javascript
// Estrategia base
class SyncStrategy {
  async sync(item) {
    throw new Error('Must implement sync()');
  }
}

// Estrategia específica
class TimeEntrySyncStrategy extends SyncStrategy {
  constructor(apiService) {
    super();
    this.api = apiService;
  }

  async sync(item) {
    switch (item.action) {
      case 'create':
        return await this.create(item.data);
      case 'update':
        return await this.update(item.data);
      case 'delete':
        return await this.delete(item.data);
    }
  }

  async create(data) {
    const result = await this.api.post('/time-entries', data);
    return result;
  }
}
```

---

### 4. **Dependency Injection**

```javascript
// ❌ ANTES - Dependencias hardcodeadas
import { db } from '../db/indexedDB';
import { api } from '../services/api';

export const syncTimeEntry = async (entry) => {
  const result = await api.post('/time-entries', entry);
  await db.time_entries.put(result);
};

// ✅ AHORA - Inyección de dependencias
class SyncManager {
  constructor(repository, syncStrategy) {
    this.repository = repository;
    this.syncStrategy = syncStrategy;
  }

  async sync(item) {
    const result = await this.syncStrategy.sync(item);
    await this.repository.save(result);
    return result;
  }
}

// Uso
const timeEntryRepo = new TimeEntryRepository();
const timeEntrySync = new TimeEntrySyncStrategy(apiService);
const syncManager = new SyncManager(timeEntryRepo, timeEntrySync);
```

---

## 📁 Estructura Detallada

### `/offline/core/db.js`
```javascript
// Solo configuración de Dexie
import Dexie from 'dexie';

export const db = new Dexie('SistemaHorasDB');

db.version(1).stores({
  users: 'id, email, role',
  organizational_units: 'id, parent_id, type',
  time_entries: 'id, client_id, user_id, pending_sync',
  sync_queue: '++id, entity_type, entity_id, action'
});
```

### `/offline/repositories/BaseRepository.js`
```javascript
// CRUD genérico
export class BaseRepository {
  constructor(tableName) {
    this.table = db[tableName];
  }

  async findAll() { /* ... */ }
  async findById(id) { /* ... */ }
  async save(entity) { /* ... */ }
  async delete(id) { /* ... */ }
  async count() { /* ... */ }
}
```

### `/offline/repositories/TimeEntryRepository.js`
```javascript
// Operaciones específicas de time entries
export class TimeEntryRepository extends BaseRepository {
  constructor() {
    super('time_entries');
  }

  async findPending() { /* ... */ }
  async findByUser(userId) { /* ... */ }
  async findByDateRange(start, end) { /* ... */ }
  async markAsSynced(id) { /* ... */ }
}
```

### `/offline/sync/SyncManager.js`
```javascript
// Orquestador principal de sincronización
export class SyncManager {
  constructor() {
    this.queue = new SyncQueue();
    this.strategies = new Map();
    this.isRunning = false;
  }

  registerStrategy(entityType, strategy) {
    this.strategies.set(entityType, strategy);
  }

  async sync() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const items = await this.queue.getAll();
    
    for (const item of items) {
      await this.syncItem(item);
    }
    
    this.isRunning = false;
  }

  async syncItem(item) {
    const strategy = this.strategies.get(item.entity_type);
    return await strategy.sync(item);
  }
}
```

### `/offline/sync/SyncQueue.js`
```javascript
// Gestión de cola de sincronización
export class SyncQueue {
  constructor() {
    this.table = db.sync_queue;
  }

  async add(entityType, entityId, action, data) { /* ... */ }
  async remove(id) { /* ... */ }
  async getAll() { /* ... */ }
  async clear() { /* ... */ }
}
```

---

## 🎯 Beneficios

### 1. **Testeable**
```javascript
// Fácil de mockear
const mockRepo = {
  save: jest.fn(),
  findById: jest.fn()
};

const syncManager = new SyncManager(mockRepo, mockStrategy);
```

### 2. **Mantenible**
- Cada clase tiene una responsabilidad
- Fácil encontrar dónde está cada lógica
- Cambios localizados

### 3. **Extensible**
```javascript
// Agregar nueva entidad es simple
class ProjectRepository extends BaseRepository {
  constructor() {
    super('projects');
  }
}

class ProjectSyncStrategy extends SyncStrategy {
  async sync(item) { /* ... */ }
}

// Registrar
syncManager.registerStrategy('projects', new ProjectSyncStrategy());
```

### 4. **Reutilizable**
```javascript
// Repositorios se pueden usar en cualquier hook
const timeEntryRepo = new TimeEntryRepository();

// En useTimeEntries
const entries = await timeEntryRepo.findByUser(userId);

// En useOfflineSync
const pending = await timeEntryRepo.findPending();
```

---

## 🔄 Migración Gradual

### Fase 1: Crear nueva estructura (sin romper nada)
```
✅ Crear /offline/core/db.js
✅ Crear /offline/repositories/
✅ Crear /offline/sync/
```

### Fase 2: Migrar funcionalidad
```
✅ Mover funciones de indexedDB.js a repositories
✅ Refactorizar syncService.js a SyncManager
✅ Actualizar imports en hooks
```

### Fase 3: Limpiar código viejo
```
✅ Eliminar indexedDB.js
✅ Eliminar syncService.js
✅ Actualizar documentación
```

---

## 📊 Comparación de Código

### Antes
```javascript
// useTimeEntries.js - 200 líneas
const createEntry = async (data) => {
  if (!navigator.onLine) {
    const localEntry = {
      id: generateUUID(),
      client_id: generateUUID(),
      ...data,
      pending_sync: true
    };
    await db.time_entries.put(localEntry);
    await db.sync_queue.add({...});
    return localEntry;
  } else {
    const result = await api.post('/time-entries', data);
    await db.time_entries.put({...result, pending_sync: false});
    return result;
  }
};
```

### Después
```javascript
// useTimeEntries.js - 50 líneas
const createEntry = async (data) => {
  if (!navigator.onLine) {
    return await offlineService.createTimeEntry(data);
  } else {
    return await onlineService.createTimeEntry(data);
  }
};

// offlineService.js
class OfflineService {
  constructor(repository, queue) {
    this.repository = repository;
    this.queue = queue;
  }

  async createTimeEntry(data) {
    const entry = this.prepareEntry(data);
    await this.repository.save(entry);
    await this.queue.add('time_entries', entry.id, 'create', entry);
    return entry;
  }
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear estructura de carpetas `/offline`
- [ ] Implementar `BaseRepository`
- [ ] Implementar repositorios específicos
- [ ] Crear `SyncManager` y `SyncQueue`
- [ ] Implementar estrategias de sincronización
- [ ] Refactorizar hooks
- [ ] Actualizar tests
- [ ] Actualizar documentación

---

**¿Procedemos con la implementación?** 🚀
