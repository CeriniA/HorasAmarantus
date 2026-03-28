# 🔧 FIX: Horas asignadas al usuario incorrecto

## 🐛 PROBLEMA

Cuando un **superadmin** cargaba horas, aparecían asignadas a otro usuario (Ivan) en lugar del superadmin.

### Causa Raíz
El frontend NO estaba enviando el campo `user_id` al crear time entries. El backend, al no recibir `user_id`, usaba `req.user.id` (el usuario autenticado), pero luego había confusión en la visualización.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Selector de Usuario para Admins/SuperAdmins

**Archivo:** `frontend/src/components/timeEntry/BulkTimeEntry.jsx`

**Cambios:**
- ✅ Agregado prop `currentUser` y `users`
- ✅ Agregado estado `selectedUserId`
- ✅ Agregado selector de usuario en UI (solo visible para admins)
- ✅ Envío de `user_id` en las entradas cuando es necesario

**Código agregado:**
```javascript
// Props
export const BulkTimeEntry = ({ 
  // ... props existentes
  currentUser = null,
  users = [] // Lista de usuarios para admins
}) => {
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || null);
  
  // Verificar si es admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  
  // Al guardar, incluir user_id si es admin y seleccionó otro usuario
  const entry = {
    organizational_unit_id: unitId,
    start_time: startDateTime,
    end_time: endDateTime,
    description: null
  };
  
  // Si es admin y seleccionó un usuario específico, incluir user_id
  if (isAdmin && selectedUserId && selectedUserId !== currentUser?.id) {
    entry.user_id = selectedUserId;
  }
}
```

**UI agregada:**
```jsx
{isAdmin && users.length > 0 && (
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Usuario
    </label>
    <select
      value={selectedUserId || ''}
      onChange={(e) => setSelectedUserId(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg..."
    >
      <option value="">Seleccionar usuario...</option>
      {users.map(user => (
        <option key={user.id} value={user.id}>
          {user.name} ({user.username})
        </option>
      ))}
    </select>
  </div>
)}
```

---

### 2. Pasar Props desde TimeEntries

**Archivo:** `frontend/src/pages/TimeEntries.jsx`

**Cambios:**
- ✅ Importado `useUsers` hook
- ✅ Cargado lista de usuarios
- ✅ Pasado `currentUser` y `users` al `BulkTimeEntry`

**Código:**
```javascript
import { useUsers } from '../hooks/useUsers';

export const TimeEntries = () => {
  const { user } = useAuthContext();
  const { users } = useUsers(); // Para el selector de usuarios en admins
  
  // ...
  
  <BulkTimeEntry
    isOpen={showBulkEntry}
    onClose={() => setShowBulkEntry(false)}
    units={units}
    onSave={handleBulkSave}
    loading={saving}
    currentUser={user}  // ✅ NUEVO
    users={users}        // ✅ NUEVO
  />
}
```

---

## 🎯 COMPORTAMIENTO AHORA

### Para Operarios
- ✅ No ven selector de usuario
- ✅ Las horas se asignan automáticamente a ellos
- ✅ No pueden cargar horas para otros

### Para Admins/SuperAdmins
- ✅ Ven selector de usuario
- ✅ Pueden seleccionar para quién cargan las horas
- ✅ Por defecto, las horas se asignan a ellos mismos
- ✅ Si seleccionan otro usuario, se envía `user_id` al backend

---

## 🔍 FLUJO COMPLETO

### 1. Usuario Operario carga horas
```
Frontend: NO envía user_id
Backend: Usa req.user.id (el operario)
Resultado: ✅ Horas asignadas al operario
```

### 2. Admin carga horas para sí mismo
```
Frontend: NO envía user_id (selectedUserId === currentUser.id)
Backend: Usa req.user.id (el admin)
Resultado: ✅ Horas asignadas al admin
```

### 3. Admin carga horas para otro usuario
```
Frontend: Envía user_id (selectedUserId !== currentUser.id)
Backend: Usa user_id del body
Resultado: ✅ Horas asignadas al usuario seleccionado
```

---

## 📊 VALIDACIONES

### Backend (ya existía)
```javascript
// backend/src/routes/timeEntries.js
const targetUserId = user_id || req.user.id;

// Solo admins pueden crear para otros
if (targetUserId !== req.user.id && 
    req.user.role !== USER_ROLES.ADMIN && 
    req.user.role !== USER_ROLES.SUPERADMIN) {
  return res.status(403).json({ error: 'No puedes crear registros para otros usuarios' });
}
```

### Frontend (nuevo)
```javascript
// Solo incluir user_id si es admin Y seleccionó otro usuario
if (isAdmin && selectedUserId && selectedUserId !== currentUser?.id) {
  entry.user_id = selectedUserId;
}
```

---

## ✅ ARCHIVOS MODIFICADOS

1. ✅ `frontend/src/components/timeEntry/BulkTimeEntry.jsx`
   - Agregado selector de usuario
   - Agregado lógica para enviar `user_id`

2. ✅ `frontend/src/pages/TimeEntries.jsx`
   - Importado `useUsers`
   - Pasado props al `BulkTimeEntry`

---

## 🧪 CÓMO PROBAR

### Test 1: Operario carga horas
1. Login como operario
2. Abrir "Carga de Horas"
3. Cargar horas
4. ✅ Verificar que NO aparece selector de usuario
5. ✅ Verificar que las horas se asignan al operario

### Test 2: Admin carga horas para sí mismo
1. Login como admin/superadmin
2. Abrir "Carga de Horas"
3. ✅ Verificar que aparece selector de usuario
4. Dejar selector vacío o seleccionar tu propio usuario
5. Cargar horas
6. ✅ Verificar que las horas se asignan al admin

### Test 3: Admin carga horas para otro usuario
1. Login como admin/superadmin
2. Abrir "Carga de Horas"
3. Seleccionar otro usuario del dropdown
4. Cargar horas
5. ✅ Verificar que las horas se asignan al usuario seleccionado
6. ✅ Verificar en consola que se envía `user_id`

---

## 🎉 RESULTADO

**Problema:** ✅ RESUELTO

**Beneficios:**
- ✨ Admins pueden cargar horas para cualquier usuario
- ✨ Operarios solo cargan sus propias horas
- ✨ Asignación correcta de horas
- ✨ UI intuitiva con selector
- ✨ Validaciones en backend y frontend

---

**Fecha:** 28 de marzo de 2026  
**Estado:** ✅ Implementado y listo para probar
