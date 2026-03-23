# 📋 Estructura de Datos - API Backend

## ⚠️ IMPORTANTE: SIEMPRE CONSULTAR ESTE ARCHIVO ANTES DE HACER CAMBIOS

---

## 🕐 Time Entries (Registros de Tiempo)

### Estructura en Base de Datos (Supabase)

```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID,
  user_id UUID REFERENCES users(id),
  organizational_unit_id UUID REFERENCES organizational_units(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Formato de Envío al Backend (POST /api/time-entries)

```javascript
{
  organizational_unit_id: "uuid-string",  // ← DEBE SER UUID STRING
  start_time: "2026-03-22T08:00:00",      // ← ISO 8601 format
  end_time: "2026-03-22T10:30:00",        // ← ISO 8601 format
  description: "Texto opcional" | null    // ← Puede ser null
}
```

### ✅ Ejemplo Correcto

```javascript
const entryData = {
  organizational_unit_id: selectedTask.id,  // Ya es UUID
  start_time: "2026-03-22T08:00:00",
  end_time: "2026-03-22T10:30:00",
  description: null
};
```

### ❌ Errores Comunes

```javascript
// ❌ MAL - organizational_unit_id como número
{
  organizational_unit_id: 123,  // INCORRECTO
  ...
}

// ❌ MAL - Formato de fecha incorrecto
{
  start_time: "2026-03-22 08:00:00",  // INCORRECTO (falta T)
  ...
}

// ❌ MAL - description como string vacío
{
  description: ""  // Usar null en su lugar
}
```

---

## 🏢 Organizational Units (Unidades Organizacionales)

### Estructura en Base de Datos

```sql
CREATE TABLE organizational_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,  -- 'area', 'proceso', 'subproceso', 'tarea'
  parent_id UUID REFERENCES organizational_units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Objeto en Frontend

```javascript
{
  id: "uuid-string",           // ← UUID
  name: "Nombre de la unidad",
  type: "area" | "proceso" | "subproceso" | "tarea",
  parent_id: "uuid-string" | null
}
```

---

## 👤 Users (Usuarios)

### Estructura en Base de Datos

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) NOT NULL,  -- 'superadmin', 'admin', 'operario'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔑 Validaciones del Backend

### Time Entries (src/middleware/validators.js)

```javascript
validateCreateTimeEntry = [
  body('organizational_unit_id')
    .isUUID()  // ← DEBE SER UUID
    .withMessage('ID de unidad organizacional inválido'),
  
  body('start_time')
    .isISO8601()  // ← DEBE SER ISO 8601
    .withMessage('Fecha de inicio inválida'),
  
  body('end_time')
    .isISO8601()  // ← DEBE SER ISO 8601
    .withMessage('Fecha de fin inválida'),
  
  body('description')
    .optional({ nullable: true })  // ← PUEDE SER NULL
    .isString()
];
```

---

## 📝 Cómo Construir un Time Entry Correctamente

### Paso 1: Obtener la Unidad Organizacional

```javascript
const selectedTask = {
  id: "a1b2c3d4-...",  // ← Este es el UUID
  name: "Cosecha",
  type: "proceso"
};
```

### Paso 2: Construir las Fechas

```javascript
const date = "2026-03-22";  // Formato YYYY-MM-DD
const hours = 2.5;  // Horas trabajadas

// Hora de inicio (ej: 8:00 AM)
const startDateTime = `${date}T08:00:00`;

// Hora de fin (8:00 + 2.5 horas = 10:30)
const endHours = 8 + hours;  // 10.5
const endDateTime = `${date}T${String(Math.floor(endHours)).padStart(2, '0')}:${String(Math.round((endHours % 1) * 60)).padStart(2, '0')}:00`;
// Resultado: "2026-03-22T10:30:00"
```

### Paso 3: Construir el Objeto

```javascript
const entryData = {
  organizational_unit_id: selectedTask.id,  // UUID directo
  start_time: startDateTime,
  end_time: endDateTime,
  description: null  // o un string
};
```

### Paso 4: Enviar al Backend

```javascript
await api.post('/time-entries', entryData);
```

---

## 🎯 Componentes que Funcionan Correctamente

### QuickTimeEntry.jsx (REFERENCIA)

```javascript
const handleSave = async () => {
  const startDateTime = `${date}T08:00:00`;
  const endHours = 8 + selectedTime;
  const endDateTime = `${date}T${String(Math.floor(endHours)).padStart(2, '0')}:${String(Math.round((endHours % 1) * 60)).padStart(2, '0')}:00`;

  const entryData = {
    organizational_unit_id: selectedTask.id,  // ← CLAVE: USA EL ID DIRECTO
    start_time: startDateTime,
    end_time: endDateTime,
    description: description || null
  };

  await onSave(entryData);
};
```

---

## ⚠️ REGLAS DE ORO

1. **NUNCA** convertir `organizational_unit_id` a número con `parseInt()`
2. **SIEMPRE** usar el formato `YYYY-MM-DDTHH:MM:SS` para fechas
3. **SIEMPRE** usar `null` en lugar de `""` para description vacío
4. **SIEMPRE** verificar que el `id` de la unidad sea un UUID string
5. **ANTES** de hacer cambios, comparar con `QuickTimeEntry.jsx` que funciona

---

## 📚 Referencias

- **Validadores Backend**: `backend/src/middleware/validators.js`
- **Rutas Backend**: `backend/src/routes/timeEntries.js`
- **Componente Referencia**: `frontend/src/components/timeEntry/QuickTimeEntry.jsx`
- **Hook de Datos**: `frontend/src/hooks/useTimeEntries.js`

---

**Última actualización**: 2026-03-22
**Autor**: Sistema de Documentación Automática
