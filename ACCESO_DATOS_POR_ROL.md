# 📊 ACCESO A DATOS POR ROL - ACLARACIÓN

## ✅ CONFIRMACIÓN: Admins tienen acceso TOTAL a datos

### 🎯 RESUMEN

**Operario:** Solo sus propios datos  
**Admin:** TODOS los datos de TODOS los operarios  
**SuperAdmin:** TODOS los datos de TODOS los usuarios (incluyendo admins)

---

## 📋 ACCESO DETALLADO

### 👷 OPERARIO

#### Registros de Tiempo
```javascript
// Backend filtra automáticamente
if (role === 'operario') {
  query = query.eq('user_id', id); // Solo sus registros
}
```

**Ve:**
- ✅ Solo sus propias horas
- ✅ Solo sus propias tareas

**NO ve:**
- ❌ Horas de otros operarios
- ❌ Horas de admins
- ❌ Datos globales

#### Reportes
```javascript
// Frontend filtra automáticamente
if (user?.role === 'operario') {
  filtered = filtered.filter(e => e.user_id === user.id);
}
```

**Ve:**
- ✅ Solo sus reportes personales
- ✅ Sus métricas individuales
- ✅ Su progreso de objetivos

**NO ve:**
- ❌ Reportes de otros
- ❌ Comparativas con otros
- ❌ Selector de usuario

---

### 👨‍💼 ADMIN

#### Registros de Tiempo
```javascript
// Backend NO filtra para admin
if (role === 'admin') {
  // Sin filtro - ve TODO
}
```

**Ve:**
- ✅ **TODOS** los registros de **TODOS** los operarios
- ✅ **TODAS** las áreas
- ✅ **TODAS** las tareas
- ✅ **TODOS** los procesos
- ✅ Datos en tiempo real

**NO ve:**
- ❌ Registros de otros admins (solo en listado de usuarios)
- ❌ Registros de superadmins (solo en listado de usuarios)

#### Reportes
```javascript
// Admin puede filtrar por usuario
if (user?.role === 'admin') {
  const { users: usersData } = await usersService.getAll(); // Todos los operarios
  setUsers(usersData);
}
```

**Ve:**
- ✅ Reportes de **TODOS** los operarios
- ✅ Reportes por área
- ✅ Reportes por proceso
- ✅ Reportes por tarea
- ✅ Reportes comparativos
- ✅ Análisis de productividad global
- ✅ Detección de horas extras de todos
- ✅ Cumplimiento de objetivos de todos

**Puede filtrar por:**
- ✅ Usuario específico
- ✅ Área específica
- ✅ Rango de fechas
- ✅ Tipo de unidad organizacional

#### Estructura Organizacional
**Ve:**
- ✅ **TODAS** las áreas
- ✅ **TODOS** los procesos
- ✅ **TODOS** los subprocesos
- ✅ **TODAS** las tareas

**Puede:**
- ✅ Crear nuevas unidades
- ✅ Editar unidades existentes
- ✅ Eliminar unidades
- ✅ Reorganizar jerarquía

---

### 🔑 SUPERADMIN

#### Todo lo del Admin +

**Ve ADEMÁS:**
- ✅ Registros de otros admins
- ✅ Usuarios admin en gestión
- ✅ Puede crear/editar admins

---

## 🔍 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Admin revisa productividad

**Escenario:** Admin Pedro quiere ver cómo va el equipo esta semana

```javascript
// Pedro puede:
1. Ir a Reportes
2. Seleccionar "Esta semana"
3. Ver TODOS los operarios:
   - Juan: 38h
   - María: 42h
   - Carlos: 35h
   - Ana: 40h
4. Filtrar por área "Producción"
5. Ver solo tareas de esa área
6. Exportar reporte completo
```

**Resultado:** ✅ Pedro ve TODO

---

### Ejemplo 2: Admin carga horas para operario

**Escenario:** Juan olvidó cargar sus horas del lunes

```javascript
// Pedro (admin) puede:
1. Ir a "Carga de Horas"
2. Seleccionar usuario: Juan
3. Seleccionar fecha: Lunes
4. Cargar las horas de Juan
5. Guardar
```

**Resultado:** ✅ Horas guardadas con user_id de Juan

---

### Ejemplo 3: Admin analiza área específica

**Escenario:** Revisar eficiencia del área "Empaque"

```javascript
// Admin puede:
1. Ir a Reportes
2. Filtrar por unidad: "Empaque"
3. Ver TODOS los operarios que trabajaron en Empaque
4. Ver distribución de tiempo
5. Ver horas extras
6. Comparar con objetivos
```

**Resultado:** ✅ Análisis completo del área

---

## 📊 TABLA DE ACCESO A DATOS

| Tipo de Dato | Operario | Admin | SuperAdmin |
|--------------|----------|-------|------------|
| **Propios registros** | ✅ | ✅ | ✅ |
| **Registros de operarios** | ❌ | ✅ | ✅ |
| **Registros de admins** | ❌ | ❌ | ✅ |
| **Todas las áreas** | ❌ | ✅ | ✅ |
| **Todos los procesos** | ❌ | ✅ | ✅ |
| **Todas las tareas** | ❌ | ✅ | ✅ |
| **Reportes globales** | ❌ | ✅ | ✅ |
| **Filtrar por usuario** | ❌ | ✅ | ✅ |
| **Filtrar por área** | ❌ | ✅ | ✅ |
| **Exportar reportes** | ✅ Propios | ✅ Todos | ✅ Todos |
| **Ver métricas globales** | ❌ | ✅ | ✅ |
| **Análisis comparativo** | ❌ | ✅ | ✅ |

---

## 🔐 VALIDACIONES EN BACKEND

### GET /api/time-entries
```javascript
// Operario: Solo sus registros
if (role === 'operario') {
  query = query.eq('user_id', id);
}

// Admin: SIN FILTRO - Ve todo
// SuperAdmin: SIN FILTRO - Ve todo
```

### GET /api/users
```javascript
// Operario: Solo su perfil
if (role === 'operario') {
  query = query.eq('id', id);
}

// Admin: Todos los operarios
else if (role === 'admin') {
  query = query.eq('role', 'operario');
}

// SuperAdmin: Todos
```

### GET /api/organizational-units
```javascript
// TODOS ven todas las unidades
// (necesario para cargar horas y reportes)
```

---

## 🎯 PERMISOS DE MODIFICACIÓN

### Crear Registros PARA OTROS

| Rol | Puede crear para | NO puede crear para |
|-----|------------------|---------------------|
| **Operario** | Solo sí mismo | Otros usuarios |
| **Admin** | Operarios | Admins, SuperAdmins |
| **SuperAdmin** | Cualquiera | - |

### Editar/Eliminar Registros

| Rol | Puede editar/eliminar |
|-----|-----------------------|
| **Operario** | Solo sus registros |
| **Admin** | Todos los registros de operarios |
| **SuperAdmin** | Todos los registros |

---

## 💡 CASOS DE USO REALES

### Caso 1: Análisis de Productividad Semanal
**Usuario:** Admin  
**Objetivo:** Ver rendimiento del equipo

```
1. Ir a Reportes
2. Seleccionar "Esta semana"
3. Ver todos los operarios (sin filtro)
4. Analizar:
   - Total de horas: 320h
   - Promedio por operario: 40h
   - Horas extras: 12h
   - Cumplimiento de objetivos: 95%
```

**Acceso:** ✅ TOTAL a todos los datos

---

### Caso 2: Reporte por Área
**Usuario:** Admin  
**Objetivo:** Ver eficiencia de "Producción"

```
1. Ir a Reportes
2. Filtrar por unidad: "Producción"
3. Ver:
   - Todos los operarios que trabajaron en Producción
   - Distribución de tiempo por tarea
   - Comparativa con otras áreas
```

**Acceso:** ✅ TOTAL a todas las áreas

---

### Caso 3: Detección de Problemas
**Usuario:** Admin  
**Objetivo:** Identificar operarios con muchas horas extras

```
1. Ir a Reportes > Horas Extras
2. Ver TODOS los operarios
3. Identificar:
   - Juan: 8h extras esta semana
   - María: 12h extras
4. Tomar acción
```

**Acceso:** ✅ TOTAL a datos de horas extras

---

## ✅ CONFIRMACIÓN FINAL

### ¿Admin puede ver TODOS los datos?
**SÍ ✅**

### ¿Admin puede ver TODAS las áreas?
**SÍ ✅**

### ¿Admin puede ver TODOS los operarios?
**SÍ ✅**

### ¿Admin puede ver TODOS los reportes?
**SÍ ✅**

### ¿Admin puede filtrar por cualquier criterio?
**SÍ ✅**

### ¿Admin puede exportar reportes globales?
**SÍ ✅**

---

## 🚫 ÚNICA RESTRICCIÓN PARA ADMIN

**NO puede:**
- ❌ Ver/editar otros admins (solo SuperAdmin)
- ❌ Ver/editar superadmins (solo SuperAdmin)
- ❌ Crear registros para admins/superadmins
- ❌ Cambiar roles

**Puede TODO lo demás relacionado con operarios y datos operativos** ✅

---

## 📝 RESUMEN

**Filosofía del sistema:**
- **Operario:** Acceso limitado a sus datos
- **Admin:** Acceso TOTAL a datos operativos (todos los operarios, todas las áreas)
- **SuperAdmin:** Acceso TOTAL sin restricciones

**El admin es el gestor operativo con visibilidad completa del negocio** 👨‍💼

---

**Fecha:** 28 de marzo de 2026  
**Versión:** 2.0.0  
**Estado:** ✅ Confirmado y documentado
