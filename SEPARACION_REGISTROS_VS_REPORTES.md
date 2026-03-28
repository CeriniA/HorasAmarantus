# 📋 SEPARACIÓN: Registros vs Reportes

## 🎯 FILOSOFÍA DEL SISTEMA

### Principio Fundamental
**"Registros de Tiempo" es PERSONAL para todos. "Reportes" es para análisis global.**

---

## ✅ CAMBIO IMPLEMENTADO

### ANTES ❌
```
Registros de Tiempo (Admin):
- Veía TODOS los registros mezclados
- Columna "Usuario" visible
- Filtro de usuario
- Confuso: ¿Es mi registro o de otro?
```

### AHORA ✅
```
Registros de Tiempo (TODOS):
- Solo ves TUS registros
- Sin columna "Usuario" (no hace falta)
- Sin filtro de usuario
- Claro: Es MI espacio personal

Reportes (Admin):
- Ve datos de TODOS
- Filtros completos
- Análisis global
```

---

## 📊 NUEVA ESTRUCTURA

### 📋 REGISTROS DE TIEMPO
**Propósito:** Gestión personal de horas

**Para TODOS los usuarios (operario, admin, superadmin):**
- ✅ Ver solo MIS registros
- ✅ Cargar MIS horas
- ✅ Editar MIS registros
- ✅ Eliminar MIS registros
- ✅ Filtrar por fecha (mes/año/todo)

**Para Admin/SuperAdmin ADEMÁS:**
- ✅ Cargar horas para otros usuarios (selector en modal)
- ✅ Las horas cargadas para otros NO aparecen en mi historial

**Mensaje para admins:**
```
💡 Nota: Esta sección muestra solo tus registros personales. 
Para ver datos de otros usuarios, ve a Reportes.
```

---

### 📊 REPORTES
**Propósito:** Análisis y supervisión global

**Para Operarios:**
- ✅ Ver solo sus reportes personales
- ✅ Exportar sus datos

**Para Admin/SuperAdmin:**
- ✅ Ver reportes de TODOS
- ✅ Filtrar por usuario
- ✅ Filtrar por área/unidad
- ✅ Filtrar por fecha
- ✅ Análisis comparativos
- ✅ Exportar reportes globales

---

## 🎯 CASOS DE USO

### Caso 1: Admin carga sus propias horas
**Flujo:**
1. Va a **Registros de Tiempo**
2. Click en **📋 Cargar Horas**
3. Selector de usuario: (su propio nombre por defecto)
4. Carga sus tareas
5. Guarda
6. ✅ Aparecen en su historial personal

---

### Caso 2: Admin carga horas para Juan (que olvidó cargar)
**Flujo:**
1. Va a **Registros de Tiempo**
2. Click en **📋 Cargar Horas**
3. Selector de usuario: **Juan Pérez**
4. Selecciona fecha del lunes
5. Carga las tareas de Juan
6. Guarda
7. ✅ Horas guardadas con `user_id` de Juan
8. ✅ NO aparecen en el historial del admin (son de Juan)

**Para verificar que se guardaron:**
- Ir a **Reportes**
- Filtrar por usuario: Juan
- Ver que las horas están ahí

---

### Caso 3: Admin quiere revisar productividad de Juan
**Flujo:**
1. Va a **Reportes** (NO a Registros)
2. Selecciona rango de fechas
3. Filtra por usuario: Juan
4. Ve análisis completo de Juan
5. Exporta si necesita

**NO debe:**
- ❌ Ir a Registros de Tiempo
- ❌ Buscar en su propio historial

---

### Caso 4: Admin quiere ver su propia productividad
**Opción A - Registros:**
1. Va a **Registros de Tiempo**
2. Filtra por mes/año
3. Ve su historial personal

**Opción B - Reportes:**
1. Va a **Reportes**
2. Filtra por su usuario
3. Ve análisis detallado

---

## 🔄 COMPARACIÓN DETALLADA

### Registros de Tiempo

| Característica | Operario | Admin | SuperAdmin |
|----------------|----------|-------|------------|
| **Ve en historial** | Solo suyos | Solo suyos | Solo suyos |
| **Puede cargar para** | Sí mismo | Sí mismo + operarios | Sí mismo + todos |
| **Selector de usuario** | ❌ No visible | ✅ Visible | ✅ Visible |
| **Filtro de usuario** | ❌ No | ❌ No | ❌ No |
| **Columna "Usuario"** | ❌ No | ❌ No | ❌ No |
| **Propósito** | Personal | Personal | Personal |

### Reportes

| Característica | Operario | Admin | SuperAdmin |
|----------------|----------|-------|------------|
| **Ve en reportes** | Solo suyos | TODOS | TODOS |
| **Filtro de usuario** | ❌ No | ✅ Sí | ✅ Sí |
| **Filtro de área** | ❌ No | ✅ Sí | ✅ Sí |
| **Análisis global** | ❌ No | ✅ Sí | ✅ Sí |
| **Propósito** | Personal | Supervisión | Supervisión |

---

## 💡 VENTAJAS DEL NUEVO DISEÑO

### 1. Claridad
- ✅ Cada sección tiene un propósito claro
- ✅ No hay confusión sobre qué datos se ven
- ✅ Interfaz más limpia

### 2. Separación de Responsabilidades
- ✅ Registros = Gestión personal
- ✅ Reportes = Análisis y supervisión
- ✅ Cada uno optimizado para su propósito

### 3. Mejor UX
- ✅ Admin no ve registros mezclados
- ✅ Historial personal es realmente personal
- ✅ Menos columnas innecesarias

### 4. Consistencia
- ✅ TODOS tienen la misma experiencia en Registros
- ✅ Solo cambia el selector de usuario al cargar
- ✅ Diferencias claras entre roles solo en Reportes

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Frontend - Filtro Personal

```javascript
// frontend/src/pages/TimeEntries.jsx

// TODOS los usuarios solo ven SUS PROPIOS registros
const filteredEntries = timeEntries.filter(entry => {
  const entryDate = safeDate(entry.start_time);
  
  // Filtro 1: Solo registros del usuario actual
  const isMyEntry = entry.user_id === user?.id;
  
  // Filtro 2: Por fecha
  let dateMatch = true;
  if (filterMode === 'month') {
    const entryMonth = format(entryDate, 'yyyy-MM');
    dateMatch = entryMonth === selectedMonth;
  } else if (filterMode === 'year') {
    const entryYear = format(entryDate, 'yyyy');
    dateMatch = entryYear === selectedYear;
  }
  
  return isMyEntry && dateMatch;
});
```

### Tabla sin columna "Usuario"

```javascript
// Ya no hay columna de usuario - no hace falta
<thead>
  <tr>
    <th>Tarea</th>
    <th>Horas</th>
    <th></th> {/* Acciones */}
  </tr>
</thead>
```

### Mensaje Informativo para Admins

```javascript
{(user?.role === 'admin' || user?.role === 'superadmin') && (
  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-800">
      💡 <strong>Nota:</strong> Esta sección muestra solo tus registros personales. 
      Para ver datos de otros usuarios, ve a <strong>Reportes</strong>.
    </p>
  </div>
)}
```

---

## 📋 FLUJO COMPLETO: Admin carga horas para operario

### Paso 1: Abrir Carga de Horas
```
Admin va a: Registros de Tiempo
Click en: 📋 Cargar Horas
```

### Paso 2: Seleccionar Usuario
```
┌─────────────────────────────────┐
│ 📋 Carga de Horas por Tarea     │
├─────────────────────────────────┤
│ Fecha: [2026-03-28 ▼]           │
│ Usuario: [Juan Pérez ▼]  ← Selecciona│
│   - Mi Usuario (Admin)          │
│   - Juan Pérez                  │
│   - María García                │
└─────────────────────────────────┘
```

### Paso 3: Cargar Tareas
```
Empaque: 4h
Producción: 4h
Total: 8h
```

### Paso 4: Guardar
```
✅ Horas guardadas con user_id de Juan
```

### Paso 5: Verificar
```
Historial del Admin:
📅 28/03 - 8h (sus propias horas)
  - Tarea A: 4h
  - Tarea B: 4h

(NO aparecen las horas de Juan aquí)

Para ver las horas de Juan:
Ir a Reportes > Filtrar por Juan
```

---

## ✅ CHECKLIST DE CAMBIOS

### Eliminado
- [x] Columna "Usuario" en historial
- [x] Filtro de usuario en Registros
- [x] Registros mezclados de todos los usuarios

### Agregado
- [x] Filtro personal (solo mis registros)
- [x] Mensaje informativo para admins
- [x] Descripción actualizada ("personales")

### Mantenido
- [x] Selector de usuario en modal de carga (admins)
- [x] Validación backend (admin no carga para admin)
- [x] Filtros de fecha (mes/año/todo)

---

## 🎉 RESULTADO FINAL

### Registros de Tiempo
```
┌─────────────────────────────────────┐
│ Registro de Horas                   │
│ Gestiona tus registros personales   │
│                                     │
│ 💡 Nota (Admin): Para ver datos de │
│    otros, ve a Reportes             │
├─────────────────────────────────────┤
│ Filtros: [Mes ▼] [2026-03 ▼]       │
│ [📋 Cargar Horas]                   │
├─────────────────────────────────────┤
│ 📅 28/03 - 8h                       │
│   Empaque - 4h                      │
│   Producción - 4h                   │
│                                     │
│ 📅 27/03 - 8h                       │
│   Empaque - 8h                      │
└─────────────────────────────────────┘
```

### Reportes
```
┌─────────────────────────────────────┐
│ Reportes                            │
│ Análisis y supervisión global       │
├─────────────────────────────────────┤
│ Filtros:                            │
│ Fecha: [01/03] - [31/03]            │
│ Usuario: [Todos ▼]                  │
│ Unidad: [Todas ▼]                   │
├─────────────────────────────────────┤
│ 👤 Juan - 160h                      │
│ 👤 María - 168h                     │
│ 👤 Admin - 40h                      │
└─────────────────────────────────────┘
```

---

## 📝 RESUMEN

**Registros de Tiempo:**
- 🎯 Propósito: Gestión personal
- 👤 Alcance: Solo mis datos
- 🔧 Acción: Cargar/editar mis horas (+ cargar para otros si soy admin)

**Reportes:**
- 🎯 Propósito: Análisis y supervisión
- 👥 Alcance: Datos globales (según rol)
- 📊 Acción: Ver, filtrar, analizar, exportar

---

**Fecha:** 28 de marzo de 2026  
**Versión:** 2.0.0  
**Estado:** ✅ Implementado
