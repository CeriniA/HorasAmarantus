# 🏗️ ARQUITECTURA OBLIGATORIA - Sistema de Horas

## ⚠️ REGLAS INQUEBRANTABLES

**Si rompes estas reglas, el código NO se acepta. PUNTO.**

---

## 📐 CAPAS DEL SISTEMA

### Backend (3 capas estrictas)

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

### Frontend (4 capas estrictas)

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

---

## 🚫 PROHIBICIONES ABSOLUTAS

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

## 📁 ESTRUCTURA OBLIGATORIA

### Backend
```
backend/src/
├── routes/           # Solo endpoints HTTP
│   ├── timeEntries.routes.js
│   └── users.routes.js
├── controllers/      # Orquestación
│   ├── timeEntries.controller.js
│   └── users.controller.js
├── services/         # Lógica de negocio
│   ├── timeEntries.service.js
│   └── users.service.js
├── middleware/       # Validaciones, auth
│   ├── auth.middleware.js
│   └── validation.middleware.js
├── utils/            # Helpers puros
│   ├── logger.js
│   └── dateHelpers.js
└── config/           # Configuración
    └── database.js
```

### Frontend
```
frontend/src/
├── pages/            # Páginas (layout)
│   ├── TimeEntries.jsx
│   └── Dashboard.jsx
├── components/       # UI reutilizable
│   ├── common/
│   ├── timeEntry/
│   └── dashboard/
├── hooks/            # Lógica de estado
│   ├── useTimeEntries.js
│   └── useAuth.js
├── services/         # API calls
│   ├── api.js
│   └── timeEntriesService.js
├── utils/            # Helpers puros
│   ├── logger.js
│   └── dateHelpers.js
├── context/          # Estado global
│   └── AuthContext.jsx
└── offline/          # PWA/Offline
    ├── sync/
    └── repositories/
```

---

## 🔍 VALIDACIÓN AUTOMÁTICA

### Checklist Obligatorio ANTES de commit:

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

# 3. ¿Está documentado?
□ JSDoc en funciones públicas
□ Comentarios en lógica compleja
□ README actualizado si es necesario

# 4. ¿Funciona offline?
□ Operaciones CRUD funcionan offline
□ Sincronización no duplica
□ IndexedDB solo tiene pendientes
```

---

## 🎯 EJEMPLO CORRECTO

### Backend: Crear Time Entry

#### ❌ MAL (Todo en route)
```javascript
// routes/timeEntries.routes.js
router.post('/', async (req, res) => {
  const { start_time, end_time } = req.body;
  const hours = (new Date(end_time) - new Date(start_time)) / 3600000;
  const { data, error } = await supabase
    .from('time_entries')
    .insert({ ...req.body, total_hours: hours });
  if (error) return res.status(500).json({ error });
  res.json(data);
});
```

#### ✅ BIEN (Capas separadas)
```javascript
// routes/timeEntries.routes.js
router.post('/', 
  authMiddleware,
  validateTimeEntry,
  timeEntriesController.create
);

// controllers/timeEntries.controller.js
const create = async (req, res) => {
  try {
    const entry = await timeEntriesService.createEntry(req.body, req.user.id);
    res.status(201).json({ timeEntry: entry });
  } catch (error) {
    logger.error('Error creating entry:', error);
    res.status(500).json({ error: error.message });
  }
};

// services/timeEntries.service.js
const createEntry = async (data, userId) => {
  // Validar
  if (!data.start_time || !data.end_time) {
    throw new Error('start_time y end_time son requeridos');
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
  return entry;
};
```

### Frontend: Mostrar Time Entries

#### ❌ MAL (Todo en componente)
```javascript
// TimeEntries.jsx
const TimeEntries = () => {
  const [entries, setEntries] = useState([]);
  
  useEffect(() => {
    fetch('/api/time-entries')
      .then(res => res.json())
      .then(data => setEntries(data));
  }, []);
  
  return <div>{entries.map(e => <div>{e.description}</div>)}</div>;
};
```

#### ✅ BIEN (Capas separadas)
```javascript
// pages/TimeEntries.jsx
const TimeEntries = () => {
  const { timeEntries, loading, error } = useTimeEntries(user?.id);
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  
  return <TimeEntriesList entries={timeEntries} />;
};

// hooks/useTimeEntries.js
const useTimeEntries = (userId) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadEntries();
  }, [userId]);
  
  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await timeEntriesService.getAll();
      setTimeEntries(data);
    } catch (err) {
      logger.error('Error loading entries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { timeEntries, loading, error };
};

// services/timeEntriesService.js
const getAll = async () => {
  const response = await api.get('/time-entries');
  return response.timeEntries;
};
```

---

## 🤝 COMPROMISO MUTUO

### Tu compromiso:
1. ✅ Seguir SIEMPRE esta arquitectura
2. ✅ No hacer cambios reactivos sin pensar
3. ✅ Validar con el checklist antes de decir "listo"
4. ✅ Documentar decisiones importantes

### Mi compromiso:
1. ✅ Revisar que se cumplan las reglas
2. ✅ Señalar cuando no se respeta la arquitectura
3. ✅ Pedir refactor si algo está mal
4. ✅ No aceptar código que rompa las reglas

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Auditar backend** - Verificar que sigue Route → Controller → Service
2. **Auditar frontend** - Verificar que sigue Component → Hook → Service
3. **Refactorizar** lo que no cumpla
4. **Documentar** patrones encontrados
5. **Crear tests** que validen la arquitectura

---

**Fecha:** 2026-03-29  
**Versión:** 1.0  
**Estado:** OBLIGATORIO - NO NEGOCIABLE
