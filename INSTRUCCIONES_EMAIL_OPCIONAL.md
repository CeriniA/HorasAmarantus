# 📧 Email Opcional - Instrucciones de Migración

## 🎯 Objetivo

Hacer que el campo `email` sea **opcional** y agregar el campo `username` como **obligatorio** en el sistema.

---

## ✅ Cambios Realizados en el Código

### Backend
- ✅ Validadores actualizados (`validators.js`)
- ✅ Rutas de autenticación actualizadas (`auth.js`)
- ✅ Rutas de usuarios actualizadas (`users.js`)
- ✅ Modelo de datos actualizado (`types.js`)

### Frontend
- ✅ Gestión de usuarios actualizada (`UserManagement.jsx`)
- ✅ Página de configuración actualizada (`Settings.jsx`)
- ✅ Navbar actualizada (desktop y móvil)
- ✅ Formularios actualizados

---

## 🗄️ Migración de Base de Datos (OBLIGATORIO)

### Paso 1: Acceder a Supabase

1. Ve a https://supabase.com
2. Abre tu proyecto
3. Ve a **SQL Editor** en el menú lateral

### Paso 2: Ejecutar la Migración

1. Abre el archivo `MIGRACION_EMAIL_OPCIONAL.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run**

### Paso 3: Verificar

Ejecuta esta query para verificar que todo está correcto:

```sql
SELECT id, username, email, name, role 
FROM users 
LIMIT 10;
```

Deberías ver:
- ✅ Todos los usuarios tienen `username`
- ✅ Algunos usuarios pueden tener `email` NULL
- ✅ No hay errores

---

## 📋 Estructura Final de la Tabla `users`

| Campo | Tipo | Obligatorio | Único | Descripción |
|-------|------|-------------|-------|-------------|
| `id` | UUID | ✅ Sí | ✅ Sí | ID del usuario |
| `username` | TEXT | ✅ Sí | ✅ Sí | Nombre de usuario (nuevo) |
| `email` | TEXT | ❌ No | ✅ Sí* | Email (opcional) |
| `password_hash` | TEXT | ✅ Sí | ❌ No | Hash de contraseña |
| `name` | TEXT | ✅ Sí | ❌ No | Nombre completo |
| `role` | TEXT | ✅ Sí | ❌ No | Rol del usuario |
| `organizational_unit_id` | UUID | ❌ No | ❌ No | Unidad organizacional |
| `is_active` | BOOLEAN | ✅ Sí | ❌ No | Si está activo |
| `created_at` | TIMESTAMP | ✅ Sí | ❌ No | Fecha de creación |
| `updated_at` | TIMESTAMP | ✅ Sí | ❌ No | Fecha de actualización |

\* Email es único solo cuando no es NULL

---

## 🚀 Orden de Despliegue

### 1. **Primero: Migración de Base de Datos**
```
Ejecutar MIGRACION_EMAIL_OPCIONAL.sql en Supabase
```

### 2. **Segundo: Deploy del Backend**
```bash
git add .
git commit -m "Feature: Email opcional y username obligatorio"
git push
```

Render detectará el push y hará el deploy automáticamente.

### 3. **Tercero: Deploy del Frontend**
El frontend se desplegará automáticamente con el mismo push.

---

## 🧪 Pruebas

### Crear Usuario Nuevo (Sin Email)

1. Ve a **Usuarios** → **Crear Usuario**
2. Llena los campos:
   - **Usuario**: `juanperez` ✅
   - **Email**: *(dejar vacío)* ✅
   - **Nombre**: `Juan Pérez`
   - **Password**: `Password123!`
   - **Rol**: `operario`
3. Guardar

**Resultado esperado**: Usuario creado exitosamente sin email.

### Crear Usuario Nuevo (Con Email)

1. Ve a **Usuarios** → **Crear Usuario**
2. Llena los campos:
   - **Usuario**: `mariagarcia` ✅
   - **Email**: `maria@ejemplo.com` ✅
   - **Nombre**: `María García`
   - **Password**: `Password123!`
   - **Rol**: `operario`
3. Guardar

**Resultado esperado**: Usuario creado exitosamente con email.

### Login

**Con username**:
- Usuario: `juanperez`
- Password: `Password123!`
- ✅ Debe funcionar

**Con email** (si el usuario tiene email):
- Usuario: `maria@ejemplo.com`
- Password: `Password123!`
- ✅ Debe funcionar

---

## 🔍 Validaciones Implementadas

### Username
- ✅ Obligatorio
- ✅ Mínimo 3 caracteres
- ✅ Solo letras, números, guiones y guiones bajos
- ✅ Único en el sistema

### Email
- ❌ Opcional (puede estar vacío)
- ✅ Si se proporciona, debe ser un email válido
- ✅ Si se proporciona, debe ser único

### Password
- ✅ Obligatorio al crear usuario
- ✅ Opcional al editar (solo si se quiere cambiar)
- ✅ Mínimo 8 caracteres

---

## 📊 Cambios en la UI

### Gestión de Usuarios

**Tabla de usuarios**:
```
Nombre              Email                    Rol
─────────────────────────────────────────────────
Juan Pérez          Sin email               operario
@juanperez

María García        maria@ejemplo.com       admin
@mariagarcia
```

**Formulario de creación/edición**:
```
┌─────────────────────────────────────┐
│ Usuario *                           │
│ [juanperez___________________]      │
│ Solo letras, números, guiones...    │
├─────────────────────────────────────┤
│ Email (opcional)                    │
│ [usuario@ejemplo.com_________]      │
│ Puede agregarse después             │
└─────────────────────────────────────┘
```

### Navbar

**Desktop**:
```
┌────────────────┐
│ Juan Pérez  ▼  │
├────────────────┤
│ @juanperez     │
│ Rol: operario  │
├────────────────┤
│ Configuración  │
│ Cerrar Sesión  │
└────────────────┘
```

**Mobile**:
```
┌────────────────┐
│ 👤 Juan Pérez  │
│    @juanperez  │
├────────────────┤
│ Configuración  │
│ Cerrar Sesión  │
└────────────────┘
```

### Configuración

```
┌─────────────────────────────────────┐
│ Información del Perfil              │
├─────────────────────────────────────┤
│ Nombre:   Juan Pérez                │
│ Usuario:  juanperez                 │
│ Email:    No configurado            │
│ Rol:      operario                  │
└─────────────────────────────────────┘
```

---

## ⚠️ Notas Importantes

### Para Usuarios Existentes

La migración SQL generará automáticamente usernames para usuarios existentes basándose en:
1. Su email (parte antes del @)
2. O un username genérico si no tienen email

**Ejemplo**:
- Email: `juan.perez@ejemplo.com` → Username: `juan.perez`
- Sin email: → Username: `user_abc12345`

### Compatibilidad con Login Actual

El sistema sigue aceptando login con email SI el usuario tiene email configurado:
- ✅ Login con username: `juanperez`
- ✅ Login con email: `juan.perez@ejemplo.com` (si tiene email)

---

## 🔄 Rollback (Si algo sale mal)

Si necesitas revertir los cambios en la base de datos:

```sql
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
DROP INDEX IF EXISTS users_username_unique;
DROP INDEX IF EXISTS users_email_unique;
CREATE UNIQUE INDEX users_email_key ON users(email);
```

**IMPORTANTE**: Solo ejecutar si realmente necesitas revertir.

---

## ✅ Checklist de Despliegue

- [ ] 1. Ejecutar migración SQL en Supabase
- [ ] 2. Verificar que todos los usuarios tienen username
- [ ] 3. Hacer commit y push del código
- [ ] 4. Esperar deploy en Render (~3 minutos)
- [ ] 5. Probar login con username
- [ ] 6. Probar crear usuario sin email
- [ ] 7. Probar crear usuario con email
- [ ] 8. Verificar que la Navbar muestra @username
- [ ] 9. Verificar que Settings muestra username
- [ ] 10. Verificar que la tabla de usuarios muestra username

---

**¡Listo! El sistema ahora soporta email opcional y username obligatorio.** 🎉
