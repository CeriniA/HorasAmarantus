# 👥 PERMISOS Y CAPACIDADES POR ROL

## 📊 RESUMEN GENERAL

El sistema tiene **3 roles** con diferentes niveles de acceso:

1. **👷 Operario** - Usuario básico
2. **👨‍💼 Admin** - Administrador
3. **🔑 SuperAdmin** - Administrador supremo

---

## 👷 OPERARIO

### ✅ Puede Hacer:

#### Dashboard
- ✅ Ver su propio dashboard
- ✅ Ver sus métricas personales
- ✅ Ver sus alertas
- ✅ Ver su progreso de objetivo semanal
- ✅ Ver comparación de semanas
- ✅ Ver historial de objetivos

#### Registros de Tiempo
- ✅ Ver sus propios registros
- ✅ Crear registros para sí mismo
- ✅ Editar sus propios registros
- ✅ Eliminar sus propios registros
- ✅ Carga masiva (bulk) de sus horas
- ✅ Usar plantillas de jornada

#### Reportes ✅ NUEVO
- ✅ Ver reportes de sus propias horas
- ✅ Filtrar por fecha
- ✅ Ver gráficos de su actividad
- ✅ Exportar sus reportes (CSV/Excel/PDF)
- ✅ Ver análisis de productividad personal
- ✅ Ver horas extras propias
- ✅ Ver cumplimiento de objetivos

#### Configuración
- ✅ Ver su perfil
- ✅ Cambiar su contraseña
- ✅ Actualizar su email
- ✅ Configurar su objetivo semanal

### ❌ NO Puede Hacer:

- ❌ Ver registros de otros usuarios
- ❌ Crear/editar/eliminar usuarios
- ❌ Gestionar estructura organizacional
- ❌ Ver reportes de otros usuarios
- ❌ Acceder a gestión de usuarios
- ❌ Crear registros para otros usuarios

---

## 👨‍💼 ADMIN

### ✅ Puede Hacer:

#### Todo lo del Operario +

#### Gestión de Usuarios
- ✅ Ver todos los usuarios (excepto otros admins/superadmins)
- ✅ Crear usuarios operarios
- ✅ Editar usuarios operarios
- ✅ Eliminar usuarios operarios
- ✅ Desactivar/activar usuarios

#### Registros de Tiempo
- ✅ Ver registros de TODOS los usuarios
- ✅ Crear registros para cualquier usuario
- ✅ Editar registros de cualquier usuario
- ✅ Eliminar registros de cualquier usuario
- ✅ Carga masiva para otros usuarios

#### Estructura Organizacional
- ✅ Ver toda la estructura
- ✅ Crear áreas/procesos/subprocesos/tareas
- ✅ Editar unidades organizacionales
- ✅ Eliminar unidades organizacionales
- ✅ Gestionar jerarquía

#### Reportes Avanzados
- ✅ Ver reportes de TODOS los usuarios
- ✅ Filtrar por usuario/unidad/fecha
- ✅ Reportes comparativos
- ✅ Análisis de productividad global
- ✅ Detección de horas extras
- ✅ Cumplimiento de objetivos por usuario
- ✅ Exportar reportes globales

### ❌ NO Puede Hacer:

- ❌ Crear/editar otros admins
- ❌ Crear/editar superadmins
- ❌ Ver/editar usuarios admin o superadmin
- ❌ Cambiar su propio rol

---

## 🔑 SUPERADMIN

### ✅ Puede Hacer:

#### TODO lo del Admin +

#### Gestión Total de Usuarios
- ✅ Ver TODOS los usuarios (incluyendo admins)
- ✅ Crear admins
- ✅ Editar admins
- ✅ Eliminar admins
- ✅ Cambiar roles de cualquier usuario
- ✅ Gestionar otros superadmins

#### Control Total
- ✅ Acceso completo a todas las funcionalidades
- ✅ Sin restricciones de permisos
- ✅ Puede hacer todo en el sistema

### ❌ NO Puede Hacer:

- ❌ (Ninguna restricción - acceso total)

---

## 📋 TABLA COMPARATIVA

| Funcionalidad | Operario | Admin | SuperAdmin |
|---------------|----------|-------|------------|
| **Dashboard Personal** | ✅ | ✅ | ✅ |
| **Ver Propios Registros** | ✅ | ✅ | ✅ |
| **Crear Propios Registros** | ✅ | ✅ | ✅ |
| **Editar Propios Registros** | ✅ | ✅ | ✅ |
| **Eliminar Propios Registros** | ✅ | ✅ | ✅ |
| **Carga Masiva Propia** | ✅ | ✅ | ✅ |
| **Plantillas de Jornada** | ✅ | ✅ | ✅ |
| **Reportes Propios** | ✅ | ✅ | ✅ |
| **Configurar Objetivo** | ✅ | ✅ | ✅ |
| **Cambiar Contraseña** | ✅ | ✅ | ✅ |
| | | | |
| **Ver Todos los Registros** | ❌ | ✅ | ✅ |
| **Crear Registros para Otros** | ❌ | ✅ | ✅ |
| **Editar Registros de Otros** | ❌ | ✅ | ✅ |
| **Reportes Globales** | ❌ | ✅ | ✅ |
| **Gestionar Estructura Org** | ❌ | ✅ | ✅ |
| **Crear Usuarios Operarios** | ❌ | ✅ | ✅ |
| **Editar Usuarios Operarios** | ❌ | ✅ | ✅ |
| **Eliminar Usuarios Operarios** | ❌ | ✅ | ✅ |
| | | | |
| **Ver Usuarios Admin** | ❌ | ❌ | ✅ |
| **Crear Usuarios Admin** | ❌ | ❌ | ✅ |
| **Editar Usuarios Admin** | ❌ | ❌ | ✅ |
| **Eliminar Usuarios Admin** | ❌ | ❌ | ✅ |
| **Cambiar Roles** | ❌ | ❌ | ✅ |

---

## 🛣️ RUTAS Y ACCESO

### Rutas Públicas
- `/login` - Login (sin autenticación)

### Rutas para TODOS los usuarios autenticados
- `/` - Dashboard
- `/time-entries` - Registros de tiempo
- `/reports` - Reportes ✅ ACTUALIZADO
- `/settings` - Configuración

### Rutas solo para Admin/SuperAdmin
- `/organizational-units` - Estructura organizacional
- `/admin/users` - Gestión de usuarios

---

## 🔐 VALIDACIONES EN BACKEND

### Registros de Tiempo

**GET /api/time-entries**
```javascript
// Operario: Solo sus registros
if (role === 'operario') {
  query = query.eq('user_id', id);
}
// Admin/SuperAdmin: Todos los registros
```

**POST /api/time-entries**
```javascript
// Solo admin/superadmin pueden crear para otros
const targetUserId = user_id || req.user.id;
if (targetUserId !== req.user.id && 
    role !== 'admin' && role !== 'superadmin') {
  return 403; // Forbidden
}
```

### Usuarios

**GET /api/users**
```javascript
// Operario: Solo su perfil
if (role === 'operario') {
  query = query.eq('id', id);
}
// Admin: Todos excepto admins/superadmins
else if (role === 'admin') {
  query = query.eq('role', 'operario');
}
// SuperAdmin: Todos
```

**POST /api/users**
```javascript
// Solo admin/superadmin pueden crear usuarios
requireAdmin middleware
```

### Reportes

**GET /api/reports/summary**
```javascript
// Operario: Solo sus datos
if (role === 'operario') {
  query = query.eq('user_id', currentUserId);
}
// Admin/SuperAdmin: Pueden filtrar por usuario
```

---

## 🎯 FILTRADO AUTOMÁTICO

### En Frontend

**Navbar - Menú**
```javascript
// Operarios NO ven:
- Estructura Organizacional
- Gestión de Usuarios

// Admins/SuperAdmins ven todo
```

**Reports - Filtros**
```javascript
// Operarios:
- NO ven selector de usuario
- Solo ven sus propios datos

// Admins/SuperAdmins:
- Ven selector de usuario
- Pueden filtrar por cualquier usuario
```

**BulkTimeEntry - Selector de Usuario**
```javascript
// Operarios:
- NO ven selector
- Horas se asignan automáticamente a ellos

// Admins/SuperAdmins:
- Ven selector de usuario
- Pueden cargar horas para otros
```

---

## 📝 EJEMPLOS DE USO

### Caso 1: Operario Juan
```
✅ Puede:
- Ver su dashboard
- Cargar sus horas del día
- Ver sus reportes del mes
- Exportar su reporte personal
- Configurar su objetivo a 42h semanales

❌ NO puede:
- Ver horas de María
- Crear usuarios
- Modificar estructura organizacional
```

### Caso 2: Admin Pedro
```
✅ Puede:
- Todo lo de Juan +
- Ver horas de todos los operarios
- Cargar horas para Juan (si se olvidó)
- Crear nuevo operario María
- Crear nueva tarea en estructura
- Ver reporte global del mes

❌ NO puede:
- Crear otro admin
- Ver/editar otros admins
```

### Caso 3: SuperAdmin Ana
```
✅ Puede:
- TODO sin restricciones
- Crear admin Pedro
- Editar cualquier usuario
- Cambiar roles
- Acceso total al sistema
```

---

## 🔄 CAMBIOS RECIENTES

### ✅ Implementado Hoy (28 Mar 2026)

1. **Reportes para Operarios** ✅
   - Antes: Solo admin/superadmin
   - Ahora: Todos pueden ver reportes
   - Operarios ven solo sus datos
   - Admins ven datos globales

2. **Selector de Usuario en Carga Masiva** ✅
   - Admins pueden seleccionar para quién cargan
   - Operarios solo cargan para sí mismos
   - Validación en backend y frontend

3. **Campos Personalizados en DB** ✅
   - `weekly_goal` - Objetivo semanal
   - `monthly_goal` - Objetivo mensual
   - `standard_daily_hours` - Horas estándar diarias

---

## 🎉 RESUMEN

**Filosofía de Permisos:**
- 🔓 **Operario:** Acceso a sus propios datos
- 🔐 **Admin:** Gestión de operarios y datos globales
- 🔑 **SuperAdmin:** Control total del sistema

**Principio:** Cada rol puede hacer todo lo del rol inferior + sus capacidades específicas.

---

**Fecha:** 28 de marzo de 2026  
**Versión:** 2.0.0  
**Estado:** ✅ Actualizado y vigente
