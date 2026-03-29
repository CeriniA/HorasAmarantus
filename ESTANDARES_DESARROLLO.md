# 📘 ESTÁNDARES DE DESARROLLO - Sistema Horas

## 🎯 PRINCIPIOS FUNDAMENTALES

### 1. DRY (Don't Repeat Yourself)
**NUNCA duplicar código. SIEMPRE crear helpers/componentes reutilizables.**

### 2. Single Source of Truth
**NUNCA hardcodear valores. SIEMPRE usar constantes centralizadas.**

### 3. Separation of Concerns
**NUNCA mezclar lógica de negocio con UI. SIEMPRE separar en capas.**

### 4. KISS (Keep It Simple, Stupid)
**NUNCA sobre-complicar. SIEMPRE buscar la solución más simple.**

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes genéricos (Button, Modal, etc.)
│   ├── layout/         # Layout components (Navbar, Sidebar, etc.)
│   └── [feature]/      # Componentes específicos por feature
├── pages/              # Páginas/vistas principales
├── hooks/              # Custom hooks reutilizables
├── context/            # React Context providers
├── services/           # Servicios de API y lógica de negocio
├── utils/              # Funciones utilitarias
├── constants/          # Constantes y configuración
├── offline/            # Lógica de sincronización offline
└── styles/             # Estilos globales
```

---

## 🚫 REGLAS ESTRICTAS

### NUNCA Hacer:

#### 1. NUNCA Hardcodear Valores

```javascript
// ❌ MAL
if (user.role === 'admin') { }
const hours = 8;
alert('Usuario creado');

// ✅ BIEN
if (user.role === USER_ROLES.ADMIN) { }
const hours = CONFIG.DEFAULT_WORKDAY_HOURS;
showSuccess(MESSAGES.USER_CREATED_SUCCESS);
```

#### 2. NUNCA Duplicar Código

```javascript
// ❌ MAL - Repetido en 5 archivos
if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) {
  // ...
}

// ✅ BIEN - Una sola función
if (isAdminOrSuperadmin(user)) {
  // ...
}
```

#### 3. NUNCA Verificar Roles Inline

```javascript
// ❌ MAL
{user?.role === USER_ROLES.ADMIN && <AdminPanel />}

// ✅ BIEN
const { isAdmin } = usePermissions();
{isAdmin() && <AdminPanel />}
```

#### 4. NUNCA Usar alert/confirm Directamente

```javascript
// ❌ MAL
alert('Usuario creado');
if (confirm('¿Eliminar?')) { }

// ✅ BIEN
showSuccess(MESSAGES.USER_CREATED_SUCCESS);
const confirmed = await confirmDialog(MESSAGES.CONFIRM_DELETE_USER(user.name));
```

#### 5. NUNCA Crear Componentes Inline

```javascript
// ❌ MAL
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>

// ✅ BIEN
<LoadingSpinner />
```

#### 6. NUNCA Usar Hooks en Orden Incorrecto

```javascript
// ❌ MAL - useEffect usa función que no existe aún
export const MyHook = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    loadData(); // ❌ ERROR: loadData no existe aún
  }, [loadData]);
  
  const loadData = useCallback(async () => {
    // ...
  }, []);
};

// ✅ BIEN - Definir callbacks ANTES de usarlos
export const MyHook = () => {
  const [data, setData] = useState([]);
  
  // 1. Definir callback primero
  const loadData = useCallback(async () => {
    // ...
  }, []);
  
  // 2. Usar en useEffect después
  useEffect(() => {
    loadData();
  }, [loadData]);
};
```

**ORDEN CORRECTO DE HOOKS:**
1. `useState` - Estados
2. `useCallback`, `useMemo` - Callbacks y valores memorizados
3. `useEffect` - Efectos secundarios

---

## ✅ REGLAS OBLIGATORIAS

### SIEMPRE Hacer:

#### 1. SIEMPRE Usar Constantes

```javascript
// Importar constantes
import { USER_ROLES } from '../constants';
import { CONFIG } from '../constants/config';
import { MESSAGES } from '../constants/messages';

// Usar en código
const role = USER_ROLES.ADMIN;
const maxLength = CONFIG.MAX_USERNAME_LENGTH;
showError(MESSAGES.INVALID_EMAIL);
```

#### 2. SIEMPRE Usar Helpers

```javascript
// Importar helpers
import { isAdminOrSuperadmin, filterUsersByPermission } from '../utils/roleHelpers';
import { isValidEmail, isValidPassword } from '../utils/validationHelpers';
import { isDateInRange } from '../utils/dateHelpers';

// Usar en código
if (isAdminOrSuperadmin(user)) { }
const filteredUsers = filterUsersByPermission(users, currentUser);
if (!isValidEmail(email)) { }
```

#### 3. SIEMPRE Usar Custom Hooks

```javascript
// Para permisos
const { can, isAdmin, isSuperadmin } = usePermissions();

// Para formularios
const { values, errors, handleChange, validate } = useForm(initialValues, validationRules);

// Para confirmaciones
const { confirm } = useConfirm();
```

#### 4. SIEMPRE Usar Componentes Reutilizables

```javascript
// Loading
<LoadingSpinner size="md" text="Cargando usuarios..." />

// Badges
<RoleBadge role={user.role} />

// Confirmaciones
<ConfirmDialog
  isOpen={isOpen}
  onConfirm={handleDelete}
  message={MESSAGES.CONFIRM_DELETE_USER(user.name)}
/>
```

#### 5. SIEMPRE Validar Datos

```javascript
// Validar antes de enviar
const { isValid, missingFields } = validateRequiredFields(data, ['username', 'name']);
if (!isValid) {
  showError(MESSAGES.REQUIRED_FIELDS_SPECIFIC(missingFields));
  return;
}

if (!isValidEmail(data.email)) {
  showError(MESSAGES.INVALID_EMAIL);
  return;
}
```

---

## 📝 PATRONES DE CÓDIGO

### 1. Componentes

```javascript
import { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { USER_ROLES } from '../constants';
import { MESSAGES } from '../constants/messages';
import { showSuccess, showError } from '../utils/notificationHelpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

export const MyComponent = () => {
  // 1. Hooks primero
  const { isAdmin } = usePermissions();
  const [loading, setLoading] = useState(false);
  
  // 2. Funciones de manejo
  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Lógica...
      showSuccess(MESSAGES.USER_CREATED_SUCCESS);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 3. Renderizado condicional
  if (loading) return <LoadingSpinner />;
  
  // 4. Render principal
  return (
    <div>
      {isAdmin() && <AdminPanel />}
      <Button onClick={handleSubmit}>Guardar</Button>
    </div>
  );
};
```

---

### 2. Custom Hooks

```javascript
import { useState, useEffect, useCallback } from 'react';
import { showError } from '../utils/notificationHelpers';
import { MESSAGES } from '../constants/messages';

export const useMyHook = (param) => {
  // 1. Estados primero
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 2. Callbacks después (ANTES de useEffect)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Lógica...
      setData(result);
    } catch (err) {
      setError(err.message);
      showError(MESSAGES.ERROR_LOADING_DATA);
    } finally {
      setLoading(false);
    }
  }, [param]); // Dependencias del callback
  
  // 3. Effects al final (DESPUÉS de definir callbacks)
  useEffect(() => {
    loadData();
  }, [loadData]); // Ahora loadData existe
  
  return {
    data,
    loading,
    error,
    reload: loadData
  };
};
```

---

### 3. Helpers

```javascript
/**
 * Descripción clara de qué hace la función
 * @param {Type} param - Descripción del parámetro
 * @returns {Type} - Descripción del retorno
 */
export const myHelper = (param) => {
  // Validar parámetros
  if (!param) return null;
  
  // Lógica simple y clara
  const result = doSomething(param);
  
  return result;
};
```

---

## 🎨 ESTILOS Y UI

### 1. Usar Tailwind Consistentemente

```javascript
// ✅ BIEN - Clases consistentes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ MAL - Mezclar estilos inline
<div style={{display: 'flex'}} className="p-4">
```

### 2. Usar Componentes de Design System

```javascript
// ✅ BIEN
<Button variant="primary" size="md">Guardar</Button>
<Input label="Email" type="email" />
<Card title="Usuarios">...</Card>

// ❌ MAL - Crear botones custom cada vez
<button className="bg-blue-500 text-white px-4 py-2 rounded">Guardar</button>
```

---

## 🧪 TESTING

### 1. Nombrar Tests Claramente

```javascript
describe('roleHelpers', () => {
  describe('isAdminOrSuperadmin', () => {
    it('retorna true para admin', () => {
      const user = { role: USER_ROLES.ADMIN };
      expect(isAdminOrSuperadmin(user)).toBe(true);
    });
    
    it('retorna false para operario', () => {
      const user = { role: USER_ROLES.OPERARIO };
      expect(isAdminOrSuperadmin(user)).toBe(false);
    });
  });
});
```

---

## 📚 DOCUMENTACIÓN

### 1. Comentar Funciones Complejas

```javascript
/**
 * Filtra usuarios según los permisos del usuario actual.
 * 
 * - Superadmin: ve todos los usuarios
 * - Admin: solo ve operarios
 * - Operario: no ve selector
 * 
 * @param {Array} users - Lista de todos los usuarios
 * @param {Object} currentUser - Usuario actual con rol
 * @returns {Array} - Usuarios filtrados según permisos
 */
export const filterUsersByPermission = (users, currentUser) => {
  // ...
};
```

### 2. Comentar Lógica de Negocio

```javascript
// Validar que las horas por tarea coincidan con el rango horario
// Tolerancia de 5 minutos para evitar errores de redondeo
const diff = Math.abs(workdayHours - totalHours);
if (diff > 0.08) {
  showError(MESSAGES.HOURS_MISMATCH(totalHours, workdayHours));
  return;
}
```

---

## 🔒 SEGURIDAD

### 1. NUNCA Exponer Datos Sensibles

```javascript
// ❌ MAL
console.log('Password:', password);
localStorage.setItem('token', token);

// ✅ BIEN
if (CONFIG.DEBUG_MODE) {
  console.log('Login attempt for user:', username);
}
// Tokens en httpOnly cookies o secure storage
```

### 2. SIEMPRE Validar en Backend

```javascript
// Frontend: validación de UX
if (!isValidEmail(email)) {
  showError(MESSAGES.INVALID_EMAIL);
  return;
}

// Backend: validación de seguridad (SIEMPRE)
```

---

## 🚀 PERFORMANCE

### 1. Usar useMemo para Cálculos Costosos

```javascript
const filteredData = useMemo(() => {
  return data.filter(item => /* lógica compleja */);
}, [data, filters]);
```

### 2. Usar useCallback para Funciones

```javascript
const handleClick = useCallback(() => {
  // Lógica...
}, [dependencies]);
```

### 3. Lazy Loading para Rutas

```javascript
const Reports = lazy(() => import('./pages/Reports'));
```

---

## 📋 CHECKLIST ANTES DE COMMIT

### Código:
- [ ] No hay código duplicado
- [ ] No hay valores hardcodeados
- [ ] Se usan constantes de `constants/`
- [ ] Se usan helpers de `utils/`
- [ ] Se usan componentes reutilizables
- [ ] Se usan custom hooks cuando corresponde

### React Hooks:
- [ ] **Orden correcto: useState → useCallback/useMemo → useEffect**
- [ ] Callbacks definidos ANTES de usarlos en useEffect
- [ ] Todas las dependencias incluidas en arrays de dependencias
- [ ] No hay warnings de React Hooks

### Calidad:
- [ ] Código está documentado
- [ ] No hay console.logs en producción
- [ ] No hay warnings de ESLint
- [ ] Funciona en modo offline
- [ ] Funciona en móvil

---

## 🎯 RESUMEN

### NUNCA:
- ❌ Hardcodear valores
- ❌ Duplicar código
- ❌ Verificar roles inline
- ❌ Usar alert/confirm directo
- ❌ Crear componentes inline
- ❌ **Usar hooks en orden incorrecto**

### SIEMPRE:
- ✅ Usar constantes
- ✅ Usar helpers
- ✅ Usar custom hooks
- ✅ Usar componentes reutilizables
- ✅ Validar datos
- ✅ Documentar
- ✅ Pensar en reutilización
- ✅ **Definir callbacks ANTES de useEffect**

---

## 📞 CONTACTO

Si tienes dudas sobre cómo implementar algo:
1. Revisa este documento
2. Busca ejemplos en el código existente
3. Crea un helper/componente reutilizable
4. Documenta tu solución

**Recuerda: Código limpio = Código mantenible = Código profesional**

---

**Última actualización:** 29 de marzo de 2026  
**Última regla agregada:** Orden correcto de React Hooks (useState → useCallback → useEffect)
