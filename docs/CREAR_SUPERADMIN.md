# 🔐 Crear Usuario Superadmin

## 📋 Credenciales

- **Email**: `superamarantus`
- **Password**: `ContraseñaDificil123!`
- **Rol**: `superadmin`

---

## 🚀 Método 1: Script Automático (RECOMENDADO)

### Ejecutar desde la carpeta backend:

```bash
cd backend
npm run create-superadmin
```

### Salida esperada:

```
🔐 Creando superadmin...

⏳ Generando hash del password...
✅ Hash generado

➕ Creando nuevo usuario...
✅ Usuario creado exitosamente

📋 Detalles del usuario:
─────────────────────────────────────
Email:     superamarantus
Nombre:    Super Administrador
Rol:       superadmin
Activo:    true
Creado:    4/3/2026, 12:33:00
─────────────────────────────────────

🎉 ¡Superadmin creado exitosamente!

📝 Credenciales:
─────────────────────────────────────
Email:     superamarantus
Password:  ContraseñaDificil123!
─────────────────────────────────────

⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro
💡 Puedes hacer login en: http://localhost:5173/login
```

---

## 🔧 Método 2: SQL Manual

### En Supabase Dashboard → SQL Editor:

```sql
-- 1. Generar hash del password
-- Usa el script: npm run hash
-- Input: ContraseñaDificil123!
-- Output: (copia el hash generado)

-- 2. Insertar usuario
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  role, 
  is_active
) VALUES (
  'superamarantus',
  '$2a$10$...',  -- Pegar el hash aquí
  'Super Administrador',
  'superadmin',
  true
)
ON CONFLICT (email) DO UPDATE 
SET 
  role = 'superadmin',
  is_active = true;

-- 3. Verificar
SELECT 
  email, 
  name, 
  role, 
  is_active
FROM users 
WHERE email = 'superamarantus';
```

---

## 🔑 Generar Hash del Password (si usas Método 2)

### Desde la carpeta backend:

```bash
cd backend
npm run hash
```

### Input cuando te lo pida:
```
ContraseñaDificil123!
```

### Copia el hash generado y úsalo en el SQL

---

## ✅ Verificar Creación

### Opción 1: En Supabase

```sql
SELECT 
  email, 
  name, 
  role, 
  is_active,
  created_at
FROM users 
WHERE email = 'superamarantus';
```

**Resultado esperado**:
```
email           | name                  | role       | is_active | created_at
----------------|----------------------|------------|-----------|------------------
superamarantus  | Super Administrador  | superadmin | true      | 2026-03-04 ...
```

### Opción 2: En la aplicación

1. Ir a http://localhost:5173/login
2. Login con:
   - Email: `superamarantus`
   - Password: `ContraseñaDificil123!`
3. Verificar que tienes acceso a:
   - Dashboard
   - Registrar Horas
   - Estructura
   - Reportes
   - **Usuarios** ← Solo superadmin

---

## 🎯 Permisos del Superadmin

Como superadmin, puedes:

- ✅ Ver todos los usuarios
- ✅ Crear usuarios con cualquier rol (superadmin, admin, operario)
- ✅ Editar cualquier usuario
- ✅ Eliminar cualquier usuario
- ✅ Cambiar roles de usuarios
- ✅ Gestionar áreas y procesos
- ✅ Ver todos los reportes
- ✅ Acceso total al sistema

---

## 🔄 Si el Usuario Ya Existe

El script automáticamente:
- Detecta si el email ya existe
- Actualiza el rol a `superadmin`
- Actualiza el password
- Activa el usuario

No hay problema si ejecutas el script varias veces.

---

## 🐛 Troubleshooting

### Error: "SUPABASE_URL no encontrado"

**Solución**: Verifica que el archivo `backend/.env` tenga:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Error: "Email ya existe"

**Solución**: El script maneja esto automáticamente. Si ves este error en SQL manual, usa:
```sql
UPDATE users 
SET role = 'superadmin', password_hash = '$2a$10$...'
WHERE email = 'superamarantus';
```

### No puedo hacer login

**Solución**:
1. Verifica que el usuario existe en Supabase
2. Verifica que `is_active = true`
3. Verifica que el password_hash está correcto
4. Intenta regenerar el hash con `npm run hash`

---

## 📝 Siguiente Paso

Después de crear el superadmin:

1. **Login** con las credenciales
2. **Ir a** `/admin/users`
3. **Crear** otros usuarios (admins, operarios)
4. **Gestionar** el sistema completo

---

## ⚠️ Seguridad

- 🔒 Guarda las credenciales en un lugar seguro
- 🔒 No compartas el password
- 🔒 Considera cambiar el password después del primer login
- 🔒 El superadmin tiene acceso total al sistema

---

**¡Listo para usar!** 🎉
