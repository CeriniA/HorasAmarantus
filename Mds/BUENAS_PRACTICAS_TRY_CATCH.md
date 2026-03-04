# 🎯 Buenas Prácticas: Try-Catch

## ❌ Cuándo NO usar try-catch

### 1. Backend - Rutas (usar `asyncHandler`)

```javascript
// ❌ MALO - Try-catch repetitivo
router.get('/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ BUENO - asyncHandler centralizado
import { asyncHandler } from '../middleware/errorHandler.js';

router.get('/users', asyncHandler(async (req, res) => {
  const users = await getUsers();
  res.json(users);
}));
```

**Por qué**: El middleware `errorHandler` maneja todos los errores automáticamente.

---

### 2. Funciones simples de DB

```javascript
// ❌ MALO - Try-catch innecesario
export const getUsers = async () => {
  try {
    return await db.users.toArray();
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// ✅ BUENO - Dejar que el error se propague
export const getUsers = async () => {
  return await db.users.toArray();
};
```

**Por qué**: El caller puede manejar el error según su contexto.

---

### 3. Logging sin recuperación

```javascript
// ❌ MALO - Solo logea y re-lanza
export const saveData = async (data) => {
  try {
    return await db.save(data);
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-lanza sin hacer nada útil
  }
};

// ✅ BUENO - Sin try-catch
export const saveData = async (data) => {
  return await db.save(data);
};
```

**Por qué**: Si solo vas a re-lanzar, no tiene sentido el try-catch.

---

## ✅ Cuándo SÍ usar try-catch

### 1. Recuperación de errores

```javascript
// ✅ CORRECTO - Continúa aunque falle
for (const item of items) {
  try {
    await processItem(item);
  } catch (error) {
    console.error(`Item ${item.id} failed:`, error);
    // Continúa con el siguiente
  }
}
```

**Por qué**: Queremos procesar todos los items, no detener en el primero que falle.

---

### 2. Fallback a valor por defecto

```javascript
// ✅ CORRECTO - Retorna valor por defecto
export const getConfig = async () => {
  try {
    return await db.config.get('settings');
  } catch (error) {
    console.error('Error loading config:', error);
    return DEFAULT_CONFIG; // Fallback
  }
};
```

**Por qué**: La app puede funcionar con configuración por defecto.

---

### 3. Operaciones críticas con logging detallado

```javascript
// ✅ CORRECTO - Logging detallado antes de fallar
export const saveTimeEntry = async (entry) => {
  try {
    if (!entry.id) entry.id = generateUUID();
    await db.time_entries.put(entry);
    return entry;
  } catch (error) {
    console.error('Error saving time entry:', {
      entry,
      error: error.message,
      stack: error.stack
    });
    throw error; // Re-lanza con contexto
  }
};
```

**Por qué**: El logging detallado ayuda a debuggear problemas de datos.

---

### 4. Transformación de errores

```javascript
// ✅ CORRECTO - Convierte error técnico en error de negocio
export const createUser = async (data) => {
  try {
    return await db.users.add(data);
  } catch (error) {
    if (error.code === 'ConstraintError') {
      throw new ConflictError('El email ya existe');
    }
    throw error;
  }
};
```

**Por qué**: Convierte errores de DB en errores comprensibles para el usuario.

---

### 5. Cleanup de recursos

```javascript
// ✅ CORRECTO - Asegura cleanup
export const processFile = async (file) => {
  const handle = await openFile(file);
  try {
    return await processData(handle);
  } finally {
    await closeFile(handle); // Siempre se ejecuta
  }
};
```

**Por qué**: Garantiza que los recursos se liberen.

---

## 🎯 Patrón Recomendado

### Backend

```javascript
// Rutas: asyncHandler
router.post('/users', asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json({ user });
}));

// Servicios: Lanzar errores tipados
export const createUser = async (data) => {
  const exists = await db.users.findOne({ email: data.email });
  if (exists) {
    throw new ConflictError('Email already exists');
  }
  return await db.users.create(data);
};

// Middleware: Captura todo
app.use(errorHandler);
```

---

### Frontend

```javascript
// Hooks: Try-catch en el nivel más alto
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return { users, error, loadUsers };
};

// Servicios: Sin try-catch
export const getUsers = async () => {
  return await api.get('/users');
};

// DB: Solo donde sea necesario
export const saveLocally = async (data) => {
  try {
    if (!data.id) data.id = generateUUID();
    await db.items.put(data);
    return data;
  } catch (error) {
    console.error('Save failed:', { data, error });
    throw error;
  }
};
```

---

## 📊 Resumen

| Situación | Try-Catch | Razón |
|-----------|-----------|-------|
| Rutas backend | ❌ No | Usa `asyncHandler` |
| Funciones simples | ❌ No | Deja que se propague |
| Solo logging | ❌ No | No agrega valor |
| Recuperación | ✅ Sí | Continúa operación |
| Fallback | ✅ Sí | Valor por defecto |
| Logging detallado | ✅ Sí | Debug crítico |
| Transformar error | ✅ Sí | Error de negocio |
| Cleanup | ✅ Sí | Liberar recursos |

---

## 🎯 Regla de Oro

**Solo usa try-catch si vas a hacer algo útil con el error:**
- ✅ Recuperarte del error
- ✅ Proporcionar un fallback
- ✅ Agregar contexto importante
- ✅ Transformar el error
- ✅ Limpiar recursos

**NO uses try-catch si solo vas a:**
- ❌ Loggear y re-lanzar
- ❌ Retornar `null` o `[]` sin razón
- ❌ Ocultar errores importantes

---

## 📚 Ejemplos del Proyecto

### ✅ Bien Hecho

```javascript
// syncService.js - Recuperación
updateSyncQueueItem(item.id, updates).catch(error => {
  console.error('Error updating retry count:', error);
  // No detiene la sincronización
});

// indexedDB.js - Logging detallado
export const saveTimeEntryLocally = async (entry) => {
  try {
    if (!entry.id) entry.id = generateUUID();
    await db.time_entries.put(entry);
    return entry;
  } catch (error) {
    console.error('Error saving:', { entry, error });
    throw error;
  }
};
```

### ❌ Mal Hecho (corregido)

```javascript
// ANTES - Try-catch innecesario
export const getUsers = async () => {
  try {
    return await db.users.toArray();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// DESPUÉS - Limpio
export const getUsers = async () => {
  return await db.users.toArray();
};
```

---

**Menos try-catch = Código más limpio y mantenible** ✨
