# 🔧 FIX CRÍTICO: Integridad de user_id en time_entries

## 🚨 PROBLEMA IDENTIFICADO

**Gravedad:** CRÍTICA  
**Impacto:** Datos incorrectos en DB

### Situación
- Registros de horas del **superadmin** aparecen como del **admin (Ivan)**
- Admin podía crear registros para superadmins (violación de permisos)
- **Regla básica de CRUD violada:** Cada registro DEBE tener su user_id correcto

---

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. Backend - Validación Estricta de Permisos

**Archivo:** `backend/src/routes/timeEntries.js`

#### POST /api/time-entries
```javascript
// ANTES ❌
// Admin podía crear para CUALQUIER usuario (incluso superadmins)

// AHORA ✅
// Validar que admin NO cree para otros admins/superadmins
if (user_id && user_id !== req.user.id) {
  const { data: targetUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user_id)
    .single();
  
  // Admin NO puede crear registros para otros admins o superadmins
  if (req.user.role === USER_ROLES.ADMIN && 
      (targetUser.role === USER_ROLES.ADMIN || targetUser.role === USER_ROLES.SUPERADMIN)) {
    return res.status(403).json({ 
      error: 'No puedes crear registros para usuarios admin o superadmin' 
    });
  }
}
```

#### POST /api/time-entries/bulk
```javascript
// Misma validación aplicada al endpoint bulk
```

---

### 2. Frontend - Filtrado de Usuarios

**Archivo:** `frontend/src/components/timeEntry/BulkTimeEntry.jsx`

```javascript
// Filtrar usuarios según el rol actual
const availableUsers = useMemo(() => {
  if (!users || users.length === 0) return [];
  
  // SuperAdmin puede ver todos los usuarios
  if (currentUser?.role === 'superadmin') {
    return users;
  }
  
  // Admin solo puede ver operarios
  if (currentUser?.role === 'admin') {
    return users.filter(u => u.role === 'operario');
  }
  
  // Operarios no deberían ver este selector
  return [];
}, [users, currentUser]);
```

---

## 🗄️ LIMPIEZA DE DATOS INCORRECTOS

### Script SQL para Identificar Datos Corruptos

```sql
-- 1. Identificar registros con user_id incorrecto
-- (registros que no coinciden con el usuario que los creó)

SELECT 
  te.id,
  te.user_id,
  u.username as assigned_to,
  u.role as assigned_role,
  te.start_time,
  te.created_at
FROM time_entries te
JOIN users u ON te.user_id = u.id
WHERE te.user_id IN (
  -- IDs de admins y superadmins
  SELECT id FROM users WHERE role IN ('admin', 'superadmin')
)
ORDER BY te.created_at DESC;
```

### Opciones de Limpieza

#### Opción 1: Eliminar Registros Incorrectos (RECOMENDADO)
```sql
-- ADVERTENCIA: Esto eliminará los registros permanentemente
-- Hacer backup antes de ejecutar

-- Eliminar registros de superadmin que están mal asignados
DELETE FROM time_entries
WHERE user_id IN (
  SELECT id FROM users 
  WHERE username = 'superamarantus' 
  AND role = 'superadmin'
)
AND created_at < '2026-03-28'; -- Antes del fix
```

#### Opción 2: Reasignar a Usuario Correcto (SI SE SABE QUIÉN ES)
```sql
-- Solo si sabés con certeza quién creó esos registros
-- NO EJECUTAR sin confirmar

UPDATE time_entries
SET user_id = 'ID_DEL_USUARIO_CORRECTO'
WHERE user_id = 'ID_INCORRECTO'
AND start_time BETWEEN 'FECHA_INICIO' AND 'FECHA_FIN';
```

#### Opción 3: Marcar como Inválidos (CONSERVAR PARA AUDITORÍA)
```sql
-- Agregar columna para marcar registros inválidos
ALTER TABLE time_entries 
ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT true;

-- Marcar como inválidos
UPDATE time_entries
SET is_valid = false
WHERE user_id IN (
  SELECT id FROM users WHERE role IN ('admin', 'superadmin')
)
AND created_at < '2026-03-28';

-- Luego filtrar en queries
SELECT * FROM time_entries WHERE is_valid = true;
```

---

## 📋 REGLAS DE INTEGRIDAD ESTABLECIDAS

### Regla 1: user_id es OBLIGATORIO
```sql
-- Constraint en DB
ALTER TABLE time_entries
ALTER COLUMN user_id SET NOT NULL;
```

### Regla 2: user_id debe existir en users
```sql
-- Foreign key (ya debería existir)
ALTER TABLE time_entries
ADD CONSTRAINT fk_time_entries_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
```

### Regla 3: Validación en Backend
```javascript
// SIEMPRE validar que user_id sea válido
// SIEMPRE validar permisos antes de asignar
// NUNCA confiar en el frontend
```

---

## 🎯 NUEVAS REGLAS DE PERMISOS

### Operario
- ✅ Puede crear registros solo para sí mismo
- ❌ NO puede especificar user_id
- ❌ NO ve selector de usuario

### Admin
- ✅ Puede crear registros para sí mismo
- ✅ Puede crear registros para **operarios**
- ❌ NO puede crear registros para otros admins
- ❌ NO puede crear registros para superadmins
- ✅ Ve selector con solo operarios

### SuperAdmin
- ✅ Puede crear registros para cualquier usuario
- ✅ Ve selector con todos los usuarios
- ✅ Sin restricciones

---

## 🧪 TESTING

### Test 1: Admin intenta crear para SuperAdmin
```bash
# Request
POST /api/time-entries
{
  "user_id": "superadmin_id",
  "organizational_unit_id": "...",
  "start_time": "...",
  "end_time": "..."
}

# Response esperada
403 Forbidden
{
  "error": "No puedes crear registros para usuarios admin o superadmin"
}
```

### Test 2: Admin crea para Operario
```bash
# Request
POST /api/time-entries
{
  "user_id": "operario_id",
  ...
}

# Response esperada
201 Created
{
  "timeEntry": { ... }
}
```

### Test 3: SuperAdmin crea para Admin
```bash
# Request
POST /api/time-entries
{
  "user_id": "admin_id",
  ...
}

# Response esperada
201 Created
{
  "timeEntry": { ... }
}
```

---

## 📊 IMPACTO Y PREVENCIÓN

### Impacto del Bug
- ❌ Datos incorrectos en reportes
- ❌ Horas mal asignadas
- ❌ Confusión en métricas
- ❌ Violación de integridad de datos

### Prevención Futura
- ✅ Validación estricta en backend
- ✅ Filtrado en frontend
- ✅ Tests automatizados
- ✅ Constraints en DB
- ✅ Auditoría de cambios

---

## 🔍 AUDITORÍA RECOMENDADA

### Verificar Integridad Actual
```sql
-- Contar registros por rol de usuario
SELECT 
  u.role,
  COUNT(*) as total_entries,
  SUM(EXTRACT(EPOCH FROM (te.end_time - te.start_time))/3600) as total_hours
FROM time_entries te
JOIN users u ON te.user_id = u.id
GROUP BY u.role
ORDER BY u.role;

-- Resultado esperado:
-- operario: mayoría de registros
-- admin: pocos o ninguno (solo sus propias horas)
-- superadmin: pocos o ninguno (solo sus propias horas)
```

### Identificar Anomalías
```sql
-- Registros de admins/superadmins (revisar si son correctos)
SELECT 
  u.username,
  u.role,
  COUNT(*) as entries_count,
  MIN(te.start_time) as first_entry,
  MAX(te.start_time) as last_entry
FROM time_entries te
JOIN users u ON te.user_id = u.id
WHERE u.role IN ('admin', 'superadmin')
GROUP BY u.id, u.username, u.role;
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [x] Validación en POST /time-entries
- [x] Validación en POST /time-entries/bulk
- [x] Verificar rol del usuario objetivo
- [x] Retornar error 403 apropiado

### Frontend
- [x] Filtrar usuarios en selector
- [x] Admin solo ve operarios
- [x] SuperAdmin ve todos
- [x] Operarios no ven selector

### Base de Datos
- [ ] Ejecutar script de identificación
- [ ] Decidir estrategia de limpieza
- [ ] Ejecutar limpieza
- [ ] Verificar integridad post-limpieza
- [ ] Agregar constraints si faltan

### Testing
- [ ] Probar admin → operario (debe funcionar)
- [ ] Probar admin → admin (debe fallar)
- [ ] Probar admin → superadmin (debe fallar)
- [ ] Probar superadmin → cualquiera (debe funcionar)

---

## 🎉 RESULTADO ESPERADO

### Antes del Fix
```
❌ Admin podía crear horas para superadmin
❌ Datos incorrectos en DB
❌ Confusión en reportes
```

### Después del Fix
```
✅ Admin solo puede crear para operarios
✅ SuperAdmin puede crear para todos
✅ Validación estricta en backend
✅ Filtrado correcto en frontend
✅ Integridad de datos garantizada
```

---

## 📝 RECOMENDACIÓN FINAL

**Para los datos viejos incorrectos:**

1. **Identificar** con el script SQL
2. **Revisar** con el equipo qué hacer
3. **Opciones:**
   - Eliminar (si son pocos y no críticos) ✅ RECOMENDADO
   - Reasignar (si se sabe el usuario correcto)
   - Marcar como inválidos (para auditoría)

**NO ignorar** - Los datos incorrectos afectan reportes y métricas.

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** CRÍTICA  
**Estado:** ✅ Fix implementado - Pendiente limpieza de datos
