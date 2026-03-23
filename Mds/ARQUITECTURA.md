# Arquitectura del Sistema - Horas Hortícola

## 📐 Stack Tecnológico

### Backend
- **Node.js + Express** - API REST
- **Supabase (PostgreSQL)** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Hashing de passwords
- **Helmet** - Seguridad HTTP
- **Express Rate Limit** - Protección contra abuso

### Frontend
- **React 18** - UI Framework
- **React Router** - Navegación
- **Dexie.js** - IndexedDB (offline)
- **TailwindCSS** - Estilos
- **Lucide React** - Iconos
- **Recharts** - Gráficos
- **date-fns** - Manejo de fechas

---

## 🔄 Arquitectura Offline-First

### Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         React Frontend              │
│  ┌──────────────────────────────┐  │
│  │   useTimeEntries Hook        │  │
│  └────────┬─────────────────────┘  │
│           │                         │
│           ▼                         │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Online?    │  │  IndexedDB  │ │
│  └──────┬───────┘  │  (Dexie)    │ │
│         │          └─────────────┘ │
│    ┌────┴────┐                     │
│    │         │                     │
│   YES       NO                     │
│    │         │                     │
│    ▼         ▼                     │
│  ┌────┐  ┌──────────────┐         │
│  │API │  │ Local Save + │         │
│  │    │  │ Sync Queue   │         │
│  └────┘  └──────────────┘         │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Backend API (Express)          │
│  ┌──────────────────────────────┐  │
│  │  Auth Middleware (JWT)       │  │
│  │  Role-based Filtering        │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Supabase (PostgreSQL)          │
│  - users                            │
│  - time_entries                     │
│  - organizational_units             │
│  - sync_metadata                    │
└─────────────────────────────────────┘
```

### Sincronización

**Cuando está ONLINE:**
1. Usuario crea/edita registro
2. Se envía directamente al backend
3. Backend guarda en PostgreSQL
4. Respuesta se guarda en IndexedDB como cache

**Cuando está OFFLINE:**
1. Usuario crea/edita registro
2. Se guarda en IndexedDB con `pending_sync: true`
3. Se agrega a `sync_queue`
4. Al reconectar, `SyncManager` procesa la cola
5. Datos se sincronizan con el backend

---

## 🗄️ Estructura de Datos

### TimeEntry (Consistente entre Frontend y Backend)

```javascript
{
  id: "uuid",                    // Generado por PostgreSQL
  client_id: "uuid",             // Generado por cliente (para offline)
  user_id: "uuid",               // FK a users
  organizational_unit_id: "uuid", // FK a organizational_units
  description: "string | null",
  start_time: "ISO8601",
  end_time: "ISO8601",
  total_hours: number,           // Calculado por trigger en BD
  status: "completed",
  pending_sync: boolean,         // Solo en IndexedDB
  synced_at: "ISO8601 | null",   // Solo en IndexedDB
  created_at: "ISO8601",
  updated_at: "ISO8601"
}
```

**Notas importantes:**
- `id` es generado por PostgreSQL al crear
- `client_id` se usa para tracking offline
- `total_hours` se calcula automáticamente en BD (trigger)
- En offline, `total_hours` se calcula localmente como fallback

---

## 🔐 Seguridad

### Autenticación
```
Usuario → Login (username + password)
         ↓
      Backend verifica
         ↓
      Genera JWT (firmado con secret)
         ↓
      Frontend guarda token
         ↓
      Cada request incluye: Authorization: Bearer <token>
```

### Autorización (Filtrado en Backend)

**Operario:**
```sql
SELECT * FROM time_entries WHERE user_id = <current_user_id>
```

**Admin/Superadmin:**
```sql
SELECT * FROM time_entries  -- Sin filtro
```

### Capas de Protección

1. **JWT firmado** - No modificable por cliente
2. **Filtrado en BD** - Operarios solo reciben sus datos
3. **Validación de inputs** - Express-validator
4. **Helmet + CSP** - Headers de seguridad
5. **Rate Limiting** - 100 req/15min en producción
6. **Stack traces ocultos** - En producción
7. **CORS dinámico** - Múltiples orígenes permitidos

---

## 📊 Roles y Permisos

| Acción | Operario | Admin | Superadmin |
|--------|----------|-------|------------|
| Ver propios registros | ✅ | ✅ | ✅ |
| Ver todos los registros | ❌ | ✅ | ✅ |
| Crear registros propios | ✅ | ✅ | ✅ |
| Crear registros de otros | ❌ | ✅ | ✅ |
| Editar propios registros | ✅ | ✅ | ✅ |
| Editar registros de otros | ❌ | ✅ | ✅ |
| Ver reportes propios | ✅ | ✅ | ✅ |
| Ver reportes de todos | ❌ | ✅ | ✅ |
| Gestionar estructura | ❌ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ✅ | ✅ |

---

## 🔄 Sincronización Offline

### Estados de un Registro

```
┌──────────────┐
│   CREADO     │ (pending_sync: true, id: local-uuid)
│   OFFLINE    │
└──────┬───────┘
       │ Reconexión
       ▼
┌──────────────┐
│ SINCRONIZANDO│ (en sync_queue)
└──────┬───────┘
       │ POST /api/time-entries
       ▼
┌──────────────┐
│ SINCRONIZADO │ (pending_sync: false, id: server-uuid)
│              │ (registro local eliminado, nuevo con id del servidor)
└──────────────┘
```

### Manejo de Conflictos

**Estrategia:** Last-Write-Wins
- El servidor siempre tiene la verdad
- Al sincronizar, se reemplaza el registro local con el del servidor
- No hay merge de cambios concurrentes

---

## 📁 Estructura del Proyecto

```
app-web/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js           # Variables de entorno centralizadas
│   │   │   ├── database.js      # Supabase client
│   │   │   └── auth.js          # JWT config
│   │   ├── middleware/
│   │   │   ├── auth.js          # Verificar JWT
│   │   │   ├── roles.js         # Verificar permisos
│   │   │   ├── validators.js    # Express-validator
│   │   │   └── errorHandler.js  # Manejo de errores
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── timeEntries.js
│   │   │   ├── users.js
│   │   │   └── organizationalUnits.js
│   │   ├── models/
│   │   │   └── types.js         # TypeDefs JSDoc
│   │   └── app.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Componentes reutilizables
│   │   │   └── layout/          # Layout components
│   │   ├── pages/               # Páginas principales
│   │   ├── hooks/               # Custom hooks
│   │   ├── context/             # React Context
│   │   ├── services/            # API services
│   │   ├── offline/
│   │   │   ├── core/
│   │   │   │   ├── db.js        # Dexie schema
│   │   │   │   └── migrations.js
│   │   │   ├── repositories/    # Data access layer
│   │   │   ├── sync/
│   │   │   │   ├── SyncManager.js
│   │   │   │   ├── SyncQueue.js
│   │   │   │   └── strategies/  # Sync strategies por entidad
│   │   │   └── utils/
│   │   └── utils/
│   └── package.json
│
└── supabase/
    └── schema-simple.sql        # Schema de BD
```

---

## 🚀 Deploy

### Backend (Render.com)
1. Conectar repo de GitHub
2. Configurar variables de entorno
3. Deploy automático en push a main

### Frontend (Render.com)
1. Build: `npm run build`
2. Servir carpeta `dist/`
3. HTTPS automático

### Variables de Entorno Críticas

**Backend:**
```bash
NODE_ENV=production
JWT_SECRET=<128-bit-secret>
SUPABASE_URL=<url>
SUPABASE_SERVICE_ROLE_KEY=<key>
ALLOWED_ORIGINS=https://app1.com,https://app2.com
ENABLE_RATE_LIMIT=true
```

**Frontend:**
```bash
VITE_API_URL=https://api.tudominio.com
```

---

## 📝 Notas de Implementación

### Login
- Solo por **username** (no email)
- Email es campo informativo opcional
- JWT expira en 7 días

### CORS
- En desarrollo: localhost permitido
- En producción: múltiples orígenes via `ALLOWED_ORIGINS`
- Separar con comas: `https://app1.com,https://app2.com`

### Rate Limiting
- Desarrollo: 1000 req/15min
- Producción: 100 req/15min
- Excluye health checks

### Offline
- Datos se guardan en IndexedDB
- Sincronización automática al reconectar
- Retry automático en caso de fallo (máx 5 intentos)

---

**Última actualización:** 2026-03-10
