# 🏢 CRUD de Organizational Units

## 📋 Opción 1: Ejecutar Seeds (Recomendado)

### Paso 1: Ejecutar Schema
```sql
-- En Supabase SQL Editor
-- Ejecuta: supabase/schema-simple.sql
```

### Paso 2: Crear Admin
```sql
-- En Supabase SQL Editor
-- Ejecuta: supabase/create-admin.sql
```

### Paso 3: Ejecutar Seeds
```sql
-- En Supabase SQL Editor
-- Ejecuta: supabase/seed-simple.sql
```

✅ **Listo!** Tendrás:
- 19 unidades organizacionales
- 6 usuarios (1 admin, 2 supervisores, 3 operarios)
- 11 registros de horas de ejemplo

---

## 📋 Opción 2: CRUD Manual desde el Frontend

### 1️⃣ Crear Unidad Organizacional

#### Desde el navegador (después de hacer login como admin):

**URL**: `http://localhost:5173` → Login → Ir a sección de Unidades Organizacionales

O usando la API directamente:

```bash
# Login primero para obtener el token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@horticola.com",
    "password": "ContraseñaSegura123!"
  }'

# Copia el token de la respuesta

# Crear unidad organizacional
curl -X POST http://localhost:3001/api/organizational-units \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Producción",
    "type": "area",
    "parent_id": null
  }'
```

### 2️⃣ Listar Unidades Organizacionales

```bash
curl -X GET http://localhost:3001/api/organizational-units \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 3️⃣ Actualizar Unidad Organizacional

```bash
curl -X PUT http://localhost:3001/api/organizational-units/ID_DE_LA_UNIDAD \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Producción Actualizada",
    "type": "area"
  }'
```

### 4️⃣ Eliminar Unidad Organizacional

```bash
curl -X DELETE http://localhost:3001/api/organizational-units/ID_DE_LA_UNIDAD \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 📋 Opción 3: CRUD Directo en Supabase

### Crear Unidad Organizacional

```sql
INSERT INTO organizational_units (name, type, parent_id, is_active)
VALUES ('Producción', 'area', NULL, true);
```

### Listar Unidades

```sql
SELECT * FROM organizational_units WHERE is_active = true ORDER BY name;
```

### Actualizar Unidad

```sql
UPDATE organizational_units
SET name = 'Producción Actualizada'
WHERE id = 'ID_AQUI';
```

### Eliminar Unidad (soft delete)

```sql
UPDATE organizational_units
SET is_active = false
WHERE id = 'ID_AQUI';
```

---

## 🎯 Estructura Jerárquica Recomendada

```
📁 Producción (area)
  ├─ 📂 Siembra (proceso)
  │   ├─ 📄 Preparación de Suelo (subproceso)
  │   │   ├─ ✓ Arado (tarea)
  │   │   ├─ ✓ Rastrillado (tarea)
  │   │   └─ ✓ Fertilización (tarea)
  │   ├─ 📄 Siembra Directa (subproceso)
  │   └─ 📄 Transplante (subproceso)
  ├─ 📂 Riego (proceso)
  ├─ 📂 Cosecha (proceso)
  └─ 📂 Control de Plagas (proceso)

📁 Empaque (area)
  ├─ 📂 Selección (proceso)
  ├─ 📂 Lavado (proceso)
  └─ 📂 Empaquetado (proceso)

📁 Mantenimiento (area)
  ├─ 📂 Mantenimiento de Campo (proceso)
  └─ 📂 Mantenimiento de Equipos (proceso)
```

---

## 🔑 Tipos de Unidades Organizacionales

- **area**: Área principal (ej: Producción, Empaque)
- **proceso**: Proceso dentro de un área (ej: Siembra, Cosecha)
- **subproceso**: Subproceso dentro de un proceso (ej: Preparación de Suelo)
- **tarea**: Tarea específica (ej: Arado, Rastrillado)

---

## ✅ Recomendación

**Usa la Opción 1 (Seeds)** para tener datos de prueba inmediatamente y poder probar el sistema completo.

Luego, desde el frontend como admin, podrás:
- Ver todas las unidades
- Crear nuevas
- Editar existentes
- Desactivar las que no uses

---

## 🚀 Pasos para Empezar

1. **Ejecuta los 3 archivos SQL** en Supabase:
   - `schema-simple.sql`
   - `create-admin.sql`
   - `seed-simple.sql`

2. **Reinicia backend y frontend**

3. **Login** con `admin@horticola.com` / `ContraseñaSegura123!`

4. **Explora** el sistema con datos reales

¡Listo! 🎉
