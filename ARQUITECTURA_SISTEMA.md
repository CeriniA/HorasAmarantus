# 🏗️ ARQUITECTURA DEL SISTEMA - LECTURA OBLIGATORIA

**IMPORTANTE:** Este archivo debe ser leído SIEMPRE antes de hacer cambios en el código.

---

## 📁 ESTRUCTURA DEL PROYECTO

```
app-web/
├── backend/src/
│   ├── routes/          # SOLO endpoints HTTP
│   ├── controllers/     # Orquestación de requests
│   ├── services/        # TODA la lógica de negocio
│   ├── models/          # Constantes y types
│   ├── middleware/      # Validaciones y auth
│   ├── config/          # Configuración
│   └── utils/           # Helpers (logger, etc)
│
└── frontend/src/
    ├── pages/           # Páginas principales
    ├── components/      # Componentes reutilizables
    ├── hooks/           # Custom hooks
    ├── services/        # API y servicios
    ├── offline/         # Sistema offline
    ├── utils/           # Helpers
    └── constants/       # Constantes
```

---

## 🎯 REGLAS INQUEBRANTABLES - BACKEND

### 1. ARQUITECTURA DE CAPAS

```
Request → Route → Controller → Service → Database → Response
```

**NUNCA saltar capas. NUNCA.**

### 2. RESPONSABILIDADES POR CAPA

#### Routes (`routes/*.js`)
✅ **SOLO puede:**
- Definir endpoints HTTP
- Aplicar middleware
- Delegar a controllers

❌ **PROHIBIDO:**
- Lógica de negocio
- Acceso a base de datos
- Validaciones complejas

#### Controllers (`controllers/*.controller.js`)
✅ **SOLO puede:**
- Recibir requests HTTP
- Llamar a services
- Formatear respuestas
- Manejo de errores HTTP (status codes)

❌ **PROHIBIDO:**
- Lógica de negocio
- Acceso a base de datos
- Cálculos o transformaciones

#### Services (`services/*.service.js`)
✅ **SOLO puede:**
- TODA la lógica de negocio
- Validaciones de datos
- Acceso a base de datos
- Cálculos y transformaciones
- Logging de operaciones

❌ **PROHIBIDO:**
- Manejo de HTTP (res.status, res.json, etc)
- Conocer sobre requests/responses

---

## 📋 CONSTANTES Y PERMISOS

### Usar SIEMPRE constantes

```javascript
// ❌ PROHIBIDO - Strings hardcodeados
if (user.role === 'admin') { }
if (status === 'completed') { }

// ✅ CORRECTO - Constantes de models/constants.js
import { USER_ROLES, TIME_ENTRY_STATUS } from '../models/constants.js';
if (user.role === USER_ROLES.ADMIN) { }
if (status === TIME_ENTRY_STATUS.COMPLETED) { }
```

### Usar helper de permisos

```javascript
// ❌ PROHIBIDO - Comparaciones manuales
if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN) { }

// ✅ CORRECTO - Helper de permisos
import { hasPermission } from '../models/types.js';
if (hasPermission(user.role, 'VIEW_ALL_USERS')) { }
```

**Permisos disponibles:**
- `VIEW_ALL_USERS`
- `CREATE_USER`
- `UPDATE_ANY_USER`
- `DELETE_USER`
- `VIEW_ALL_ENTRIES`
- `CREATE_ENTRY_FOR_OTHERS`
- `UPDATE_ANY_ENTRY`
- `DELETE_ANY_ENTRY`
- `CREATE_ORG_UNIT`
- `UPDATE_ORG_UNIT`
- `DELETE_ORG_UNIT`

---

## 📝 LOGGING

### NUNCA usar console.log

```javascript
// ❌ PROHIBIDO
console.log('Usuario creado');
console.error('Error:', error);

// ✅ CORRECTO
import logger from '../utils/logger.js';
logger.info('Usuario creado:', username);
logger.error('Error creando usuario:', error);
```

**Niveles de log:**
- `logger.log()` - General (solo DEV)
- `logger.info()` - Información (solo DEV)
- `logger.debug()` - Debug detallado (solo DEV)
- `logger.warn()` - Advertencias (DEV y PROD)
- `logger.error()` - Errores (DEV y PROD)
- `logger.critical()` - Errores críticos (SIEMPRE)
- `logger.success()` - Éxito (solo DEV)

---

## 🎯 REGLAS INQUEBRANTABLES - FRONTEND

### 1. MODO OFFLINE

**NO permitir editar/borrar offline:**
```javascript
// ✅ CORRECTO
const isOffline = !navigator.onLine;
<button disabled={isOffline}>Editar</button>
<button disabled={isOffline}>Borrar</button>
```

**Solo guardar entries PENDIENTES en IndexedDB:**
```javascript
// ✅ CORRECTO
const pendingEntries = await timeEntryRepo.findPendingByUser(userId);
```

### 2. MANEJO DE FECHAS

**NUNCA usar `new Date()` directamente con timestamps:**
```javascript
// ❌ PROHIBIDO
const date = new Date(timestamp);
const formatted = format(new Date(entry.created_at), 'dd/MM/yyyy');

// ✅ CORRECTO
import { safeDate } from '../utils/dateHelpers.js';
const date = safeDate(timestamp);
const formatted = format(safeDate(entry.created_at), 'dd/MM/yyyy');
```

### 3. LOGGING FRONTEND

```javascript
// ❌ PROHIBIDO
console.log('Datos cargados');

// ✅ CORRECTO
import logger from '../utils/logger.js';
logger.info('Datos cargados:', data);
```

---

## 📦 IMPORTS Y EXPORTS

### Backend - ES Modules

```javascript
// ✅ CORRECTO
import express from 'express';
import logger from '../utils/logger.js';
export default router;

// ❌ PROHIBIDO
const express = require('express');
module.exports = router;
```

### Frontend - ES Modules

```javascript
// ✅ CORRECTO
import { useState } from 'react';
export default Component;
```

---

## 🔍 VALIDACIÓN DE CÓDIGO

### Antes de commit, verificar:

1. ✅ Routes solo tienen endpoints
2. ✅ Controllers solo orquestan
3. ✅ Services tienen toda la lógica
4. ✅ No hay strings hardcodeados
5. ✅ Se usan constantes de `models/constants.js`
6. ✅ Se usa `hasPermission()` para permisos
7. ✅ Se usa `logger` en lugar de `console`
8. ✅ Modo offline no permite editar/borrar
9. ✅ Se usa `safeDate()` para fechas

---

## 📚 DOCUMENTOS RELACIONADOS

- **`ARQUITECTURA_OBLIGATORIA.md`** - Reglas detalladas
- **`GUIA_LOGS.md`** - Sistema de logs completo
- **`BACKEND_REFACTOR_COMPLETO.md`** - Estado del refactor
- **`TRABAJO_COMPLETADO_HOY.md`** - Resumen de cambios

---

## 🚨 ERRORES COMUNES A EVITAR

### 1. Lógica en Routes
```javascript
// ❌ MAL
router.get('/', async (req, res) => {
  const { data } = await supabase.from('users').select('*');
  res.json(data);
});

// ✅ BIEN
router.get('/', usersController.getAll);
```

### 2. Acceso a DB en Controllers
```javascript
// ❌ MAL
const getAll = async (req, res) => {
  const { data } = await supabase.from('users').select('*');
  res.json(data);
};

// ✅ BIEN
const getAll = async (req, res) => {
  const users = await usersService.getAll(req.user);
  res.json({ users });
};
```

### 3. HTTP en Services
```javascript
// ❌ MAL
const getAll = async (user) => {
  const data = await supabase.from('users').select('*');
  return res.json(data); // ❌ res no existe aquí
};

// ✅ BIEN
const getAll = async (user) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error('Error obteniendo usuarios');
  return data;
};
```

### 4. Strings Hardcodeados
```javascript
// ❌ MAL
if (user.role === 'admin') { }

// ✅ BIEN
import { USER_ROLES } from '../models/constants.js';
if (user.role === USER_ROLES.ADMIN) { }
```

### 5. Console.log en Producción
```javascript
// ❌ MAL
console.log('Usuario creado');

// ✅ BIEN
import logger from '../utils/logger.js';
logger.info('Usuario creado');
```

---

## ✅ CHECKLIST ANTES DE COMMIT

- [ ] ¿Routes solo tienen endpoints?
- [ ] ¿Controllers solo orquestan?
- [ ] ¿Services tienen toda la lógica?
- [ ] ¿No hay strings hardcodeados?
- [ ] ¿Se usan constantes?
- [ ] ¿Se usa hasPermission()?
- [ ] ¿Se usa logger en lugar de console?
- [ ] ¿Código testeado manualmente?
- [ ] ¿Backend arranca sin errores?
- [ ] ¿Frontend funciona correctamente?

---

**Última actualización:** 29 de marzo de 2026  
**Versión:** 1.0  
**Estado:** OBLIGATORIO - NO NEGOCIABLE
