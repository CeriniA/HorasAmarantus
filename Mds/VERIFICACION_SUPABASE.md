# Verificación de Schema de Supabase

## 🎯 Objetivo

Verificar que los enums en Supabase coincidan **EXACTAMENTE** con las constantes definidas en:
- `backend/src/models/constants.js`
- `frontend/src/constants/index.js`

---

## 📋 Queries de Verificación

### 1. Verificar Enum de Roles de Usuario

```sql
-- Verificar valores del enum user_role
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'user_role'
)
ORDER BY enumsortorder;
```

**Resultado Esperado:**
```
enumlabel
-----------
superadmin
admin
operario
```

---

### 2. Verificar Enum de Tipos de Unidades Organizacionales

```sql
-- Verificar valores del enum org_unit_type
  SELECT enumlabel 
  FROM pg_enum 
  WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'org_unit_type'
  )
  ORDER BY enumsortorder;
```

**Resultado Esperado:**
```
enumlabel
-----------
area
proceso
subproceso
tarea
```

---

### 3. Verificar Enum de Estados de Time Entries

```sql
-- Verificar valores del enum time_entry_status
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'time_entry_status'
)
ORDER BY enumsortorder;
```

**Resultado Esperado:**
```
enumlabel
-----------
completed
```

*(Opcionalmente puede incluir: `in_progress`, `pending` si se implementa tracking en tiempo real)*

---

## 🔧 Queries de Corrección

### Si el enum `user_role` tiene 'supervisor' en lugar de 'superadmin':

```sql
-- SOLO SI ES NECESARIO: Renombrar 'supervisor' a 'superadmin'
ALTER TYPE user_role RENAME VALUE 'supervisor' TO 'superadmin';
```

### Si faltan valores en los enums:

```sql
-- Agregar valores faltantes a user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operario';

-- Agregar valores faltantes a org_unit_type
ALTER TYPE org_unit_type ADD VALUE IF NOT EXISTS 'area';
ALTER TYPE org_unit_type ADD VALUE IF NOT EXISTS 'proceso';
ALTER TYPE org_unit_type ADD VALUE IF NOT EXISTS 'subproceso';
ALTER TYPE org_unit_type ADD VALUE IF NOT EXISTS 'tarea';

-- Agregar valores faltantes a time_entry_status
ALTER TYPE time_entry_status ADD VALUE IF NOT EXISTS 'completed';
```

---

## 🔍 Verificación de Tablas

### Verificar estructura de tabla `users`:

```sql
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('role', 'organizational_unit_id')
ORDER BY ordinal_position;
```

**Resultado Esperado:**
```
column_name            | data_type      | udt_name  | is_nullable
-----------------------|----------------|-----------|-------------
role                   | USER-DEFINED   | user_role | NO
organizational_unit_id | uuid           | uuid      | YES
```

---

### Verificar estructura de tabla `organizational_units`:

```sql
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'organizational_units'
  AND column_name IN ('type', 'parent_id', 'level')
ORDER BY ordinal_position;
```

**Resultado Esperado:**
```
column_name | data_type    | udt_name       | is_nullable
------------|--------------|----------------|-------------
type        | USER-DEFINED | org_unit_type  | NO
parent_id   | uuid         | uuid           | YES
level       | integer      | int4           | NO
```

---

### Verificar estructura de tabla `time_entries`:

```sql
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
  AND column_name IN ('status', 'user_id', 'organizational_unit_id')
ORDER BY ordinal_position;
```

**Resultado Esperado:**
```
column_name            | data_type      | udt_name            | is_nullable
-----------------------|----------------|---------------------|-------------
status                 | USER-DEFINED   | time_entry_status   | NO
user_id                | uuid           | uuid                | NO
organizational_unit_id | uuid           | uuid                | NO
```

---

## ✅ Checklist de Verificación

- [ ] Enum `user_role` tiene exactamente: `superadmin`, `admin`, `operario`
- [ ] Enum `org_unit_type` tiene exactamente: `area`, `proceso`, `subproceso`, `tarea`
- [ ] Enum `time_entry_status` tiene al menos: `completed`
- [ ] Tabla `users` usa el enum `user_role` correctamente
- [ ] Tabla `organizational_units` usa el enum `org_unit_type` correctamente
- [ ] Tabla `time_entries` usa el enum `time_entry_status` correctamente
- [ ] No hay valores obsoletos en los enums (como 'supervisor')

---

## 🚨 Advertencias

1. **NO eliminar valores de enums** si hay datos existentes que los usan
2. **Hacer backup** antes de modificar enums
3. **Verificar datos existentes** antes de renombrar valores:

```sql
-- Verificar si hay usuarios con rol 'supervisor'
SELECT COUNT(*) FROM users WHERE role = 'supervisor';

-- Si hay usuarios, primero actualizar sus roles:
UPDATE users SET role = 'superadmin' WHERE role = 'supervisor';

-- Luego renombrar el enum
ALTER TYPE user_role RENAME VALUE 'supervisor' TO 'superadmin';
```

---

## 📊 Query de Resumen

```sql
-- Resumen completo de todos los enums
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value,
  e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role', 'org_unit_type', 'time_entry_status')
ORDER BY t.typname, e.enumsortorder;
```

---

**Fecha:** 18 de Marzo, 2026  
**Última actualización:** Refactorización de constantes completada
