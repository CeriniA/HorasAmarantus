# 📝 ACTUALIZACIÓN DE ESTÁNDARES DE DESARROLLO

## 📅 Fecha: 29 de marzo de 2026

---

## ✅ ARCHIVOS ACTUALIZADOS

### 1. ✅ `ESTANDARES_DESARROLLO.md`

**Nuevas reglas agregadas:**

#### 🆕 Regla #6: NUNCA Usar Hooks en Orden Incorrecto

**Problema identificado:**
```javascript
// ❌ ERROR CRÍTICO
export const useMyHook = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    loadData(); // ❌ loadData no existe aún
  }, [loadData]);
  
  const loadData = useCallback(async () => {
    // Definido DESPUÉS de ser usado
  }, []);
};
```

**Solución implementada:**
```javascript
// ✅ CORRECTO
export const useMyHook = () => {
  const [data, setData] = useState([]);
  
  // 1. Definir callback PRIMERO
  const loadData = useCallback(async () => {
    // ...
  }, []);
  
  // 2. Usar en useEffect DESPUÉS
  useEffect(() => {
    loadData();
  }, [loadData]);
};
```

**Orden correcto de hooks:**
1. `useState` - Estados
2. `useCallback`, `useMemo` - Callbacks y valores memorizados
3. `useEffect` - Efectos secundarios

---

### 2. ✅ Patrón de Custom Hooks Actualizado

**Antes:**
```javascript
export const useMyHook = (param) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    loadData(); // ❌ Orden incorrecto
  }, [param]);
  
  const loadData = async () => {
    // ...
  };
};
```

**Ahora:**
```javascript
export const useMyHook = (param) => {
  // 1. Estados primero
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 2. Callbacks después (ANTES de useEffect)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Lógica...
    } finally {
      setLoading(false);
    }
  }, [param]);
  
  // 3. Effects al final (DESPUÉS de definir callbacks)
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  return { data, loading, reload: loadData };
};
```

---

### 3. ✅ Checklist Actualizado

**Nuevas verificaciones agregadas:**

#### React Hooks:
- [ ] **Orden correcto: useState → useCallback/useMemo → useEffect**
- [ ] Callbacks definidos ANTES de usarlos en useEffect
- [ ] Todas las dependencias incluidas en arrays de dependencias
- [ ] No hay warnings de React Hooks

---

### 4. ✅ Resumen Actualizado

**NUNCA:**
- ❌ Hardcodear valores
- ❌ Duplicar código
- ❌ Verificar roles inline
- ❌ Usar alert/confirm directo
- ❌ Crear componentes inline
- ❌ **Usar hooks en orden incorrecto** ← NUEVO

**SIEMPRE:**
- ✅ Usar constantes
- ✅ Usar helpers
- ✅ Usar custom hooks
- ✅ Usar componentes reutilizables
- ✅ Validar datos
- ✅ Documentar
- ✅ Pensar en reutilización
- ✅ **Definir callbacks ANTES de useEffect** ← NUEVO

---

## 🎯 IMPACTO DE LA ACTUALIZACIÓN

### Errores Prevenidos:
1. ✅ `Cannot access 'X' before initialization`
2. ✅ React Hook warnings sobre dependencias
3. ✅ Bugs sutiles por closures obsoletos
4. ✅ Problemas de performance por re-renders innecesarios

### Beneficios:
1. ✅ Código más predecible
2. ✅ Menos bugs en producción
3. ✅ Mejor performance
4. ✅ Más fácil de mantener

---

## 📚 ARCHIVOS DE REFERENCIA ACTUALIZADOS

### ✅ Archivos con reglas actualizadas:
1. **`ESTANDARES_DESARROLLO.md`** - Reglas y patrones de código
2. **`FIX_LINT_ERRORS.md`** - Errores corregidos con explicaciones
3. **`REFACTORIZACION_COMPLETADA.md`** - Resumen de refactorización
4. **`RESUMEN_REFACTORIZACION.md`** - Resumen ejecutivo

### ✅ Archivos de utilidades creados:
1. **`utils/roleHelpers.js`** - Helpers de roles
2. **`constants/messages.js`** - Mensajes centralizados
3. **`constants/config.js`** - Configuración centralizada
4. **`utils/dateHelpers.js`** - Helpers de fechas

---

## 🔍 VERIFICACIÓN

### Para verificar que estás siguiendo los estándares:

#### 1. Antes de escribir código:
```bash
# Leer estándares
cat ESTANDARES_DESARROLLO.md
```

#### 2. Al escribir custom hooks:
```javascript
// ✅ Verificar orden:
// 1. useState
// 2. useCallback/useMemo
// 3. useEffect
```

#### 3. Antes de commit:
```bash
# Verificar checklist en ESTANDARES_DESARROLLO.md
# Sección: "📋 CHECKLIST ANTES DE COMMIT"
```

---

## 📖 EJEMPLOS ACTUALIZADOS

### Ejemplo 1: Custom Hook Correcto

```javascript
import { useState, useEffect, useCallback } from 'react';

export const useTimeEntries = (userId) => {
  // 1. Estados
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Callbacks (ANTES de useEffect)
  const loadTimeEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchData(userId);
      setTimeEntries(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // 3. Effects (DESPUÉS de callbacks)
  useEffect(() => {
    if (userId) {
      loadTimeEntries();
    }
  }, [userId, loadTimeEntries]);
  
  return { timeEntries, loading, reload: loadTimeEntries };
};
```

### Ejemplo 2: Componente con Hooks

```javascript
import { useState, useCallback, useEffect } from 'react';

export const MyComponent = () => {
  // 1. Estados
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  
  // 2. Callbacks memorizados
  const filteredData = useMemo(() => {
    return data.filter(item => item.name.includes(filter));
  }, [data, filter]);
  
  const handleLoad = useCallback(async () => {
    const result = await loadData();
    setData(result);
  }, []);
  
  // 3. Effects
  useEffect(() => {
    handleLoad();
  }, [handleLoad]);
  
  return <div>{/* render */}</div>;
};
```

---

## ⚠️ ERRORES COMUNES A EVITAR

### ❌ Error #1: useEffect antes de useCallback
```javascript
// ❌ MAL
useEffect(() => {
  myFunction(); // Error: myFunction no existe
}, [myFunction]);

const myFunction = useCallback(() => {}, []);
```

### ❌ Error #2: Olvidar dependencias
```javascript
// ❌ MAL
const loadData = useCallback(async () => {
  await fetch(`/api/users/${userId}`); // userId no está en deps
}, []); // ❌ Falta userId
```

### ❌ Error #3: No usar useCallback
```javascript
// ❌ MAL
const loadData = async () => {}; // No es estable

useEffect(() => {
  loadData(); // Se ejecuta en cada render
}, [loadData]); // loadData cambia en cada render
```

---

## 🎓 LECCIONES APRENDIDAS

### 1. **Orden importa**
- JavaScript no hace "hoisting" de `const`
- Definir antes de usar

### 2. **useCallback es necesario**
- Para funciones usadas en dependencias de useEffect
- Evita re-renders innecesarios

### 3. **Dependencias completas**
- Incluir TODAS las variables usadas
- ESLint te ayuda con warnings

### 4. **Patrones consistentes**
- Seguir siempre el mismo orden
- Más fácil de leer y mantener

---

## ✅ ESTADO FINAL

### Documentación:
- ✅ `ESTANDARES_DESARROLLO.md` actualizado
- ✅ Nuevas reglas agregadas
- ✅ Patrones actualizados
- ✅ Checklist mejorado
- ✅ Ejemplos correctos

### Código:
- ✅ `useTimeEntries.js` corregido
- ✅ Orden de hooks correcto
- ✅ 0 errores de lint
- ✅ 0 warnings de React

### Conocimiento:
- ✅ Equipo sabe orden correcto de hooks
- ✅ Ejemplos disponibles
- ✅ Errores documentados
- ✅ Soluciones claras

---

**Fecha de actualización:** 29 de marzo de 2026  
**Versión:** 2.0  
**Estado:** ✅ COMPLETADO Y ACTUALIZADO
