# ⚠️ REGLAS OBLIGATORIAS DE CÓDIGO

**LEER ANTES DE ESCRIBIR CUALQUIER LÍNEA DE CÓDIGO**

---

## 🚫 PROHIBIDO

### **1. NUNCA usar `console.log/error/warn`**
```javascript
❌ console.log('mensaje');
❌ console.error('error');
❌ console.warn('warning');

✅ logger.info('mensaje');
✅ logger.error('error');
✅ logger.warn('warning');
```

### **2. NUNCA hardcodear valores**
```javascript
❌ if (hours < 8)
❌ setTimeout(() => {}, 30000)
❌ const MAX = 5;

✅ if (hours < CONFIG.STANDARD_WORKDAY)
✅ setTimeout(() => {}, SYNC_CONFIG.INTERVAL)
✅ const MAX = VALIDATION.MAX_RETRIES;
```

### **3. NUNCA componentes >250 líneas**
```javascript
❌ Component.jsx - 400 líneas

✅ Component.jsx - 150 líneas (orquestador)
✅ ComponentForm.jsx - 100 líneas
✅ ComponentLogic.js - 50 líneas (helper)
```

### **4. NUNCA repetir código**
```javascript
❌ Copiar/pegar mismo código 2+ veces

✅ Crear función en utils/
✅ Crear helper
✅ Crear componente reutilizable
```

### **5. NUNCA errores silenciosos**
```javascript
❌ catch (e) { }
❌ catch (e) { // TODO }

✅ catch (error) {
  logger.error('Descripción:', error);
  // Manejar error
}
```

---

## ✅ OBLIGATORIO

### **1. SIEMPRE usar logger**
```javascript
import logger from '../../utils/logger';

logger.debug('Debug info');  // Solo DEV
logger.info('Info');          // Solo DEV
logger.warn('Warning');       // Solo DEV
logger.error('Error');        // Solo DEV
logger.critical('Critical');  // SIEMPRE (DEV + PROD)
```

### **2. SIEMPRE usar constantes**
```javascript
import { 
  TIME_ENTRY_STATUS,
  OBJECTIVE_TYPES,
  CONFIG,
  SYNC_CONFIG 
} from '../../constants';

// Usar constantes, NUNCA strings/números directos
```

### **3. SIEMPRE usar helpers existentes**

**Fechas:**
```javascript
import { 
  safeDate,
  parseLocalTime,
  calculateHours,
  extractDate,
  createTimestampWithTimezone 
} from '../../utils/dateHelpers';
```

**Roles:**
```javascript
import { 
  isAdminOrSuperadmin,
  isOperario,
  filterUsersByPermission 
} from '../../utils/roleHelpers';
```

**Reportes:**
```javascript
import { 
  calculateReportMetrics,
  groupByUser,
  groupByUnit 
} from '../../utils/reportCalculations';
```

**Exportación:**
```javascript
import { 
  exportToCSV,
  exportToExcel 
} from '../../utils/exportUtils';
```

### **4. SIEMPRE manejar errores**

**Frontend:**
```javascript
import { handleApiError } from '../../utils/errorHandler';

try {
  await apiCall();
} catch (error) {
  logger.error('Descripción clara:', error);
  const message = handleApiError(error);
  setAlert({ type: 'error', message });
}
```

**Backend:**
```javascript
import { asyncHandler, ValidationError } from '../middleware/errorHandler';

export const myController = asyncHandler(async (req, res) => {
  if (!data) {
    throw new ValidationError('Mensaje claro');
  }
  // lógica
});
```

### **5. SIEMPRE separar responsabilidades**

**Estructura:**
```
Component.jsx          → Solo UI + estado local (max 200 líneas)
utils/componentLogic.js → Lógica de negocio
services/api.js        → Llamadas API
constants/index.js     → Constantes
```

**Ejemplo:**
```javascript
// ❌ MAL - Todo en componente
const Component = () => {
  const calculate = () => { /* 50 líneas */ };
  const validate = () => { /* 30 líneas */ };
  return <div>{ /* 100 líneas */ }</div>;
};

// ✅ BIEN - Separado
import { calculate, validate } from '../../utils/componentLogic';

const Component = () => {
  return <div>{ /* solo UI */ }</div>;
};
```

---

## 📋 CHECKLIST PRE-COMMIT

Antes de hacer commit, verificar:

- [ ] ❌ No hay `console.log/error/warn`
- [ ] ✅ Todos los logs usan `logger`
- [ ] ❌ No hay números/strings hardcodeados
- [ ] ✅ Todas las constantes están en `constants/`
- [ ] ✅ Todos los `try-catch` tienen `logger.error`
- [ ] ✅ Helpers reutilizados (no duplicados)
- [ ] ✅ Componentes <250 líneas
- [ ] ✅ Imports organizados (React → librerías → locales)
- [ ] ✅ Sin código comentado
- [ ] ✅ Sin TODOs sin issue

---

## 🎯 PATRONES OBLIGATORIOS

### **Componente React:**
```javascript
import { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';
import Card from '../common/Card';
import { CONSTANTS } from '../../constants';
import { helper } from '../../utils/helpers';
import logger from '../../utils/logger';

export const Component = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await service.get();
      setState(data);
    } catch (error) {
      logger.error('Error loading data:', error);
    }
  };

  return (
    <Card>
      {/* UI */}
    </Card>
  );
};

export default Component;
```

### **Helper/Util:**
```javascript
/**
 * Descripción clara de qué hace
 * @param {Type} param - Descripción
 * @returns {Type} Descripción
 */
export const helperFunction = (param) => {
  // Lógica pura (sin efectos secundarios)
  return result;
};
```

### **Service:**
```javascript
import api from './api';
import logger from '../utils/logger';

export const getAll = async () => {
  try {
    const { data } = await api.get('/endpoint');
    return data;
  } catch (error) {
    logger.error('Error in getAll:', error);
    throw error;
  }
};
```

### **Controller (Backend):**
```javascript
import { asyncHandler, ValidationError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import * as service from '../services/service';

export const getAll = asyncHandler(async (req, res) => {
  const data = await service.getAll();
  logger.info(`Returned ${data.length} items`);
  res.json(data);
});

export const create = asyncHandler(async (req, res) => {
  const { field } = req.body;
  
  if (!field) {
    throw new ValidationError('Field is required');
  }
  
  const item = await service.create(req.body);
  res.status(201).json(item);
});
```

---

## 🔍 ANTES DE CREAR CÓDIGO NUEVO

### **1. ¿Ya existe un helper para esto?**
```bash
# Buscar en utils/
grep -r "functionName" utils/
```

### **2. ¿Ya existe una constante?**
```bash
# Revisar constants/index.js
```

### **3. ¿Ya existe un componente similar?**
```bash
# Buscar en components/
find components/ -name "*Similar*"
```

### **4. ¿El componente será >200 líneas?**
```
SÍ → Planificar separación ANTES de escribir
NO → Continuar
```

---

## 📁 ESTRUCTURA DE IMPORTS

**Orden obligatorio:**
```javascript
// 1. React y hooks
import { useState, useEffect } from 'react';

// 2. Librerías externas
import { format } from 'date-fns';
import { Icon } from 'lucide-react';

// 3. Componentes locales
import Card from '../common/Card';
import Button from '../common/Button';

// 4. Services
import * as service from '../../services/service';

// 5. Utils y helpers
import { helper } from '../../utils/helpers';
import logger from '../../utils/logger';

// 6. Constantes
import { CONSTANTS } from '../../constants';

// 7. Estilos (si aplica)
import './styles.css';
```

---

## 🚨 ANTI-PATRONES COMUNES

### **❌ NO HACER:**
```javascript
// Hardcoding
const MAX = 5;
if (hours === 8)
setTimeout(() => {}, 30000)

// Console
console.log('debug');

// Errores silenciosos
catch (e) {}

// Componentes gigantes
Component.jsx - 500 líneas

// Código duplicado
function A() { /* lógica */ }
function B() { /* misma lógica */ }

// Lógica en componente
const Component = () => {
  const complexCalculation = () => {
    // 100 líneas de lógica
  };
};

// Strings mágicos
if (status === 'completed')
if (type === 'company')
```

### **✅ HACER:**
```javascript
// Constantes
import { LIMITS } from '../../constants';
const MAX = LIMITS.MAX_RETRIES;

// Logger
logger.debug('debug');

// Manejo de errores
catch (error) {
  logger.error('Context:', error);
  handleError(error);
}

// Componentes pequeños
Component.jsx - 150 líneas
ComponentForm.jsx - 100 líneas

// Helpers reutilizables
import { sharedLogic } from '../../utils/helpers';

// Lógica en utils
import { complexCalculation } from '../../utils/calculations';

// Constantes
import { STATUS, TYPES } from '../../constants';
if (status === STATUS.COMPLETED)
if (type === TYPES.COMPANY)
```

---

## 💾 CONSTANTES DISPONIBLES

**Ubicación:** `frontend/src/constants/index.js`

```javascript
// Estados
TIME_ENTRY_STATUS.PENDING
TIME_ENTRY_STATUS.COMPLETED
TIME_ENTRY_STATUS.REJECTED

// Tipos de objetivos
OBJECTIVE_TYPES.COMPANY
OBJECTIVE_TYPES.ASSIGNED
OBJECTIVE_TYPES.PERSONAL

// Estados de objetivos
OBJECTIVE_STATUS.PLANNED
OBJECTIVE_STATUS.IN_PROGRESS
OBJECTIVE_STATUS.COMPLETED
OBJECTIVE_STATUS.CANCELLED

// Roles
ROLES.SUPERADMIN
ROLES.SENIOR_ADMIN
ROLES.ADMIN
ROLES.OPERARIO

// Configuración
CONFIG.DEFAULT_WORKDAY_START
CONFIG.DEFAULT_WORKDAY_END
CONFIG.APP_NAME
CONFIG.VERSION
```

---

## 🎯 RESUMEN DE 1 MINUTO

**ANTES de escribir código:**
1. ✅ ¿Existe helper? → Usar
2. ✅ ¿Existe constante? → Usar
3. ✅ ¿Será >200 líneas? → Separar
4. ✅ Import logger
5. ✅ Planificar try-catch

**AL escribir código:**
1. ❌ NO console.*
2. ❌ NO hardcodear
3. ❌ NO duplicar
4. ✅ SÍ logger
5. ✅ SÍ constantes
6. ✅ SÍ helpers

**DESPUÉS de escribir código:**
1. ✅ Revisar imports
2. ✅ Verificar errores manejados
3. ✅ Verificar <250 líneas
4. ✅ Verificar sin console.*
5. ✅ Verificar sin hardcoding

---

**ESTE DOCUMENTO ES LEY. NO HAY EXCEPCIONES.**
