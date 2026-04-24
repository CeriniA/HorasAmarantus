# 🎨 **CÓMO USAR LA UI DE GESTIÓN DE ROLES**

**Fecha:** 10 de Abril de 2026  
**Estado:** ✅ UI lista, link agregado al menú

---

## 🚀 **CÓMO ACCEDER**

### **1. Login como Superadmin**
```
http://localhost:5173/login
```

### **2. Ver el menú superior**
Ahora verás un nuevo link: **"Roles"**

```
Dashboard | Registrar Horas | Reportes | Estructura | Objetivos | Usuarios | Roles
                                                                              ↑
                                                                         NUEVO!
```

### **3. Click en "Roles"**
Te lleva a: `http://localhost:5173/admin/roles`

---

## 📋 **QUÉ PUEDES HACER EN LA UI**

### **1. VER TODOS LOS ROLES**

```
┌─────────────────────────────────────────────────────┐
│  Gestión de Roles                                   │
│  [+ Crear Rol]                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ Superadministrador                          │  │
│  │ Slug: superadmin                            │  │
│  │ Permisos: 45                                │  │
│  │ [Editar] [Gestionar Permisos]               │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ Administrador                               │  │
│  │ Slug: admin                                 │  │
│  │ Permisos: 20                                │  │
│  │ [Editar] [Gestionar Permisos] [Eliminar]    │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

### **2. CREAR UN ROL NUEVO**

**Click en "+ Crear Rol"**

```
┌─────────────────────────────────────────┐
│  Crear Rol                              │
├─────────────────────────────────────────┤
│                                         │
│  Nombre:                                │
│  [Contador                           ]  │
│                                         │
│  Slug:                                  │
│  [contador                           ]  │
│                                         │
│  Descripción:                           │
│  [Solo acceso a reportes             ]  │
│                                         │
│  ☐ Rol del sistema (no se puede        │
│     eliminar)                           │
│                                         │
│  ☑ Activo                               │
│                                         │
│  [Cancelar]  [Guardar]                  │
└─────────────────────────────────────────┘
```

**Resultado:** Rol creado, pero SIN permisos aún.

---

### **3. ASIGNAR PERMISOS AL ROL**

**Click en "Gestionar Permisos" del rol**

```
┌─────────────────────────────────────────────────────────────┐
│  Permisos del Rol: Contador                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USUARIOS:                                                  │
│  ☐ Ver todos los usuarios (users.view.all)                 │
│  ☐ Ver usuarios de su equipo (users.view.team)             │
│  ☑ Ver su propio perfil (users.view.own)                   │
│  ☐ Crear usuarios (users.create.all)                       │
│  ☐ Editar usuarios (users.update.all)                      │
│  ☑ Editar su propio perfil (users.update.own)              │
│                                                             │
│  REGISTROS DE TIEMPO:                                       │
│  ☑ Ver todos los registros (time_entries.view.all)         │
│  ☐ Ver registros de su equipo (time_entries.view.team)     │
│  ☐ Ver sus propios registros (time_entries.view.own)       │
│  ☐ Crear registros (time_entries.create.all)               │
│  ☐ Editar registros (time_entries.update.all)              │
│  ☐ Eliminar registros (time_entries.delete.all)            │
│                                                             │
│  REPORTES:                                                  │
│  ☑ Ver todos los reportes (reports.view.all)               │
│  ☑ Exportar reportes (reports.export.all)                  │
│                                                             │
│  OBJETIVOS:                                                 │
│  ☐ Ver objetivos (objectives.view.all)                     │
│  ☐ Crear objetivos (objectives.create.all)                 │
│                                                             │
│  UNIDADES ORGANIZACIONALES:                                 │
│  ☐ Ver unidades (organizational_units.view.all)            │
│  ☐ Crear unidades (organizational_units.create.all)        │
│                                                             │
│  ROLES Y PERMISOS:                                          │
│  ☐ Gestionar roles (roles.manage)                          │
│  ☐ Gestionar permisos (permissions.manage)                 │
│                                                             │
│  [Cancelar]  [Guardar Cambios]                              │
└─────────────────────────────────────────────────────────────┘
```

**Resultado:** Rol "Contador" tiene permisos para:
- Ver su perfil
- Ver todos los registros de tiempo
- Ver y exportar reportes

---

### **4. ASIGNAR ROL A UN USUARIO**

**Ir a "Usuarios" → Editar usuario**

```
┌─────────────────────────────────────────┐
│  Editar Usuario: Juan Pérez             │
├─────────────────────────────────────────┤
│                                         │
│  Username: jperez                       │
│  Email: jperez@empresa.com              │
│  Nombre: Juan Pérez                     │
│                                         │
│  Rol:                                   │
│  [Contador                           ▼] │
│   - Superadministrador                  │
│   - Administrador                       │
│   - Supervisor                          │
│   - Líder de Equipo                     │
│   - Operario                            │
│   - Contador  ← NUEVO!                  │
│                                         │
│  Unidad Organizacional:                 │
│  [Administración                     ▼] │
│                                         │
│  [Cancelar]  [Guardar]                  │
└─────────────────────────────────────────┘
```

**Resultado:** Juan ahora tiene rol "Contador" con los permisos configurados.

---

## 🔧 **TAMBIÉN PUEDES USAR LA API**

### **Ver todos los roles:**
```bash
GET http://localhost:3001/api/roles
Authorization: Bearer {token_superadmin}
```

**Response:**
```json
{
  "roles": [
    {
      "id": "uuid-1",
      "name": "Superadministrador",
      "slug": "superadmin",
      "description": "Acceso total",
      "is_system": true,
      "is_active": true
    },
    {
      "id": "uuid-2",
      "name": "Contador",
      "slug": "contador",
      "description": "Solo reportes",
      "is_system": false,
      "is_active": true
    }
  ]
}
```

---

### **Ver permisos de un rol:**
```bash
GET http://localhost:3001/api/roles/{roleId}/permissions
Authorization: Bearer {token_superadmin}
```

**Response:**
```json
{
  "permissions": [
    {
      "id": "uuid-perm-1",
      "resource": "reports",
      "action": "view",
      "scope": "all",
      "description": "Ver todos los reportes"
    },
    {
      "id": "uuid-perm-2",
      "resource": "reports",
      "action": "export",
      "scope": "all",
      "description": "Exportar reportes"
    }
  ]
}
```

---

### **Crear un rol:**
```bash
POST http://localhost:3001/api/roles
Authorization: Bearer {token_superadmin}
Content-Type: application/json

{
  "name": "Contador",
  "slug": "contador",
  "description": "Solo acceso a reportes",
  "is_system": false,
  "is_active": true
}
```

---

### **Asignar permisos a un rol:**
```bash
PUT http://localhost:3001/api/roles/{roleId}/permissions
Authorization: Bearer {token_superadmin}
Content-Type: application/json

{
  "permissionIds": [
    "uuid-perm-reports-view-all",
    "uuid-perm-reports-export-all",
    "uuid-perm-time-entries-view-all"
  ]
}
```

---

### **Ver todos los permisos disponibles:**
```bash
GET http://localhost:3001/api/permissions
Authorization: Bearer {token_superadmin}
```

**Response:**
```json
{
  "permissions": [
    {
      "id": "uuid-1",
      "resource": "users",
      "action": "view",
      "scope": "all",
      "description": "Ver todos los usuarios"
    },
    {
      "id": "uuid-2",
      "resource": "users",
      "action": "view",
      "scope": "own",
      "description": "Ver su propio perfil"
    },
    // ... más permisos
  ]
}
```

---

## ✅ **RESUMEN**

### **Por UI (Recomendado):**
1. Login como superadmin
2. Click en "Roles" en el menú
3. Crear rol
4. Asignar permisos con checkboxes
5. Asignar rol a usuarios

### **Por API:**
1. `GET /api/permissions` - Ver permisos disponibles
2. `POST /api/roles` - Crear rol
3. `PUT /api/roles/{id}/permissions` - Asignar permisos
4. `PUT /api/users/{id}` - Asignar rol a usuario

---

## 🎯 **PRÓXIMOS PASOS**

1. **Ejecuta el query de verificación:**
   - `VERIFICAR_TABLAS_EXISTENTES.sql`
   - Compartí los resultados

2. **Según los resultados:**
   - Te diré qué scripts ejecutar

3. **Prueba la UI:**
   - Login como superadmin
   - Ve a `/admin/roles`
   - Crea un rol de prueba
   - Asigna permisos

---

**Estado:** ✅ **UI lista y accesible desde el menú**
