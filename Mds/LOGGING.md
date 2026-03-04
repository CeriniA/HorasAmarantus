# 📝 Sistema de Logging

## 🎯 Estrategia de Logs

### Desarrollo
- ✅ Todos los logs se muestran en consola
- ✅ Útil para debugging
- ✅ Información detallada de errores

### Producción
- ❌ Los logs normales NO se muestran
- ✅ Solo errores críticos se muestran
- ✅ Mejor rendimiento
- ✅ No expone información sensible

---

## 🔧 Uso del Logger

### Importar el Logger

```javascript
import logger from '../utils/logger';
```

### Métodos Disponibles

#### `logger.log()` - Información general
```javascript
logger.log('Usuario creado:', userData);
logger.log('Response from backend:', response);
```

#### `logger.error()` - Errores
```javascript
logger.error('Error loading data:', error);
logger.error('Validation failed:', validationErrors);
```

#### `logger.warn()` - Advertencias
```javascript
logger.warn('Cache desactualizado');
logger.warn('Token próximo a expirar');
```

#### `logger.info()` - Información importante
```javascript
logger.info('Sincronización completada');
logger.info('Usuario autenticado');
```

#### `logger.debug()` - Debugging detallado
```javascript
logger.debug('Estado actual:', state);
logger.debug('Props recibidos:', props);
```

#### `logger.critical()` - Errores críticos (SIEMPRE se muestran)
```javascript
logger.critical('Error fatal en la aplicación:', error);
logger.critical('Fallo de autenticación crítico');
```

---

## 📋 Cuándo Usar Cada Nivel

### `log` - Desarrollo normal
- Respuestas de API
- Flujo de datos
- Estado de componentes

### `error` - Errores recuperables
- Errores de red
- Validaciones fallidas
- Errores de cache

### `warn` - Situaciones anormales
- Datos faltantes
- Configuración incorrecta
- Deprecaciones

### `info` - Eventos importantes
- Login/Logout
- Sincronizaciones
- Operaciones exitosas

### `debug` - Debugging profundo
- Estado interno
- Props y parámetros
- Flujo de ejecución

### `critical` - Errores graves
- Fallo total de la app
- Errores de seguridad
- Pérdida de datos

---

## ✅ Ejemplo de Uso

### Antes (sin logger)
```javascript
try {
  const data = await api.getData();
  console.log('Data loaded:', data);
} catch (error) {
  console.error('Error:', error);
}
```

### Después (con logger)
```javascript
import logger from '../utils/logger';

try {
  const data = await api.getData();
  logger.log('Data loaded:', data);
} catch (error) {
  logger.error('Error loading data:', error);
}
```

---

## 🔒 Seguridad

### ❌ NO hacer en producción
```javascript
// Expone información sensible
console.log('Password:', password);
console.log('Token:', token);
console.log('User data:', sensitiveData);
```

### ✅ Hacer
```javascript
// Usa logger que oculta en producción
logger.log('Login attempt for:', email); // Solo email, no password
logger.debug('Token length:', token?.length); // Solo longitud, no token
```

---

## 🎨 Configuración de Vite

El logger usa `import.meta.env.DEV` que Vite configura automáticamente:

- **Desarrollo**: `npm run dev` → `DEV = true`
- **Producción**: `npm run build` → `DEV = false`

No necesitas configurar nada adicional.

---

## 📊 Monitoreo en Producción

Para producción, considera usar servicios de monitoreo:

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Logs y métricas
- **New Relic** - APM

Ejemplo con Sentry:
```javascript
import * as Sentry from '@sentry/react';

logger.critical('Error crítico', error);
Sentry.captureException(error);
```

---

## 🧪 Testing

En tests, puedes mockear el logger:

```javascript
import logger from '../utils/logger';

jest.mock('../utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

test('should log error', () => {
  // ... tu test
  expect(logger.error).toHaveBeenCalledWith('Error message');
});
```

---

## ✨ Beneficios

- ✅ **Rendimiento**: Sin logs en producción
- ✅ **Seguridad**: No expone información sensible
- ✅ **Consistencia**: Mismo patrón en todo el código
- ✅ **Debugging**: Fácil activar/desactivar logs
- ✅ **Mantenimiento**: Un solo lugar para cambiar comportamiento

---

## 🔄 Migración

Para migrar código existente:

1. Importa el logger
2. Reemplaza `console.log` → `logger.log`
3. Reemplaza `console.error` → `logger.error`
4. Usa `logger.critical` para errores graves

---

**Usa el logger en todo el código nuevo** 🎉
