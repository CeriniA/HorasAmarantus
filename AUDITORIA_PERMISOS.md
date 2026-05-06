# 🔒 AUDITORÍA COMPLETA: SISTEMA DE PERMISOS RBAC

**Fecha**: 2026-05-06
**Sistema**: Horas Amarantus
**Objetivo**: Identificar gaps en validación de permisos frontend

---

## 📋 **RESUMEN EJECUTIVO**

### **Estado Actual**
- ✅ Backend: Sistema RBAC completo implementado
- ⚠️ Frontend: Validaciones inconsistentes
- ❌ Gaps críticos encontrados

### **Permisos Definidos**

```javascript
RECURSOS:
- users
- time_entries
- org_units
- objectives
- reports
- settings
- roles
- permissions

ACCIONES:
- view, create, update, delete
- export, import
- activate, complete, manage, assign

SCOPES:
- all (todos)
- team (equipo)
- own (propios)
```

---

## 🔴 **GAPS CRÍTICOS ENCONTRADOS**

### **1. Reports.jsx - EXPORTACIÓN SIN VALIDACIÓN**

**Ubicación**: `frontend/src/pages/Reports.jsx`

**Problema**:
```javascript
// Líneas 276-288 - NO VALIDA PERMISOS
<Button onClick={handleExportCSV}>CSV</Button>
<Button onClick={handleExportExcel}>Excel</Button>
<Button onClick={handleExportPDF}>PDF</Button>
<Button onClick={handleExportPayroll}>Nómina</Button>
```

**Permiso requerido**: `reports.export.{all|team|own}`

**Impacto**: 🔴 CRÍTICO
- Operarios pueden exportar datos de otros usuarios
- No respeta scopes de permisos

**Solución**:
```javascript
const { canExportReports, userCan } = usePermissions();

// Validar antes de mostrar botones
{canExportReports() && (
  <div className="flex gap-2">
    <Button onClick={handleExportCSV}>CSV</Button>
    <Button onClick={handleExportExcel}>Excel</Button>
    <Button onClick={handleExportPDF}>PDF</Button>
  </div>
)}

// Validar en función de exportación
const handleExportCSV = () => {
  if (!canExportReports()) {
    alert('No tienes permisos para exportar');
    return;
  }
  exportToCSV(filteredEntries, startDate, endDate);
};
```

---

### **2. BulkUserImport.jsx - IMPORTACIÓN SIN VALIDACIÓN**

**Ubicación**: `frontend/src/components/users/BulkUserImport.jsx`

**Problema**:
```javascript
// Línea 171 - NO VALIDA PERMISOS
<Button onClick={handleImport}>
  Importar {preview.length} Usuarios
</Button>
```

**Permiso requerido**: `users.import.all`

**Impacto**: 🟡 MEDIO
- Solo accesible desde UserManagement (ya protegido)
- Pero falta validación explícita

**Solución**:
```javascript
const { userCan } = usePermissions();

{userCan('users', 'import', 'all') && (
  <Button onClick={handleImport}>
    Importar {preview.length} Usuarios
  </Button>
)}
```

---

### **3. BulkOrgUnitImport.jsx - IMPORTACIÓN SIN VALIDACIÓN**

**Ubicación**: `frontend/src/components/organizationalUnits/BulkOrgUnitImport.jsx`

**Problema**: Similar a BulkUserImport

**Permiso requerido**: `org_units.import.all`

**Impacto**: 🟡 MEDIO

---

### **4. UserManagement.jsx - VALIDACIÓN PARCIAL**

**Ubicación**: `frontend/src/pages/UserManagement.jsx`

**Estado actual**:
```javascript
const { can } = usePermissions();
```

**Problema**: 
- Usa `can()` pero NO valida en todos los botones
- Falta validación en botones de crear/editar/eliminar

**Solución**: Agregar validaciones explícitas

---

### **5. OrganizationalUnits.jsx - SIN HOOK DE PERMISOS**

**Ubicación**: `frontend/src/pages/OrganizationalUnits.jsx`

**Problema**: 
- NO importa `usePermissions`
- Botones de crear/editar/eliminar sin validación

**Permiso requerido**: `org_units.{create|update|delete}.all`

**Impacto**: 🔴 CRÍTICO

---

### **6. RoleManagement.jsx - VALIDACIÓN SOLO POR ROL**

**Ubicación**: `frontend/src/pages/RoleManagement.jsx`

**Estado actual**:
```javascript
const { isSuperadmin } = usePermissions();
```

**Problema**:
- Solo valida si es superadmin (hardcoded)
- NO usa permisos granulares

**Debería usar**: `roles.manage.all`

---

### **7. Objectives.jsx - VALIDACIÓN PARCIAL**

**Ubicación**: `frontend/src/pages/Objectives.jsx`

**Problema**:
- Falta validación en botones de crear/editar/eliminar
- No valida scopes (company/assigned/personal)

**Permisos requeridos**:
- `objectives.create.{company|assigned|personal}`
- `objectives.update.{all|own}`
- `objectives.delete.{all|own}`

---

### **8. TimeEntries.jsx - VALIDACIÓN IMPLÍCITA**

**Ubicación**: `frontend/src/pages/TimeEntries.jsx`

**Estado**: ✅ PARCIALMENTE OK
- Backend valida en endpoints
- Frontend NO valida botones explícitamente

**Mejora recomendada**: Agregar validación UI

---

## 📊 **TABLA RESUMEN DE GAPS**

| Archivo | Acción | Permiso Faltante | Impacto |
|---------|--------|------------------|---------|
| **Reports.jsx** | Export CSV/Excel/PDF | `reports.export.*` | 🔴 CRÍTICO |
| **BulkUserImport.jsx** | Import usuarios | `users.import.all` | 🟡 MEDIO |
| **BulkOrgUnitImport.jsx** | Import unidades | `org_units.import.all` | 🟡 MEDIO |
| **UserManagement.jsx** | CRUD usuarios | `users.{create\|update\|delete}.*` | 🟡 MEDIO |
| **OrganizationalUnits.jsx** | CRUD unidades | `org_units.*.*` | 🔴 CRÍTICO |
| **RoleManagement.jsx** | CRUD roles | `roles.manage.all` | 🟡 MEDIO |
| **Objectives.jsx** | CRUD objetivos | `objectives.*.*` | 🟡 MEDIO |
| **TimeEntries.jsx** | CRUD horas | `time_entries.*.*` | 🟢 BAJO |

---

## ✅ **PLAN DE ACCIÓN RECOMENDADO**

### **Prioridad 1 - CRÍTICO**
1. ✅ Reports.jsx - Validar exportación
2. ✅ OrganizationalUnits.jsx - Agregar validaciones CRUD

### **Prioridad 2 - MEDIO**
3. BulkUserImport.jsx - Validar importación
4. BulkOrgUnitImport.jsx - Validar importación
5. UserManagement.jsx - Completar validaciones
6. RoleManagement.jsx - Usar permisos granulares
7. Objectives.jsx - Validar scopes

### **Prioridad 3 - MEJORAS**
8. TimeEntries.jsx - Validación explícita UI
9. Crear componente `<ProtectedAction>` reutilizable
10. Documentar patrones de validación

---

## 🔧 **PATRÓN RECOMENDADO**

```javascript
// 1. Importar hook
import { usePermissions } from '../hooks/usePermissions.v2';

// 2. Usar en componente
const { userCan, canExportReports } = usePermissions();

// 3. Validar en UI
{userCan('resource', 'action', 'scope') && (
  <Button onClick={handleAction}>Acción</Button>
)}

// 4. Validar en función
const handleAction = () => {
  if (!userCan('resource', 'action', 'scope')) {
    alert('No tienes permisos');
    return;
  }
  // Ejecutar acción
};
```

---

## 📝 **NOTAS ADICIONALES**

### **Backend**
- ✅ Sistema RBAC completo
- ✅ Middleware de permisos funcionando
- ✅ Validación en endpoints

### **Frontend**
- ⚠️ Hook `usePermissions.v2` disponible pero subutilizado
- ⚠️ Validaciones inconsistentes
- ❌ Muchos botones sin validación

### **Recomendación**
Implementar validaciones de forma sistemática en todos los componentes que ejecuten acciones protegidas.

---

**Fin del reporte**
