# 🧪 **PASOS PARA PROBAR LA MIGRACIÓN RBAC**

**Fecha:** 10 de Abril de 2026

---

## 🎯 **SITUACIÓN ACTUAL**

- ✅ Código backend migrado a RBAC
- ✅ Código frontend compatible
- ⚠️ Base de datos tiene ambas columnas (`role` y `role_id`)
- ⚠️ Necesita ejecutar script de sincronización

---

## 📋 **PASOS PARA PROBAR**

### **PASO 1: Ejecutar script de sincronización**

```bash
# 1. Abrir archivo
backend/migrations/20260410_sincronizar_role_y_role_id.sql

# 2. Copiar TODO el contenido

# 3. Ir a Supabase SQL Editor
https://supabase.com/dashboard/project/YOUR_PROJECT/sql

# 4. Pegar y ejecutar
```

**Qué hace:**
- Crea triggers para sincronizar `role` ↔ `role_id`
- Sincroniza datos existentes
- Permite convivencia de sistema viejo y nuevo

---

### **PASO 2: Verificar sincronización**

```sql
-- En Supabase SQL Editor, ejecutar:
SELECT 
  id,
  username,
  role,        -- VARCHAR (sistema viejo)
  role_id,     -- UUID (sistema nuevo)
  r.slug,      -- Debe coincidir con role
  r.name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LIMIT 10;

-- Verificar que role = r.slug
```

---

### **PASO 3: Reiniciar backend**

```bash
cd backend
npm run dev
```

**Verificar en consola:**
- ✅ Servidor inicia sin errores
- ✅ Conecta a Supabase correctamente

---

### **PASO 4: Reiniciar frontend**

```bash
cd frontend
npm run dev
```

---

### **PASO 5: Probar login**

1. Abrir http://localhost:5173
2. Login con un usuario existente
3. **Abrir DevTools → Console**
4. **Abrir DevTools → Network**

**Verificar:**
- ✅ Login exitoso
- ✅ En Network → `auth/login` → Response debe incluir:
  ```json
  {
    "user": {
      "id": "...",
      "role_id": "uuid-del-rol",
      "role": "superadmin",  // ← Slug del rol
      "role_name": "Superadministrador"
    }
  }
  ```

---

### **PASO 6: Probar listado de usuarios**

1. Ir a `/admin/users`
2. **Abrir DevTools → Console**
3. **Abrir DevTools → Network**

**Verificar en Console:**
```
getAll users - user.id: uuid-del-usuario
canViewAll: true (si eres superadmin/admin)
Usuarios obtenidos: X
```

**Verificar en Network:**
- ✅ Request a `/api/users`
- ✅ Response con array de usuarios
- ✅ Cada usuario tiene `role` (slug) y `role_id` (UUID)

**Si NO ves usuarios:**
- Revisar Console para errores
- Revisar Network para errores 403/500
- Revisar logs del backend

---

### **PASO 7: Probar crear usuario**

1. Click en "Crear Usuario"
2. Llenar formulario:
   - Username: `test_rbac`
   - Email: `test@test.com`
   - Password: `Test1234`
   - Nombre: `Test RBAC`
   - Rol: Seleccionar un rol
   - Unidad: Seleccionar una unidad

3. Guardar

**Verificar:**
- ✅ Usuario creado exitosamente
- ✅ Aparece en la lista
- ✅ Tiene `role` y `role_id`

**Si falla:**
- Revisar Console para errores
- Revisar Network → Request payload
- Verificar que se envía `role_id` (no `role`)

---

### **PASO 8: Verificar en base de datos**

```sql
-- Ver el usuario creado
SELECT 
  id,
  username,
  role,
  role_id,
  r.slug,
  r.name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE username = 'test_rbac';

-- Verificar que role = r.slug
```

---

## 🔍 **TROUBLESHOOTING**

### **Problema: No veo usuarios**

**Causa posible 1: Error de permisos**
```bash
# Revisar logs del backend
# Debe mostrar:
getAll users - user.id: uuid-del-usuario
canViewAll: true/false
```

**Solución:**
- Verificar que el usuario tiene `role_id` asignado
- Verificar que existen permisos en `role_permissions`

---

**Causa posible 2: Error en query**
```bash
# Revisar logs del backend
# Si muestra error de Supabase:
Error obteniendo usuarios: {...}
```

**Solución:**
- Verificar que la tabla `roles` existe
- Verificar que todos los usuarios tienen `role_id`

---

**Causa posible 3: Usuario sin ID**
```bash
# Si muestra:
Usuario sin ID, filtrando a ninguno
```

**Solución:**
- El token JWT no incluye `id`
- Revisar `auth.service.js` → `generateToken()`
- Debe incluir `id: user.id`

---

### **Problema: Error al crear usuario**

**Causa posible: Frontend envía `role` en lugar de `role_id`**

**Solución:**
Verificar que `UserManagement.jsx` envía `role_id`:

```javascript
// ❌ INCORRECTO
const userData = {
  username,
  role: formData.role  // ← Envía slug
};

// ✅ CORRECTO
const userData = {
  username,
  role_id: getRoleIdFromSlug(formData.role)  // ← Envía UUID
};
```

---

### **Problema: Usuarios desincronizados**

```sql
-- Ver usuarios desincronizados
SELECT 
  id,
  username,
  role,
  r.slug,
  CASE 
    WHEN role = r.slug THEN '✅ OK'
    ELSE '❌ DESINCRONIZADO'
  END as estado
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE role != r.slug;

-- Sincronizar manualmente
UPDATE users u
SET role = r.slug
FROM roles r
WHERE u.role_id = r.id
  AND u.role != r.slug;
```

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

- [ ] Script de sincronización ejecutado
- [ ] Triggers creados correctamente
- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Login funciona
- [ ] Token JWT incluye `role` y `role_id`
- [ ] Listado de usuarios funciona
- [ ] Crear usuario funciona
- [ ] Usuarios tienen `role` y `role_id` sincronizados
- [ ] Logs del backend muestran permisos RBAC

---

## 📊 **LOGS ESPERADOS**

### **Backend (al listar usuarios):**
```
getAll users - user.id: 123e4567-e89b-12d3-a456-426614174000
canViewAll: true
Usuarios obtenidos: 5
```

### **Frontend (en Console):**
```
Users loaded: 5
```

### **Network (Response de /api/users):**
```json
{
  "users": [
    {
      "id": "...",
      "username": "admin",
      "role": "superadmin",
      "role_id": "uuid-superadmin",
      "roles": {
        "slug": "superadmin",
        "name": "Superadministrador"
      }
    }
  ]
}
```

---

## 🚨 **SI TODO FALLA**

### **Rollback temporal:**

1. **Revertir cambios en `users.service.js`:**
   ```bash
   git checkout HEAD -- backend/src/services/users.service.js
   ```

2. **Reiniciar backend**

3. **Reportar error con:**
   - Logs del backend
   - Errores de Console
   - Errores de Network
   - Query que falla en Supabase

---

**¿Listo para probar?** Ejecuta el script de sincronización y sigue los pasos.
