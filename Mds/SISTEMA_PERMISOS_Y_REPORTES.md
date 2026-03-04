# 🔐 Sistema de Permisos y Reportes Mejorados

## 📊 Estado Actual

### Roles Existentes:
- **admin**: Acceso total
- **supervisor**: Acceso a su área
- **operario**: Solo sus propios datos

### Limitaciones Actuales:
- ❌ No hay superadmin
- ❌ Admin no puede gestionar usuarios desde UI
- ❌ Permisos para crear áreas/procesos no están claros
- ❌ Reportes básicos, sin filtros avanzados

---

## 🎯 Propuesta de Mejora

### 1. Sistema de Roles Mejorado

```
┌─────────────────────────────────────────────────────┐
│ SUPERADMIN                                          │
│ ├─ Gestionar usuarios (crear, editar, eliminar)    │
│ ├─ Gestionar todas las áreas/procesos              │
│ ├─ Ver todos los reportes                          │
│ ├─ Configuración del sistema                       │
│ └─ Acceso total sin restricciones                  │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ ADMIN                                               │
│ ├─ Gestionar áreas/procesos                        │
│ ├─ Ver reportes de todas las áreas                 │
│ ├─ Gestionar usuarios de su área                   │
│ └─ Aprobar/rechazar registros de tiempo            │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ SUPERVISOR                                          │
│ ├─ Crear procesos/subprocesos en su área           │
│ ├─ Ver reportes de su área                         │
│ ├─ Ver registros de su equipo                      │
│ └─ Gestionar tareas de su área                     │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ OPERARIO                                            │
│ ├─ Registrar sus horas                             │
│ ├─ Ver sus propios registros                       │
│ └─ Ver tareas asignadas                            │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Matriz de Permisos Detallada

### Gestión de Usuarios

| Acción | Superadmin | Admin | Supervisor | Operario |
|--------|-----------|-------|------------|----------|
| Ver todos los usuarios | ✅ | ✅ | ❌ | ❌ |
| Ver usuarios de su área | ✅ | ✅ | ✅ | ❌ |
| Ver su propio perfil | ✅ | ✅ | ✅ | ✅ |
| Crear usuarios | ✅ | ✅* | ❌ | ❌ |
| Editar cualquier usuario | ✅ | ❌ | ❌ | ❌ |
| Editar usuarios de su área | ✅ | ✅ | ❌ | ❌ |
| Editar su propio perfil | ✅ | ✅ | ✅ | ✅ |
| Eliminar usuarios | ✅ | ❌ | ❌ | ❌ |
| Cambiar roles | ✅ | ❌ | ❌ | ❌ |

*Admin solo puede crear usuarios con rol ≤ supervisor

### Gestión de Áreas/Procesos

| Acción | Superadmin | Admin | Supervisor | Operario |
|--------|-----------|-------|------------|----------|
| **ÁREAS** |
| Crear área | ✅ | ✅ | ❌ | ❌ |
| Editar área | ✅ | ✅ | ❌ | ❌ |
| Eliminar área | ✅ | ✅ | ❌ | ❌ |
| **PROCESOS** |
| Crear proceso | ✅ | ✅ | ✅* | ❌ |
| Editar proceso | ✅ | ✅ | ✅* | ❌ |
| Eliminar proceso | ✅ | ✅ | ✅* | ❌ |
| **SUBPROCESOS** |
| Crear subproceso | ✅ | ✅ | ✅* | ❌ |
| Editar subproceso | ✅ | ✅ | ✅* | ❌ |
| Eliminar subproceso | ✅ | ✅ | ✅* | ❌ |
| **TAREAS** |
| Crear tarea | ✅ | ✅ | ✅ | ❌ |
| Editar tarea | ✅ | ✅ | ✅ | ❌ |
| Eliminar tarea | ✅ | ✅ | ✅ | ❌ |

*Supervisor solo en su área asignada

### Registros de Tiempo

| Acción | Superadmin | Admin | Supervisor | Operario |
|--------|-----------|-------|------------|----------|
| Ver todos los registros | ✅ | ✅ | ❌ | ❌ |
| Ver registros de su área | ✅ | ✅ | ✅ | ❌ |
| Ver sus propios registros | ✅ | ✅ | ✅ | ✅ |
| Crear registro propio | ✅ | ✅ | ✅ | ✅ |
| Crear registro para otros | ✅ | ✅ | ❌ | ❌ |
| Editar cualquier registro | ✅ | ✅ | ❌ | ❌ |
| Editar registro propio | ✅ | ✅ | ✅ | ✅ |
| Eliminar cualquier registro | ✅ | ✅ | ❌ | ❌ |
| Eliminar registro propio | ✅ | ✅ | ✅ | ✅ |

### Reportes

| Acción | Superadmin | Admin | Supervisor | Operario |
|--------|-----------|-------|------------|----------|
| Reportes globales | ✅ | ✅ | ❌ | ❌ |
| Reportes por área | ✅ | ✅ | ✅* | ❌ |
| Reportes por proceso | ✅ | ✅ | ✅* | ❌ |
| Reportes por subproceso | ✅ | ✅ | ✅* | ❌ |
| Reportes por usuario | ✅ | ✅ | ✅* | ❌ |
| Reporte personal | ✅ | ✅ | ✅ | ✅ |
| Exportar reportes | ✅ | ✅ | ✅ | ❌ |

*Supervisor solo de su área

---

## 🗄️ Cambios en Base de Datos

### Actualizar Rol Superadmin

```sql
-- Agregar superadmin al CHECK constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('superadmin', 'admin', 'supervisor', 'operario'));

-- Crear primer superadmin
UPDATE users 
SET role = 'superadmin' 
WHERE email = 'tu-email@ejemplo.com';
```

### Nueva Tabla: Permisos (Opcional - Para futuro)

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ejemplos:
INSERT INTO permissions (role, resource, action) VALUES
  ('superadmin', '*', '*'),  -- Acceso total
  ('admin', 'users', 'create'),
  ('admin', 'areas', 'create'),
  ('supervisor', 'processes', 'create'),
  ('supervisor', 'reports', 'view');
```

---

## 🎨 Nuevas Páginas Frontend

### 1. Panel de Administración (Superadmin/Admin)

```
/admin
├── /admin/users          → Gestión de usuarios
├── /admin/areas          → Gestión de áreas
├── /admin/settings       → Configuración del sistema
└── /admin/audit          → Logs de auditoría
```

**Componentes**:
- `UserManagement.jsx` - CRUD de usuarios
- `AreaManagement.jsx` - CRUD de áreas/procesos
- `SystemSettings.jsx` - Configuración
- `AuditLog.jsx` - Historial de cambios

### 2. Reportes Mejorados

```
/reports
├── /reports/overview     → Vista general
├── /reports/by-area      → Por área
├── /reports/by-process   → Por proceso
├── /reports/by-user      → Por usuario
└── /reports/custom       → Personalizado
```

**Filtros Avanzados**:
- Rango de fechas
- Área/Proceso/Subproceso/Tarea
- Usuario/Equipo
- Tipo de visualización (tabla, gráfico, calendario)
- Exportar (PDF, Excel, CSV)

---

## 📋 Implementación por Fases

### Fase 1: Sistema de Permisos ✅ (Prioritario)

1. **Backend**:
   - ✅ Actualizar schema con superadmin
   - ✅ Crear middleware de permisos mejorado
   - ✅ Actualizar rutas con nuevos permisos
   - ✅ Crear endpoints para gestión de usuarios

2. **Frontend**:
   - ✅ Crear página de gestión de usuarios
   - ✅ Actualizar componentes con permisos
   - ✅ Crear hook `usePermissions`

### Fase 2: Reportes Mejorados 📊 (Siguiente)

1. **Backend**:
   - ✅ Crear endpoints de reportes avanzados
   - ✅ Agregar filtros y agregaciones
   - ✅ Implementar exportación

2. **Frontend**:
   - ✅ Rediseñar página de reportes
   - ✅ Agregar filtros avanzados
   - ✅ Implementar gráficos mejorados
   - ✅ Agregar exportación

### Fase 3: Auditoría y Logs 📝 (Futuro)

1. **Backend**:
   - ⏳ Crear tabla de audit_logs
   - ⏳ Middleware de logging
   - ⏳ Endpoints de consulta

2. **Frontend**:
   - ⏳ Página de auditoría
   - ⏳ Visualización de cambios

---

## 🚀 Próximos Pasos

### Inmediatos:

1. ✅ Actualizar schema con superadmin
2. ✅ Crear página de gestión de usuarios
3. ✅ Implementar permisos granulares
4. ✅ Mejorar sistema de reportes

### A Corto Plazo:

5. ⏳ Agregar exportación de reportes
6. ⏳ Implementar filtros avanzados
7. ⏳ Crear dashboard para supervisores

### A Mediano Plazo:

8. ⏳ Sistema de notificaciones
9. ⏳ Auditoría completa
10. ⏳ Reportes personalizables

---

## 📝 Notas de Implementación

### Permisos en Frontend

```javascript
// hooks/usePermissions.js
export const usePermissions = () => {
  const { user } = useAuthContext();
  
  const can = (action, resource) => {
    // Superadmin puede todo
    if (user.role === 'superadmin') return true;
    
    // Matriz de permisos
    const permissions = {
      admin: {
        users: ['view', 'create', 'edit'],
        areas: ['view', 'create', 'edit', 'delete'],
        reports: ['view', 'export']
      },
      supervisor: {
        processes: ['view', 'create', 'edit'],
        reports: ['view']
      },
      operario: {
        time_entries: ['view', 'create', 'edit']
      }
    };
    
    return permissions[user.role]?.[resource]?.includes(action);
  };
  
  return { can };
};
```

### Uso en Componentes

```jsx
const UserManagement = () => {
  const { can } = usePermissions();
  
  return (
    <div>
      {can('create', 'users') && (
        <button onClick={handleCreate}>Crear Usuario</button>
      )}
      
      {can('delete', 'users') && (
        <button onClick={handleDelete}>Eliminar</button>
      )}
    </div>
  );
};
```

---

## 🎯 Resumen

### Roles:
- **Superadmin**: Acceso total, gestión de usuarios
- **Admin**: Gestión de áreas, reportes globales
- **Supervisor**: Gestión de procesos en su área
- **Operario**: Solo sus registros

### Nuevas Funcionalidades:
- ✅ Panel de administración de usuarios
- ✅ Permisos granulares por rol
- ✅ Reportes avanzados con filtros
- ✅ Exportación de datos
- ⏳ Auditoría de cambios

---

**¿Empezamos con la Fase 1?** 🚀
