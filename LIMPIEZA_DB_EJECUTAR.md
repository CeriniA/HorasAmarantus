# 🧹 **LIMPIEZA DE BASE DE DATOS - GUÍA DE EJECUCIÓN**

**Fecha:** 10 de Abril de 2026  
**Estado:** ✅ **LISTO PARA EJECUTAR**

---

## ⚠️  **IMPORTANTE: ANÁLISIS CORREGIDO**

### **❌ NO ELIMINAR:**
- **`time_entries.client_id`** - SE USA en sistema offline para tracking de sincronización
- **`organizational_units.path`** - Puede usarse para mostrar rutas jerárquicas

### **✅ SÍ ELIMINAR:**
- **`organizational_units.estimated_hours`** - NO se usa en ningún archivo
- **`users.role`** - Obsoleto (después de verificar que todos tienen `role_id`)

### **✅ SÍ OPTIMIZAR:**
- **`role_permissions.id`** - Cambiar a PK compuesta
- **`user_permissions.id`** - Cambiar a PK compuesta

---

## 📋 **SCRIPT DE LIMPIEZA SEGURA**

**Archivo:** `backend/migrations/20260410_limpieza_db_segura.sql`

### **Qué hace:**

#### **Paso 1: Optimizar `role_permissions`**
- Elimina PK UUID innecesaria
- Crea PK compuesta `(role_id, permission_id)`
- **Ahorro:** 16 bytes por registro

#### **Paso 2: Optimizar `user_permissions`**
- Elimina PK UUID innecesaria
- Crea PK compuesta `(user_id, permission_id)`
- **Ahorro:** 16 bytes por registro

#### **Paso 3: Eliminar `estimated_hours`**
- Elimina columna `organizational_units.estimated_hours`
- **Ahorro:** 8 bytes por registro

#### **Paso 4: Verificar y eliminar `users.role`**
- Verifica que todos los usuarios tengan `role_id`
- Si todos tienen `role_id`, elimina columna `role`
- Si NO todos tienen `role_id`, muestra advertencia

---

## 🚀 **CÓMO EJECUTAR**

### **1. Hacer BACKUP (OBLIGATORIO)**
```
En Supabase:
1. Ir a "Database" → "Backups"
2. Click "Create backup"
3. Esperar confirmación
```

### **2. Ejecutar script de limpieza**
```bash
# 1. Abrir archivo
backend/migrations/20260410_limpieza_db_segura.sql

# 2. Copiar TODO el contenido

# 3. Ir a Supabase SQL Editor

# 4. Pegar el contenido

# 5. Ejecutar (Click "Run")
```

### **3. Revisar mensajes**
El script mostrará mensajes como:
```
🧹 PASO 1: Optimizando role_permissions...
  ✅ Datos respaldados: X registros
  ✅ Tabla recreada con PK compuesta
  ✅ Índices recreados
  ✅ Datos restaurados: X registros
✅ PASO 1 COMPLETADO - Ahorro: 16 bytes por registro

🧹 PASO 2: Optimizando user_permissions...
  ✅ Tabla recreada con PK compuesta
✅ PASO 2 COMPLETADO - Ahorro: 16 bytes por registro

🧹 PASO 3: Eliminando estimated_hours...
  ✅ Columna estimated_hours eliminada
✅ PASO 3 COMPLETADO

🧹 PASO 4: Verificando migración RBAC...
  📊 Total usuarios: X
  📊 Usuarios sin role_id: Y
  
  SI Y = 0:
    ✅ Todos los usuarios tienen role_id
    ✅ Columna role eliminada
  
  SI Y > 0:
    ⚠️  NO se eliminará la columna role
    ⚠️  Ejecuta primero: 20260410_seed_rbac_data.sql

📊 VERIFICACIÓN FINAL:
  📋 Tablas: 7
  📋 Columnas: X
  📋 Índices: X
  ✅ No hay campos obsoletos

✅ LIMPIEZA DE BASE DE DATOS COMPLETADA
```

### **4. Re-ejecutar seeder RBAC**
```bash
# IMPORTANTE: Después de optimizar role_permissions y user_permissions
# Debes re-ejecutar el seeder para restaurar los permisos

# 1. Abrir archivo
backend/migrations/20260410_seed_rbac_data.sql

# 2. Copiar TODO el contenido

# 3. Pegar en Supabase SQL Editor

# 4. Ejecutar
```

---

## 📊 **AHORRO ESTIMADO**

### **Por registro:**
```
role_permissions:    16 bytes (UUID eliminado)
user_permissions:    16 bytes (UUID eliminado)
organizational_units: 8 bytes (estimated_hours eliminado)
users:               20 bytes (role VARCHAR eliminado, si aplica)
```

### **Total estimado:**
```
Depende de cantidad de registros
Estimado: 50-150 KB
Mejora de performance: Sí (menos índices, PKs más eficientes)
```

---

## ✅ **VERIFICACIÓN POST-EJECUCIÓN**

### **1. Verificar estructura:**
```sql
-- Ver columnas de organizational_units
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'organizational_units'
ORDER BY ordinal_position;

-- NO debe aparecer 'estimated_hours'
```

### **2. Verificar PKs compuestas:**
```sql
-- Ver PKs de tablas de permisos
SELECT 
  tc.table_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as pk_columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_name IN ('role_permissions', 'user_permissions')
GROUP BY tc.table_name;

-- Debe mostrar:
-- role_permissions: role_id, permission_id
-- user_permissions: user_id, permission_id
```

### **3. Verificar datos intactos:**
```sql
-- Contar registros
SELECT 
  'roles' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'role_permissions', COUNT(*) FROM role_permissions
UNION ALL
SELECT 'user_permissions', COUNT(*) FROM user_permissions
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- Los números deben ser los mismos que antes
```

---

## 🔄 **SI ALGO SALE MAL**

### **Opción 1: Restaurar desde backup**
```
1. Ir a Supabase → Database → Backups
2. Seleccionar el backup que hiciste
3. Click "Restore"
4. Confirmar
```

### **Opción 2: Rollback manual**
El script usa transacciones implícitas en cada bloque `DO $$`.
Si un paso falla, ese paso específico no se aplica.

---

## 📝 **CHECKLIST DE EJECUCIÓN**

- [ ] **1. Backup creado en Supabase**
- [ ] **2. Script `20260410_limpieza_db_segura.sql` ejecutado**
- [ ] **3. Mensajes de éxito verificados**
- [ ] **4. Seeder RBAC re-ejecutado (`20260410_seed_rbac_data.sql`)**
- [ ] **5. Verificación de estructura completada**
- [ ] **6. Verificación de datos completada**
- [ ] **7. Aplicación frontend funcionando correctamente**
- [ ] **8. Aplicación backend funcionando correctamente**

---

## 🎯 **RESULTADO ESPERADO**

### **Antes:**
```
organizational_units: 10 columnas (con estimated_hours)
role_permissions: 4 columnas (con id UUID)
user_permissions: 5 columnas (con id UUID)
users: 15 columnas (con role VARCHAR)
```

### **Después:**
```
organizational_units: 9 columnas (sin estimated_hours)
role_permissions: 3 columnas (sin id, PK compuesta)
user_permissions: 4 columnas (sin id, PK compuesta)
users: 14 columnas (sin role, solo role_id)
```

---

## ⚠️  **NOTAS IMPORTANTES**

1. **client_id NO se elimina** - Se usa en sistema offline
2. **path NO se elimina** - Puede ser útil para rutas jerárquicas
3. **Después de optimizar tablas de permisos** - Re-ejecutar seeder RBAC
4. **users.role** - Solo se elimina si todos tienen `role_id`

---

**Estado:** ✅ **LISTO PARA EJECUTAR**  
**Última actualización:** 10 de Abril de 2026  
**Archivo:** `backend/migrations/20260410_limpieza_db_segura.sql`
