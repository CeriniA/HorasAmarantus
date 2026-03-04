# 📱 Modo Offline - Guía de Uso

## 🎯 Cómo Funciona el Modo Offline

### ✅ Lo que SÍ puedes hacer offline:

1. **Navegar la app** si ya iniciaste sesión
2. **Ver datos cacheados**:
   - Tus registros de horas
   - Unidades organizacionales
   - Tu perfil de usuario
3. **Crear registros de horas** (se sincronizan al volver online)
4. **Editar registros** (se sincronizan al volver online)
5. **Eliminar registros** (se sincronizan al volver online)

### ❌ Lo que NO puedes hacer offline:

1. **Login inicial** - Requiere conexión al servidor
2. **Registro de nuevos usuarios** - Requiere conexión
3. **Ver datos de otros usuarios** - Solo datos cacheados
4. **Actualizar perfil** - Requiere conexión

---

## 🔐 Autenticación Offline

### Primer Login (REQUIERE INTERNET)

```
1. Conecta a internet
2. Inicia sesión con email y password
3. El sistema guarda:
   ✅ Token de autenticación
   ✅ Datos de tu perfil
   ✅ Datos necesarios en cache
```

### Sesiones Posteriores (FUNCIONA OFFLINE)

```
1. Si ya iniciaste sesión antes
2. Y tienes el token guardado
3. Puedes usar la app offline
4. El sistema carga datos desde cache
```

---

## 💾 Datos en Cache

### ¿Qué se guarda en cache?

- **Tu perfil de usuario**
- **Tus registros de horas**
- **Unidades organizacionales**
- **Token de autenticación**

### ¿Dónde se guarda?

- **IndexedDB** del navegador
- **localStorage** para el token
- Datos persisten entre sesiones

---

## 🔄 Sincronización

### Cuando vuelves online:

1. **Automáticamente** se sincronizan los cambios
2. **Registros creados offline** → Se envían al servidor
3. **Registros editados offline** → Se actualizan en servidor
4. **Registros eliminados offline** → Se eliminan en servidor

### Cola de Sincronización:

```javascript
// Los cambios offline se guardan en una cola
{
  entity_type: 'time_entry',
  action: 'create',
  data: { ... },
  pending: true
}
```

---

## 🧪 Cómo Probar Modo Offline

### Opción 1: DevTools

```
1. Abre DevTools (F12)
2. Ve a Network tab
3. Marca "Offline"
4. Prueba la app
```

### Opción 2: Desconectar WiFi

```
1. Desconecta WiFi/Ethernet
2. Prueba la app
3. Reconecta
4. Verifica sincronización
```

---

## ⚠️ Limitaciones y Consideraciones

### 1. Login Inicial

**Problema**: No puedes hacer login por primera vez sin internet.

**Solución**: 
- Inicia sesión con internet al menos una vez
- Luego podrás usar la app offline

**Mensaje de Error**:
```
"No hay conexión a internet. El login requiere conexión."
```

### 2. Token Expirado

**Problema**: Si el token expira mientras estás offline.

**Solución**:
- Conecta a internet
- Vuelve a iniciar sesión
- El sistema renovará el token

### 3. Conflictos de Datos

**Problema**: Cambios offline pueden entrar en conflicto con cambios online.

**Solución Actual**:
- Último cambio gana (last-write-wins)
- En futuras versiones: resolución de conflictos

### 4. Límites de Almacenamiento

**Problema**: IndexedDB tiene límites de almacenamiento.

**Límites típicos**:
- Chrome: ~60% del espacio en disco disponible
- Firefox: ~50% del espacio en disco disponible
- Safari: ~1GB

---

## 📊 Indicadores de Estado

### Detectar si estás offline:

```javascript
// En el código
if (!navigator.onLine) {
  console.log('Estás offline');
}

// Escuchar cambios
window.addEventListener('online', () => {
  console.log('Volviste online');
});

window.addEventListener('offline', () => {
  console.log('Te quedaste offline');
});
```

### UI Recomendada:

- **Banner** indicando "Sin conexión"
- **Icono** de estado de red
- **Mensaje** al intentar acciones que requieren internet

---

## 🔧 Troubleshooting

### "No puedo hacer login offline"

✅ **Esto es normal**. El login inicial requiere internet.

**Solución**:
1. Conecta a internet
2. Inicia sesión
3. Luego podrás usar offline

### "Mis cambios no se guardaron"

❌ **Verifica**:
1. ¿Tienes espacio en disco?
2. ¿El navegador permite IndexedDB?
3. ¿Estás en modo incógnito? (puede limitar storage)

**Solución**:
- Usa navegador normal (no incógnito)
- Libera espacio en disco
- Verifica permisos del navegador

### "Los datos no se sincronizan"

❌ **Verifica**:
1. ¿Volviste online?
2. ¿El servidor está disponible?
3. ¿Tu token es válido?

**Solución**:
- Espera a que haya conexión estable
- Recarga la página
- Vuelve a iniciar sesión si es necesario

---

## 🎨 Mejores Prácticas

### Para Usuarios:

1. **Inicia sesión con internet** al menos una vez
2. **Espera a sincronizar** antes de cerrar la app
3. **Verifica el estado** de sincronización
4. **No borres datos del navegador** si tienes cambios pendientes

### Para Desarrolladores:

1. **Siempre cachea** datos importantes
2. **Valida conexión** antes de operaciones críticas
3. **Muestra indicadores** de estado offline
4. **Implementa cola** de sincronización
5. **Maneja errores** de red gracefully

---

## 🚀 Roadmap Futuro

### Funcionalidades Planeadas:

- [ ] **Resolución de conflictos** inteligente
- [ ] **Sincronización incremental** (solo cambios)
- [ ] **Compresión de datos** en cache
- [ ] **Limpieza automática** de cache antiguo
- [ ] **Indicador visual** de sincronización
- [ ] **Retry automático** con backoff exponencial
- [ ] **Service Worker** para mejor offline support

---

## 📝 Resumen

### ✅ Modo Offline Funciona Para:

- Usuarios que ya iniciaron sesión
- Ver y crear registros de horas
- Trabajar con datos cacheados
- Sincronizar al volver online

### ❌ Modo Offline NO Funciona Para:

- Login inicial (requiere internet)
- Registro de usuarios nuevos
- Datos en tiempo real de otros usuarios

---

**El modo offline está diseñado para trabajadores de campo que pueden perder conexión temporalmente** 🌾📱
