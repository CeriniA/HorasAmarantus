# 👨‍💼 GUÍA COMPLETA: ¿Qué ve y hace un ADMIN?

## 📊 RESUMEN EJECUTIVO

**Un admin ve TODOS los datos de TODOS los operarios en TODAS las secciones.**

---

## 🏠 DASHBOARD

### ¿Qué ve el admin?

**SU PROPIO dashboard personal:**
- ✅ Sus métricas personales
- ✅ Su progreso de objetivo semanal
- ✅ Sus alertas
- ✅ Su comparación de semanas
- ✅ Su historial de objetivos

**NO ve:**
- ❌ Dashboard global de todos los operarios
- ❌ Métricas combinadas del equipo

**Nota:** El dashboard es personal para todos los roles. Para ver datos globales, el admin debe ir a **Reportes**.

---

## ⏱️ REGISTROS DE TIEMPO (Time Entries)

### ¿Qué ve el admin en el historial?

**VE TODOS los registros de TODOS los operarios** ✅

#### Historial Completo
```
📅 28 de marzo de 2026 - 16.5h
  👤 Juan Pérez - Empaque - 8h
  👤 María García - Producción - 8.5h

📅 27 de marzo de 2026 - 24h
  👤 Juan Pérez - Empaque - 8h
  👤 María García - Producción - 8h
  👤 Carlos López - Logística - 8h
```

#### Características del Historial para Admin
- ✅ **Columna "Usuario"** visible (operarios NO la ven)
- ✅ Ve registros de TODOS los operarios mezclados
- ✅ Puede filtrar por usuario específico
- ✅ Puede filtrar por mes/año/todo
- ✅ Puede editar cualquier registro
- ✅ Puede eliminar cualquier registro
- ✅ Puede eliminar día completo de cualquier usuario

### Filtros Disponibles

#### 1. Filtro por Fecha
- **Mes:** Ver solo registros de un mes específico
- **Año:** Ver solo registros de un año
- **Todo:** Ver todos los registros históricos

#### 2. Filtro por Usuario ✅ NUEVO
- **Todos los usuarios:** Ver mezclados (default)
- **Usuario específico:** Ver solo de un operario
- Solo muestra operarios (no otros admins)

**Ejemplo:**
```
Filtros:
[Mes ▼] [2026-03 ▼] [Juan Pérez ▼]

Resultado: Solo registros de Juan en marzo 2026
```

---

## 📋 CARGA DE HORAS

### ¿Para quién puede cargar horas?

**Puede cargar para:**
- ✅ Sí mismo
- ✅ Cualquier operario

**NO puede cargar para:**
- ❌ Otros admins
- ❌ Superadmins

### Selector de Usuario

**Cuando abre "Cargar Horas":**
```
┌─────────────────────────────────┐
│ 📋 Carga de Horas por Tarea     │
├─────────────────────────────────┤
│ Fecha: [2026-03-28 ▼]           │
│ Usuario: [Juan Pérez ▼]  ← NUEVO│
│   - Juan Pérez                  │
│   - María García                │
│   - Carlos López                │
│ (solo operarios)                │
└─────────────────────────────────┘
```

**Flujo:**
1. Selecciona usuario (o deja su propio usuario)
2. Selecciona fecha
3. Carga las horas por tarea
4. Guarda → Las horas se asignan al usuario seleccionado

---

## 📊 REPORTES

### ¿Qué ve el admin?

**VE TODOS los datos de TODOS los operarios** ✅

#### Reportes Disponibles

**1. Resumen de Actividad**
- ✅ Todos los operarios
- ✅ Todas las áreas
- ✅ Todas las tareas
- ✅ Puede filtrar por usuario
- ✅ Puede filtrar por unidad organizacional
- ✅ Puede filtrar por rango de fechas

**2. Cumplimiento de Objetivos**
- ✅ Ve objetivos de todos los operarios
- ✅ Ve progreso individual de cada uno
- ✅ Ve quién cumple y quién no
- ✅ Semáforo por usuario (verde/amarillo/rojo)

**3. Horas Extras**
- ✅ Ve horas extras de todos
- ✅ Detecta trabajo en fines de semana
- ✅ Detecta días con >8h
- ✅ Puede filtrar por usuario

**4. Distribución por Área**
- ✅ Ve tiempo total por área
- ✅ Ve distribución de todos los operarios
- ✅ Gráficos comparativos

### Filtros en Reportes

```
Rango de fechas: [01/03/2026] - [31/03/2026]
Usuario: [Todos ▼]
  - Todos
  - Juan Pérez
  - María García
  - Carlos López
Unidad: [Todas ▼]
  - Todas
  - Producción
  - Empaque
  - Logística
```

**Ejemplos de uso:**

**Ver productividad de Juan en marzo:**
```
Fecha: 01/03 - 31/03
Usuario: Juan Pérez
Unidad: Todas
```

**Ver eficiencia del área de Producción:**
```
Fecha: 01/03 - 31/03
Usuario: Todos
Unidad: Producción
```

**Ver horas extras de todos esta semana:**
```
Ir a: Horas Extras
Fecha: Esta semana
Usuario: Todos
```

---

## 🏢 ESTRUCTURA ORGANIZACIONAL

### ¿Qué ve y puede hacer?

**VE TODO:**
- ✅ Todas las áreas
- ✅ Todos los procesos
- ✅ Todos los subprocesos
- ✅ Todas las tareas

**PUEDE:**
- ✅ Crear nuevas unidades (área/proceso/subproceso/tarea)
- ✅ Editar unidades existentes
- ✅ Eliminar unidades
- ✅ Reorganizar jerarquía

**Ejemplo de vista:**
```
📦 Producción (Área)
  ├─ 🔧 Ensamblaje (Proceso)
  │   ├─ ⚙️ Preparación (Subproceso)
  │   │   └─ ✓ Revisar materiales (Tarea)
  │   └─ ⚙️ Montaje (Subproceso)
  │       └─ ✓ Ensamblar piezas (Tarea)
  └─ 🔧 Control de Calidad (Proceso)
      └─ ✓ Inspección final (Tarea)
```

---

## 👥 GESTIÓN DE USUARIOS

### ¿Qué ve?

**VE:**
- ✅ Todos los operarios
- ✅ Puede crear operarios
- ✅ Puede editar operarios
- ✅ Puede eliminar operarios
- ✅ Puede activar/desactivar operarios

**NO VE:**
- ❌ Otros admins (solo SuperAdmin)
- ❌ Superadmins (solo SuperAdmin)

**Vista:**
```
┌─────────────────────────────────────────┐
│ 👥 Gestión de Usuarios                  │
├─────────────────────────────────────────┤
│ 👤 Juan Pérez - Operario - Activo      │
│ 👤 María García - Operario - Activo    │
│ 👤 Carlos López - Operario - Inactivo  │
│                                         │
│ [+ Crear Usuario]                       │
└─────────────────────────────────────────┘
```

---

## ⚙️ CONFIGURACIÓN

### ¿Qué puede hacer?

**Puede:**
- ✅ Ver su perfil
- ✅ Cambiar su contraseña
- ✅ Actualizar su email
- ✅ Configurar su objetivo semanal

**NO puede:**
- ❌ Cambiar su propio rol
- ❌ Ver configuración de otros usuarios

---

## 📋 TABLA RESUMEN: ¿Qué ve el Admin en cada sección?

| Sección | ¿Qué ve? | Filtros disponibles |
|---------|----------|---------------------|
| **Dashboard** | Solo su dashboard personal | - |
| **Registros** | TODOS los registros de TODOS los operarios | Fecha, Usuario |
| **Reportes** | TODOS los datos de TODOS los operarios | Fecha, Usuario, Unidad |
| **Estructura** | TODAS las unidades organizacionales | - |
| **Usuarios** | Todos los operarios | - |
| **Configuración** | Solo su perfil | - |

---

## 🎯 CASOS DE USO REALES

### Caso 1: Revisar horas de Juan esta semana

**Objetivo:** Ver qué hizo Juan esta semana

**Pasos:**
1. Ir a **Registros de Tiempo**
2. Filtrar por: **Mes actual**
3. Filtrar por: **Juan Pérez**
4. Ver historial filtrado

**Resultado:**
```
📅 28/03 - 8h
  👤 Juan - Empaque - 8h
📅 27/03 - 8h
  👤 Juan - Empaque - 8h
📅 26/03 - 8.5h
  👤 Juan - Empaque - 8.5h
```

---

### Caso 2: Cargar horas olvidadas de María

**Objetivo:** María olvidó cargar sus horas del lunes

**Pasos:**
1. Ir a **Registros de Tiempo**
2. Click en **📋 Cargar Horas**
3. Seleccionar usuario: **María García**
4. Seleccionar fecha: **Lunes**
5. Cargar tareas y horas
6. Guardar

**Resultado:** Horas guardadas con `user_id` de María ✅

---

### Caso 3: Analizar productividad del área de Producción

**Objetivo:** Ver eficiencia del área en marzo

**Pasos:**
1. Ir a **Reportes**
2. Seleccionar rango: **01/03 - 31/03**
3. Filtrar por unidad: **Producción**
4. Ver:
   - Total de horas en Producción
   - Distribución por operario
   - Distribución por tarea
   - Horas extras

**Resultado:** Análisis completo del área ✅

---

### Caso 4: Detectar quién tiene horas extras

**Objetivo:** Identificar operarios con muchas horas extras

**Pasos:**
1. Ir a **Reportes**
2. Click en **Horas Extras**
3. Seleccionar: **Esta semana**
4. Ver lista de todos los operarios con overtime

**Resultado:**
```
🔴 María García - 12h extras
🟡 Juan Pérez - 8h extras
🟢 Carlos López - 0h extras
```

---

## 🔐 PERMISOS DETALLADOS

### ✅ PUEDE hacer:

**Datos:**
- Ver TODOS los registros de operarios
- Ver TODOS los reportes
- Ver TODAS las áreas/tareas
- Filtrar por cualquier criterio

**Acciones:**
- Crear/editar/eliminar registros de operarios
- Cargar horas para operarios
- Crear/editar/eliminar usuarios operarios
- Crear/editar/eliminar estructura organizacional
- Exportar reportes

### ❌ NO PUEDE hacer:

**Limitaciones:**
- Ver/editar otros admins
- Ver/editar superadmins
- Cargar horas para admins/superadmins
- Cambiar roles
- Ver dashboard global (solo reportes)

---

## 🆚 DIFERENCIAS: Admin vs Operario

| Característica | Operario | Admin |
|----------------|----------|-------|
| **Dashboard** | Solo suyo | Solo suyo |
| **Registros - Historial** | Solo suyos | TODOS |
| **Registros - Columna Usuario** | ❌ No visible | ✅ Visible |
| **Registros - Filtro Usuario** | ❌ No disponible | ✅ Disponible |
| **Carga - Selector Usuario** | ❌ No visible | ✅ Visible |
| **Carga - Para quién** | Solo sí mismo | Operarios |
| **Reportes** | Solo suyos | TODOS |
| **Reportes - Filtro Usuario** | ❌ No disponible | ✅ Disponible |
| **Estructura** | ❌ No accede | ✅ Gestión total |
| **Usuarios** | ❌ No accede | ✅ Gestión operarios |

---

## 💡 MEJORAS IMPLEMENTADAS HOY

### ✅ Columna de Usuario en Historial
**Antes:** Admin veía registros mezclados sin saber de quién eran  
**Ahora:** Columna "👤 Usuario" visible solo para admins

### ✅ Filtro de Usuario en Historial
**Antes:** Admin tenía que buscar manualmente entre todos  
**Ahora:** Puede filtrar por usuario específico

### ✅ Selector de Usuario en Carga
**Antes:** Admin solo podía cargar para sí mismo  
**Ahora:** Puede seleccionar para quién carga (solo operarios)

### ✅ Validación Backend
**Antes:** Admin podía cargar para superadmins (bug)  
**Ahora:** Backend valida y rechaza si intenta cargar para admin/superadmin

---

## 📝 RESUMEN FINAL

### El Admin es el GESTOR OPERATIVO con:

**Visibilidad TOTAL:**
- ✅ Ve TODOS los datos de TODOS los operarios
- ✅ Ve TODAS las áreas y tareas
- ✅ Puede filtrar y analizar como necesite

**Control TOTAL sobre operarios:**
- ✅ Gestiona usuarios operarios
- ✅ Gestiona registros de operarios
- ✅ Gestiona estructura organizacional

**Limitaciones claras:**
- ❌ No gestiona otros admins (solo SuperAdmin)
- ❌ Dashboard es personal (reportes para vista global)

---

**Fecha:** 28 de marzo de 2026  
**Versión:** 2.0.0  
**Estado:** ✅ Documentado y actualizado
