# 🔧 REFACTORIZACIÓN: Código Limpio y Buenas Prácticas

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. CÓDIGO DUPLICADO

#### A. Verificaciones de Rol Repetidas
```javascript
// Se repite en 10+ archivos ❌
user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN
user?.role === 'admin' || user?.role === 'superadmin'  // Peor: hardcoded
currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
```

#### B. Filtrado de Usuarios Duplicado
```javascript
// BulkTimeEntry.jsx
if (currentUser?.role === 'superadmin') {
  return users;
}
if (currentUser?.role === 'admin') {
  return users.filter(u => u.role === 'operario');
}

// Reports.jsx - MISMO CÓDIGO
if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) {
  const { users: usersData } = await usersService.getAll();
}
```

#### C. Validaciones de Fecha Repetidas
```javascript
// Se repite en múltiples componentes
const entryDate = safeDate(entry.start_time);
const start = new Date(`${startDate}T00:00:00`);
const end = new Date(`${endDate}T23:59:59`);
return entryDate >= start && entryDate <= end;
```

#### D. Badges de Rol Duplicados
```javascript
// UserManagement.jsx
const getRoleBadgeColor = (role) => {
  switch (role) {
    case USER_ROLES.SUPERADMIN: return 'bg-purple-100 text-purple-800';
    case USER_ROLES.ADMIN: return 'bg-blue-100 text-blue-800';
    // ...
  }
};

// Se repite en otros componentes
```

---

### 2. HARDCODING

#### A. Strings Hardcodeados
```javascript
// ❌ MAL
user?.role === 'admin'
user?.role === 'superadmin'
user?.role === 'operario'

// ✅ BIEN
user?.role === USER_ROLES.ADMIN
```

#### B. Magic Numbers
```javascript
// ❌ MAL
const [workdayStart, setWorkdayStart] = useState('08:00');
const [workdayEnd, setWorkdayEnd] = useState('16:00');

// ✅ BIEN
const [workdayStart, setWorkdayStart] = useState(DEFAULT_WORKDAY_START);
```

#### C. Mensajes Hardcodeados
```javascript
// ❌ MAL
alert('No tienes permisos para editar este usuario');
alert('Usuario eliminado exitosamente');

// ✅ BIEN
showNotification(MESSAGES.NO_PERMISSION);
showNotification(MESSAGES.USER_DELETED_SUCCESS);
```

---

### 3. LÓGICA REPETIDA

#### A. Verificación de Permisos
```javascript
// Se repite en múltiples componentes
if (!can('edit', 'users', user)) {
  alert('No tienes permisos');
  return;
}
```

#### B. Manejo de Errores
```javascript
// Patrón repetido en todos los hooks
catch (err) {
  console.error('Error:', err);
  setError(err.message);
  return { success: false, error: err.message };
}
```

---

### 4. COMPONENTES NO REUTILIZABLES

- Loading spinners duplicados
- Modales con lógica repetida
- Formularios con validaciones duplicadas

---

## ✅ SOLUCIONES

### 1. CREAR HELPERS CENTRALIZADOS

#### A. `src/utils/roleHelpers.js`

```javascript
import { USER_ROLES } from '../constants';

/**
 * Verificar si el usuario es admin o superadmin
 */
export const isAdminOrSuperadmin = (user) => {
  if (!user) return false;
  return user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN;
};

/**
 * Verificar si el usuario es superadmin
 */
export const isSuperadmin = (user) => {
  if (!user) return false;
  return user.role === USER_ROLES.SUPERADMIN;
};

/**
 * Verificar si el usuario es operario
 */
export const isOperario = (user) => {
  if (!user) return false;
  return user.role === USER_ROLES.OPERARIO;
};

/**
 * Filtrar usuarios según rol del usuario actual
 */
export const filterUsersByPermission = (users, currentUser) => {
  if (!users || !currentUser) return [];
  
  if (isSuperadmin(currentUser)) {
    return users; // Ve todos
  }
  
  if (currentUser.role === USER_ROLES.ADMIN) {
    return users.filter(u => u.role === USER_ROLES.OPERARIO); // Solo operarios
  }
  
  return []; // Operarios no ven selector
};

/**
 * Obtener color de badge según rol
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    [USER_ROLES.SUPERADMIN]: 'bg-purple-100 text-purple-800',
    [USER_ROLES.ADMIN]: 'bg-blue-100 text-blue-800',
    [USER_ROLES.OPERARIO]: 'bg-green-100 text-green-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};
```

---

#### B. `src/utils/dateHelpers.js` (MEJORAR EXISTENTE)

```javascript
/**
 * Verificar si una fecha está en un rango
 */
export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = safeDate(date);
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  
  return checkDate >= start && checkDate <= end;
};

/**
 * Validar que una fecha sea válida
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
};
```

---

#### C. `src/utils/validationHelpers.js` (NUEVO)

```javascript
/**
 * Validar email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar password
 */
export const isValidPassword = (password) => {
  if (!password) return false;
  return password.length >= 6; // Mínimo 6 caracteres
};

/**
 * Validar campos requeridos
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      missing.push(field);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};
```

---

#### D. `src/utils/notificationHelpers.js` (NUEVO)

```javascript
/**
 * Mostrar notificación de éxito
 */
export const showSuccess = (message) => {
  // Por ahora usar alert, luego reemplazar con toast
  alert(`✅ ${message}`);
};

/**
 * Mostrar notificación de error
 */
export const showError = (message) => {
  alert(`❌ ${message}`);
};

/**
 * Mostrar notificación de advertencia
 */
export const showWarning = (message) => {
  alert(`⚠️ ${message}`);
};

/**
 * Pedir confirmación
 */
export const confirm = (message) => {
  return window.confirm(message);
};
```

---

### 2. CREAR CONSTANTES CENTRALIZADAS

#### A. `src/constants/messages.js` (NUEVO)

```javascript
export const MESSAGES = {
  // Éxito
  USER_CREATED_SUCCESS: 'Usuario creado exitosamente',
  USER_UPDATED_SUCCESS: 'Usuario actualizado exitosamente',
  USER_DELETED_SUCCESS: 'Usuario eliminado exitosamente',
  ENTRY_CREATED_SUCCESS: 'Registro creado exitosamente',
  ENTRY_UPDATED_SUCCESS: 'Registro actualizado exitosamente',
  ENTRY_DELETED_SUCCESS: 'Registro eliminado exitosamente',
  
  // Errores
  NO_PERMISSION: 'No tienes permisos para realizar esta acción',
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  REQUIRED_FIELDS: 'Por favor completa todos los campos requeridos',
  INVALID_EMAIL: 'El email no es válido',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 6 caracteres',
  
  // Confirmaciones
  CONFIRM_DELETE_USER: (name) => `¿Estás seguro de eliminar al usuario ${name}?`,
  CONFIRM_DELETE_ENTRY: 'Estás seguro de eliminar este registro?',
  
  // Offline
  SAVED_OFFLINE: 'Guardado localmente (se sincronizará cuando haya conexión)',
  SYNCING: 'Sincronizando...',
  SYNC_COMPLETE: 'Sincronización completada'
};
```

---

#### B. `src/constants/config.js` (NUEVO)

```javascript
export const CONFIG = {
  // Horarios por defecto
  DEFAULT_WORKDAY_START: '08:00',
  DEFAULT_WORKDAY_END: '16:00',
  
  // Validaciones
  MIN_PASSWORD_LENGTH: 6,
  MAX_USERNAME_LENGTH: 50,
  
  // Paginación
  DEFAULT_PAGE_SIZE: 20,
  
  // Sincronización
  SYNC_RETRY_DELAY: 5000, // 5 segundos
  MAX_SYNC_RETRIES: 3,
  
  // Cache
  CACHE_EXPIRATION: 60 * 60 * 1000, // 1 hora
  
  // UI
  TOAST_DURATION: 3000, // 3 segundos
  DEBOUNCE_DELAY: 300 // 300ms
};
```

---

### 3. CREAR COMPONENTES REUTILIZABLES

#### A. `src/components/common/LoadingSpinner.jsx`

```javascript
export const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col justify-center items-center h-64">
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizes[size]}`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};
```

---

#### B. `src/components/common/RoleBadge.jsx`

```javascript
import { getRoleBadgeColor } from '../../utils/roleHelpers';
import { USER_ROLE_LABELS } from '../../constants';

export const RoleBadge = ({ role }) => {
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor(role)}`}>
      {USER_ROLE_LABELS[role] || role}
    </span>
  );
};
```

---

#### C. `src/components/common/ConfirmDialog.jsx`

```javascript
import Modal from './Modal';
import Button from './Button';

export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p className="text-gray-700 mb-6">{message}</p>
      
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
```

---

### 4. MEJORAR usePermissions

Ya existe pero debe usarse SIEMPRE en lugar de verificaciones inline:

```javascript
// ❌ MAL
{(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) && (
  <Link to="/users">Usuarios</Link>
)}

// ✅ BIEN
const { isAdmin } = usePermissions();

{isAdmin() && (
  <Link to="/users">Usuarios</Link>
)}
```

---

### 5. CREAR CUSTOM HOOKS REUTILIZABLES

#### A. `src/hooks/useForm.js`

```javascript
import { useState } from 'react';

export const useForm = (initialValues, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar campo
    if (validationRules[name]) {
      const error = validationRules[name](values[name], values);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](values[field], values);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValues,
    setErrors
  };
};
```

---

#### B. `src/hooks/useConfirm.js`

```javascript
import { useState } from 'react';

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      setConfig({ message, ...options });
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
  };

  return {
    confirm,
    isOpen,
    config,
    handleConfirm,
    handleCancel
  };
};
```

---

## 📋 PLAN DE REFACTORIZACIÓN

### Fase 1: Crear Utilidades (1 día)
- [x] Identificar código duplicado
- [ ] Crear `roleHelpers.js`
- [ ] Mejorar `dateHelpers.js`
- [ ] Crear `validationHelpers.js`
- [ ] Crear `notificationHelpers.js`
- [ ] Crear `messages.js`
- [ ] Crear `config.js`

### Fase 2: Crear Componentes Reutilizables (1 día)
- [ ] `LoadingSpinner.jsx`
- [ ] `RoleBadge.jsx`
- [ ] `ConfirmDialog.jsx`
- [ ] `ErrorBoundary.jsx`
- [ ] `EmptyState.jsx`

### Fase 3: Crear Custom Hooks (1 día)
- [ ] `useForm.js`
- [ ] `useConfirm.js`
- [ ] `useDebounce.js`
- [ ] `useLocalStorage.js`

### Fase 4: Refactorizar Componentes (2-3 días)
- [ ] Reemplazar verificaciones de rol inline
- [ ] Usar helpers centralizados
- [ ] Usar componentes reutilizables
- [ ] Eliminar código duplicado

### Fase 5: Testing y Documentación (1 día)
- [ ] Probar todos los cambios
- [ ] Documentar nuevos helpers
- [ ] Actualizar guía de desarrollo

---

## 📝 GUÍA DE ESTÁNDARES

### 1. NUNCA Hardcodear

```javascript
// ❌ MAL
if (user.role === 'admin') { }
const start = '08:00';
alert('Usuario creado');

// ✅ BIEN
if (user.role === USER_ROLES.ADMIN) { }
const start = CONFIG.DEFAULT_WORKDAY_START;
showSuccess(MESSAGES.USER_CREATED_SUCCESS);
```

---

### 2. SIEMPRE Usar Helpers

```javascript
// ❌ MAL
if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) { }

// ✅ BIEN
if (isAdminOrSuperadmin(user)) { }
```

---

### 3. SIEMPRE Reutilizar Componentes

```javascript
// ❌ MAL
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>

// ✅ BIEN
<LoadingSpinner />
```

---

### 4. SIEMPRE Centralizar Validaciones

```javascript
// ❌ MAL
if (!email || !email.includes('@')) { }

// ✅ BIEN
if (!isValidEmail(email)) { }
```

---

### 5. SIEMPRE Usar Constantes

```javascript
// ❌ MAL
const pageSize = 20;
setTimeout(() => {}, 3000);

// ✅ BIEN
const pageSize = CONFIG.DEFAULT_PAGE_SIZE;
setTimeout(() => {}, CONFIG.TOAST_DURATION);
```

---

## 🎯 PRÓXIMOS PASOS

1. **Crear archivos de utilidades**
2. **Refactorizar componentes uno por uno**
3. **Eliminar código duplicado**
4. **Documentar patrones**
5. **Crear guía de contribución**

