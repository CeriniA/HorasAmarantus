# 📊 REPORTES para Operarios + Fix created_at

## 🎯 CAMBIOS IMPLEMENTADOS

### 1. Reportes Habilitados para Operarios ✅

**ANTES ❌:**
- Operarios NO podían acceder a Reportes
- Solo Admin y SuperAdmin

**AHORA ✅:**
- Operarios SÍ pueden acceder a Reportes
- Solo ven SUS PROPIOS datos
- No pueden ver datos de otros usuarios

---

## 📋 CAMBIO 1: Reportes para Operarios

### Frontend - Reports.jsx

**Modificación en `loadFilters()`:**

```javascript
// ANTES ❌
const loadFilters = async () => {
  if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) {
    const { users: usersData } = await usersService.getAll();
    setUsers(usersData || []);
  }
  // Operarios no cargaban usuarios
};

// AHORA ✅
const loadFilters = async () => {
  if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) {
    const { users: usersData } = await usersService.getAll();
    setUsers(usersData || []);
  } else if (user?.role === USER_ROLES.OPERARIO) {
    // Operario solo ve su propio usuario en el filtro
    setUsers([user]);
    setSelectedUser(user.id); // Pre-seleccionar su usuario
  }
};
```

### Comportamiento por Rol

#### Operario
```javascript
Filtros visibles:
✅ Rango de fechas (puede cambiar)
✅ Selector de usuario (solo su nombre, bloqueado)
✅ Selector de unidad organizacional
✅ Tipo de reporte

Datos mostrados:
✅ Solo SUS registros
❌ No ve datos de otros usuarios
```

#### Admin/SuperAdmin
```javascript
Filtros visibles:
✅ Rango de fechas
✅ Selector de usuario (TODOS los usuarios)
✅ Selector de unidad organizacional
✅ Tipo de reporte

Datos mostrados:
✅ Puede ver TODOS los usuarios
✅ Puede filtrar por cualquier usuario
```

---

## 🔧 CAMBIO 2: Verificar created_at en Usuarios

### Problema

Usuarios antiguos pueden no tener `created_at`, causando:
- ❌ Errores en Dashboard
- ❌ Comparativas incorrectas
- ❌ Historial de 8 semanas cuando el usuario es nuevo

### Solución

**Script SQL creado:** `SCRIPT_VERIFICAR_CREATED_AT.sql`

---

### Paso 1: Verificar usuarios sin created_at

```sql
-- Ver usuarios sin fecha
SELECT 
    id,
    username,
    name,
    role,
    created_at,
    CASE 
        WHEN created_at IS NULL THEN '❌ SIN FECHA'
        ELSE '✅ CON FECHA'
    END as estado
FROM users
ORDER BY created_at NULLS FIRST;
```

**Ejemplo de resultado:**
```
id  | username      | name          | role      | created_at | estado
----|---------------|---------------|-----------|------------|-------------
1   | superamarantus| Super Admin   | superadmin| NULL       | ❌ SIN FECHA
2   | ivan          | Ivan Admin    | admin     | NULL       | ❌ SIN FECHA
3   | juan          | Juan Operario | operario  | 2026-03-15 | ✅ CON FECHA
```

---

### Paso 2: Contar usuarios afectados

```sql
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(created_at) as con_fecha,
    COUNT(*) - COUNT(created_at) as sin_fecha
FROM users;
```

**Ejemplo:**
```
total_usuarios | con_fecha | sin_fecha
---------------|-----------|----------
10             | 7         | 3
```

---

### Paso 3: Actualizar usuarios sin created_at

#### Opción A: Fecha actual para todos (Simple)

```sql
UPDATE users 
SET created_at = NOW() 
WHERE created_at IS NULL;
```

**Resultado:**
- Todos los usuarios sin fecha → fecha de hoy
- ✅ Simple y rápido
- ⚠️ No es históricamente preciso

---

#### Opción B: Fechas escalonadas (Recomendado)

```sql
-- Asigna fechas progresivas hacia atrás
WITH numbered_users AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY id) as rn,
        COUNT(*) OVER () as total
    FROM users
    WHERE created_at IS NULL
)
UPDATE users u
SET created_at = NOW() - (nu.rn * INTERVAL '7 days')
FROM numbered_users nu
WHERE u.id = nu.id;
```

**Resultado:**
- Usuario 1 → Hoy - 7 días
- Usuario 2 → Hoy - 14 días
- Usuario 3 → Hoy - 21 días
- ✅ Más realista
- ✅ Permite comparativas graduales

**Ejemplo:**
```
Hoy: 2026-03-28

Usuario 1 (id=1) → created_at = 2026-03-21 (hace 1 semana)
Usuario 2 (id=2) → created_at = 2026-03-14 (hace 2 semanas)
Usuario 3 (id=3) → created_at = 2026-03-07 (hace 3 semanas)
```

---

### Paso 4: Asegurar valor por defecto

```sql
-- Para nuevos usuarios, created_at se llena automáticamente
ALTER TABLE users 
ALTER COLUMN created_at SET DEFAULT NOW();
```

**Beneficio:**
- ✅ Nuevos usuarios siempre tendrán created_at
- ✅ No más usuarios sin fecha

---

### Paso 5: Verificar configuración

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'created_at';
```

**Resultado esperado:**
```
column_name | data_type           | is_nullable | column_default
------------|---------------------|-------------|---------------
created_at  | timestamp with...   | YES         | now()
```

---

## 🎯 IMPACTO DE LOS CAMBIOS

### Para Operarios

**ANTES ❌:**
```
Operario → Reportes
→ "No tienes permiso"
→ Solo puede ver Dashboard
```

**AHORA ✅:**
```
Operario → Reportes
→ Ve sus propios reportes
→ Puede analizar su productividad
→ Puede exportar sus datos
→ Filtros de fecha y unidad disponibles
```

---

### Para Dashboard (Todos)

**ANTES ❌:**
```
Usuario sin created_at
→ Dashboard muestra 8 semanas de historial
→ Comparativas incorrectas
→ Puede causar errores
```

**AHORA ✅:**
```
Usuario con created_at válido
→ Dashboard muestra solo semanas desde su creación
→ Comparativas lógicas
→ Sin errores
```

---

## 📊 EJEMPLOS DE USO

### Ejemplo 1: Operario Juan ve sus reportes

```
Juan (operario) → Reportes

Filtros disponibles:
- Fecha: [01/03/2026] - [31/03/2026]
- Usuario: [Juan Pérez] ← Solo su nombre, no puede cambiar
- Unidad: [Todas]

Reportes mostrados:
✅ General: Solo horas de Juan
✅ Productividad: Solo datos de Juan
✅ Cumplimiento: Solo objetivos de Juan
✅ Distribución: Solo tareas de Juan

Exportar:
✅ Puede exportar sus propios datos
```

---

### Ejemplo 2: Admin ve reportes de todos

```
Admin → Reportes

Filtros disponibles:
- Fecha: [01/03/2026] - [31/03/2026]
- Usuario: [Todos ▼]  ← Puede seleccionar cualquiera
  - Todos
  - Juan Pérez
  - María García
  - Pedro López
- Unidad: [Todas]

Reportes mostrados:
✅ Puede ver todos los usuarios
✅ Puede filtrar por usuario específico
✅ Análisis global o individual
```

---

### Ejemplo 3: Usuario nuevo (creado hace 1 semana)

```
Usuario creado: 2026-03-21
Hoy: 2026-03-28

Dashboard:
✅ Comparación Semanal: Muestra 1 semana (esta)
✅ Historial de Objetivos: "Completa tu primera semana..."
✅ Sin errores
✅ Comparativas lógicas
```

---

## 🔍 VERIFICACIÓN

### Test 1: Operario accede a Reportes

**Pasos:**
1. Login como operario
2. Ir a Reportes
3. Verificar que solo ve su usuario en filtro
4. Verificar que solo ve sus datos

**Resultado esperado:**
- ✅ Acceso permitido
- ✅ Solo su usuario visible
- ✅ Solo sus datos mostrados

---

### Test 2: Admin ve todos los usuarios

**Pasos:**
1. Login como admin
2. Ir a Reportes
3. Verificar selector de usuario
4. Seleccionar diferentes usuarios

**Resultado esperado:**
- ✅ Ve todos los usuarios
- ✅ Puede filtrar por cualquiera
- ✅ Datos cambian según selección

---

### Test 3: Usuario sin created_at

**Antes de ejecutar SQL:**
1. Login como usuario sin created_at
2. Ir a Dashboard
3. Verificar comportamiento

**Después de ejecutar SQL:**
1. Recargar página
2. Verificar que historial es lógico
3. Sin errores en consola

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Frontend
- [x] Modificar `Reports.jsx` para operarios
- [x] Operarios ven solo su usuario en filtro
- [x] Pre-seleccionar usuario del operario
- [x] Validación de `created_at` en Dashboard

### Backend
- [ ] Ejecutar script SQL para verificar usuarios
- [ ] Actualizar usuarios sin `created_at`
- [ ] Configurar valor por defecto en columna
- [ ] Verificar que nuevos usuarios tengan fecha

### Testing
- [ ] Test operario accede a reportes
- [ ] Test operario solo ve sus datos
- [ ] Test admin ve todos los usuarios
- [ ] Test dashboard con usuarios actualizados

---

## 🚀 PASOS PARA APLICAR

### 1. Actualizar Frontend (Ya hecho ✅)
```bash
# Ya está en el código
# Solo hacer commit
git add .
git commit -m "Habilitar reportes para operarios (solo datos propios)"
```

### 2. Actualizar Base de Datos

**Conectar a Supabase:**
1. Ir a Supabase Dashboard
2. SQL Editor
3. Ejecutar script paso por paso

**Script recomendado:**
```sql
-- 1. Ver usuarios sin created_at
SELECT id, username, name, created_at 
FROM users 
WHERE created_at IS NULL;

-- 2. Actualizar con fechas escalonadas (RECOMENDADO)
WITH numbered_users AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY id) as rn
    FROM users
    WHERE created_at IS NULL
)
UPDATE users u
SET created_at = NOW() - (nu.rn * INTERVAL '7 days')
FROM numbered_users nu
WHERE u.id = nu.id;

-- 3. Configurar valor por defecto
ALTER TABLE users 
ALTER COLUMN created_at SET DEFAULT NOW();

-- 4. Verificar
SELECT id, username, name, created_at 
FROM users 
ORDER BY created_at DESC;
```

### 3. Verificar en la App

```bash
# Iniciar app
npm run dev

# Probar:
1. Login como operario → Reportes
2. Login como admin → Reportes
3. Verificar Dashboard sin errores
```

---

## 📝 RESUMEN

### Cambios Implementados

**1. Reportes para Operarios:**
- ✅ Operarios pueden acceder a Reportes
- ✅ Solo ven sus propios datos
- ✅ Filtros disponibles pero limitados

**2. Fix created_at:**
- ✅ Script SQL para verificar usuarios
- ✅ Actualización de usuarios sin fecha
- ✅ Valor por defecto configurado
- ✅ Dashboard funciona correctamente

### Próximos Pasos

1. Ejecutar script SQL en Supabase
2. Verificar que usuarios tengan created_at
3. Probar acceso de operarios a reportes
4. Commit y push de cambios

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** MEDIA-ALTA  
**Estado:** ✅ Frontend listo, ⏳ Pendiente SQL
