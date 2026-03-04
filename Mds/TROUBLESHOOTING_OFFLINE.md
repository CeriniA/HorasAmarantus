# 🔧 Troubleshooting - Modo Offline

## ✅ Problemas Resueltos

### 1. "Al recargar página offline me manda al login"

**Causa**: El token JWT usaba campo `userId` pero el backend genera `id`

**Solución**: ✅ Arreglado
- Ahora usa `payload.id` correctamente
- Carga usuario desde cache offline
- Logs en desarrollo para debugging

**Cómo verificar**:
```javascript
// Abre consola (F12) en modo desarrollo
// Verás:
"Loading user from cache (offline): [user-id]"
"User loaded from cache: admin@horticola.com"
```

---

### 2. "Error al crear horas offline: IDBObjectStore key path error"

**Causa**: Los registros de horas no tenían `id` al guardarlos en IndexedDB

**Solución**: ✅ Arreglado
- Genera `id` temporal con UUID
- Genera `client_id` si no existe
- Agrega timestamps automáticamente
- Logs detallados en desarrollo

**Cómo verificar**:
```javascript
// En consola verás:
"Saving time entry locally: { id: '...', client_id: '...', ... }"
```

---

## 🧪 Cómo Probar que Funciona

### Test 1: Login y Recarga Offline

```
1. ✅ Login con internet
   → admin@horticola.com / ContraseñaSegura123!

2. ✅ Verifica que funciona

3. ✅ Desconecta internet
   → DevTools (F12) → Network → Offline

4. ✅ Recarga la página (F5)
   → Deberías seguir logueado ✅
   → Consola muestra: "User loaded from cache"

5. ✅ Navega por la app
   → Todo funciona con datos cacheados
```

### Test 2: Crear Horas Offline

```
1. ✅ Estando logueado

2. ✅ Desconecta internet
   → DevTools → Network → Offline

3. ✅ Crea un registro de horas
   → Llena formulario
   → Guarda

4. ✅ Verifica en consola:
   → "Saving time entry locally: {...}"
   → Sin errores de IndexedDB ✅

5. ✅ Reconecta internet
   → El registro se sincroniza automáticamente
```

---

## 🐛 Problemas Conocidos y Soluciones

### "Usuario no encontrado en cache"

**Síntoma**: Al recargar offline ves este error

**Causas posibles**:
1. Nunca iniciaste sesión con internet
2. Borraste datos del navegador
3. Usaste modo incógnito

**Solución**:
```
1. Conecta a internet
2. Inicia sesión normalmente
3. El usuario se guarda en cache
4. Ahora funcionará offline
```

---

### "Token expirado"

**Síntoma**: Después de 7 días offline no puedes acceder

**Causa**: El token JWT expira (configurado en 7 días)

**Solución**:
```
1. Conecta a internet
2. Vuelve a iniciar sesión
3. Nuevo token válido por 7 días más
```

**Prevención**:
- Conecta a internet al menos 1 vez por semana
- El sistema renovará el token automáticamente

---

### "Datos no se sincronizan"

**Síntoma**: Creaste registros offline pero no aparecen en el servidor

**Diagnóstico**:
```javascript
// En consola:
const queue = await db.sync_queue.toArray();
console.log('Pending sync:', queue);
```

**Solución**:
```
1. Verifica que tienes internet
2. Recarga la página
3. El servicio de sync debería procesar la cola
```

---

### "IndexedDB lleno"

**Síntoma**: Error al guardar datos offline

**Causa**: Límite de almacenamiento del navegador

**Solución**:
```
1. Limpia datos antiguos:
   → DevTools → Application → IndexedDB
   → Elimina registros viejos

2. O borra toda la base:
   → await db.delete()
   → Vuelve a iniciar sesión
```

---

## 📊 Verificar Estado del Sistema

### Ver datos en cache

```javascript
// Abre consola (F12)

// Ver usuarios en cache
const users = await db.users.toArray();
console.log('Cached users:', users);

// Ver registros de horas
const entries = await db.time_entries.toArray();
console.log('Time entries:', entries);

// Ver cola de sincronización
const queue = await db.sync_queue.toArray();
console.log('Sync queue:', queue);
```

### Ver token guardado

```javascript
// En consola
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decodificar token
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('User ID:', payload.id);
  console.log('Expires:', new Date(payload.exp * 1000));
}
```

### Verificar conexión

```javascript
// Estado de conexión
console.log('Online:', navigator.onLine);

// Escuchar cambios
window.addEventListener('online', () => {
  console.log('✅ Volviste online');
});

window.addEventListener('offline', () => {
  console.log('❌ Te quedaste offline');
});
```

---

## 🔍 Logs de Desarrollo

### Activar logs detallados

Los logs ya están configurados para mostrarse solo en desarrollo:

```javascript
// En modo desarrollo (npm run dev)
✅ Todos los logs se muestran

// En producción (npm run build)
❌ Los logs NO se muestran
```

### Logs importantes a buscar:

**Auth**:
```
"Loading user from cache (offline): [id]"
"User loaded from cache: [email]"
"Usuario no encontrado en cache, ID: [id]"
```

**Time Entries**:
```
"Saving time entry locally: {...}"
"Error saving time entry locally: [error]"
```

**Organizational Units**:
```
"Guardando unidad offline: {...}"
"Error guardando en IndexedDB offline: [error]"
```

---

## 🚨 Errores Críticos

### Si nada funciona:

```javascript
// 1. Limpiar todo
localStorage.clear();
await db.delete();

// 2. Recargar página
location.reload();

// 3. Volver a iniciar sesión con internet
```

---

## 📝 Checklist de Debugging

Cuando algo no funciona offline:

- [ ] ¿Iniciaste sesión con internet al menos una vez?
- [ ] ¿El token está guardado en localStorage?
- [ ] ¿El usuario está en cache (IndexedDB)?
- [ ] ¿Los logs muestran algún error?
- [ ] ¿Estás en modo desarrollo para ver logs?
- [ ] ¿El navegador permite IndexedDB?
- [ ] ¿No estás en modo incógnito?
- [ ] ¿Tienes espacio en disco?

---

## 🎯 Resumen de Fixes

### ✅ Arreglado en esta sesión:

1. **Token JWT**: Usa campo `id` correcto
2. **Cache offline**: Carga usuario desde IndexedDB
3. **Time entries**: Genera `id` automáticamente
4. **Logs**: Solo en desarrollo
5. **Error handling**: Mejor manejo de errores offline

### 🔄 Próximos pasos:

- [ ] Service Worker para mejor offline support
- [ ] Sincronización automática en background
- [ ] Indicador visual de estado offline
- [ ] Resolución de conflictos

---

**Sistema offline ahora funciona correctamente** ✅
