# 📋 Guía de Sistema de Logs

## ✅ Sistema Implementado

Se ha creado un **sistema de logs centralizado** para frontend y backend que:
- ✅ En **DEV**: Muestra todos los logs
- ✅ En **PROD**: Solo muestra errores críticos
- ✅ Formato consistente con timestamps
- ✅ Colores en backend para mejor legibilidad

---

## 🎨 Frontend - `logger.js`

### Importar
```javascript
import logger from '../utils/logger';
```

### Uso
```javascript
// Información general (solo DEV)
logger.info('Usuario logueado:', user);

// Debug detallado (solo DEV)
logger.debug('Estado actual:', state);

// Advertencias (solo DEV)
logger.warn('Advertencia:', message);

// Errores (solo DEV)
logger.error('Error en API:', error);

// Errores críticos (SIEMPRE, incluso PROD)
logger.critical('Error fatal:', error);
```

---

## 🖥️ Backend - `logger.js`

### Importar
```javascript
const logger = require('./utils/logger');
```

### Uso
```javascript
// Información (solo DEV)
logger.info('Servidor iniciado en puerto', port);

// Debug (solo DEV)
logger.debug('Query ejecutada:', query);

// Advertencias (DEV y PROD)
logger.warn('Token expirado para usuario:', userId);

// Errores (DEV y PROD)
logger.error('Error en DB:', error);

// Críticos (SIEMPRE)
logger.critical('Base de datos no disponible');

// Éxito (solo DEV)
logger.success('Usuario creado exitosamente');
```

---

## 🔄 Migración de console.log a logger

### ❌ ANTES (Incorrecto)
```javascript
console.log('Usuario logueado:', user);
console.error('Error:', error);
if (import.meta.env.DEV) console.log('Debug:', data);
```

### ✅ DESPUÉS (Correcto)
```javascript
logger.info('Usuario logueado:', user);
logger.error('Error:', error);
logger.debug('Debug:', data);
```

---

## 📊 Estadísticas Actuales

### Frontend
- **251 console.log** encontrados en 30 archivos
- Archivos con más logs:
  - `syncDebug.js` (41)
  - `dbDebug.js` (32)
  - `useTimeEntries.js` (25)
  - `SyncManager.js` (19)

### Backend
- Pendiente de auditoría

---

## 🚀 Plan de Migración

### Fase 1: Archivos Críticos (HECHO)
- ✅ `useTimeEntries.js` - Ya usa `if (import.meta.env.DEV)`
- ✅ Logger creado en frontend y backend

### Fase 2: Archivos de Sincronización (PENDIENTE)
- [ ] `SyncManager.js`
- [ ] `SyncQueue.js`
- [ ] `IdMappingService.js`
- [ ] `ConnectivityService.js`

### Fase 3: Hooks y Servicios (PENDIENTE)
- [ ] `useOrganizationalUnits.js`
- [ ] `useOffline.js`
- [ ] `useAuth.js`
- [ ] `api.js`

### Fase 4: Componentes (PENDIENTE)
- [ ] `BulkTimeEntry.jsx`
- [ ] `TimeEntries.jsx`
- [ ] Otros componentes

### Fase 5: Backend (PENDIENTE)
- [ ] Auditar y reemplazar console.log
- [ ] Implementar logger en rutas
- [ ] Implementar logger en controladores

---

## 🛠️ Comando de Reemplazo Automático

**NO ejecutar aún - requiere revisión manual primero**

```bash
# Buscar todos los console.log
grep -r "console\.log" frontend/src --exclude-dir=node_modules

# Reemplazar (CUIDADO - revisar antes)
find frontend/src -type f -name "*.js" -o -name "*.jsx" | \
  xargs sed -i 's/console\.log/logger.info/g'
```

---

## ⚠️ Notas Importantes

1. **NO reemplazar automáticamente** - Algunos console.log son parte de debug tools
2. **Revisar contexto** - Algunos logs deben ser `error`, otros `info`, otros `debug`
3. **Agregar imports** - Cada archivo necesita `import logger from '../utils/logger'`
4. **Errores críticos** - Solo usar `logger.critical()` para errores que requieren atención inmediata

---

## 📝 Próximos Pasos

1. ✅ Logger creado
2. ⏳ Migrar archivos de sincronización manualmente
3. ⏳ Migrar hooks y servicios
4. ⏳ Migrar componentes
5. ⏳ Auditar backend
6. ⏳ Documentar patrones de logging

---

**Última actualización:** 2026-03-29
