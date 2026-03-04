# 📘 Guía de Configuración de Supabase

Esta guía te llevará paso a paso para configurar la base de datos en Supabase.

## 1️⃣ Crear Cuenta y Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Click en **Start your project**
3. Crea una cuenta (puedes usar GitHub)
4. Click en **New Project**
5. Completa:
   - **Name**: Horas Amarantus 
   - **Database Password**: BTIrrtPqSrdcGQiu
   - **Region**: Elige la más cercana a tu ubicación
   - **Pricing Plan**: Free
6. Click en **Create new project**
7. Espera 2-3 minutos mientras se crea el proyecto

## 2️⃣ Ejecutar Schema SQL

1. En el panel izquierdo, click en **SQL Editor**
2. Click en **New Query**
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. Copia TODO el contenido
5. Pégalo en el editor SQL de Supabase
6. Click en **Run** (abajo a la derecha)
7. Deberías ver: "Success. No rows returned"

**Esto creará:**
- ✅ Todas las tablas (users, organizational_units, time_entries, etc.)
- ✅ Políticas de seguridad (RLS)
- ✅ Triggers automáticos
- ✅ Funciones útiles
- ✅ Vistas para reportes

## 3️⃣ Crear Usuarios en Auth

**IMPORTANTE:** Primero debes crear los usuarios en Supabase Auth, luego ejecutar el seed.

1. En el panel izquierdo, click en **Authentication**
2. Click en **Users**
3. Click en **Add user** → **Create new user**

### Usuario Admin
- **Email**: `admin@horticola.com`
- **Password**: ContraseñaSegura123!
- **Auto Confirm User**: ✅ (activar)
- Click **Create user**
- **IMPORTANTE:** Copia el **User UID** que aparece: "1fa2dea5-5852-4eed-94f8-757aef724d9f"

### Usuario Supervisor
- **Email**: `supervisor.produccion@horticola.com`
- **Password**: (elige una contraseña)
- **Auto Confirm User**: ✅
- Click **Create user**
- Copia el **User UID** 

### Usuario Operario 1
- **Email**: `operario1@horticola.com`
- **Password**: (elige una contraseña)
- **Auto Confirm User**: ✅
- Click **Create user**
- Copia el **User UID**

Repite para los demás operarios si quieres:
- `operario2@horticola.com`
- `operario3@horticola.com`
- `operario4@horticola.com`
- `operario5@horticola.com`

## 4️⃣ Actualizar IDs en seed.sql

1. Abre `supabase/seed.sql`
2. Busca la sección `INSERTAR USUARIOS`
3. Reemplaza los UUIDs con los que copiaste:

```sql
-- Usuario Admin
INSERT INTO users (id, email, name, role, organizational_unit_id) VALUES
('PEGA-AQUI-EL-UUID-DEL-ADMIN', 'admin@horticola.com', 'Juan Pérez', 'admin', NULL);

-- Supervisores
INSERT INTO users (id, email, name, role, organizational_unit_id) VALUES
('PEGA-AQUI-EL-UUID-DEL-SUPERVISOR', 'supervisor.produccion@horticola.com', 'María González', 'supervisor', 'a1111111-1111-1111-1111-111111111111'),
...
```

## 5️⃣ Ejecutar Seed SQL

1. Vuelve a **SQL Editor**
2. **New Query**
3. Abre `supabase/seed.sql` (con los UUIDs actualizados)
4. Copia TODO el contenido
5. Pégalo en el editor
6. Click en **Run**
7. Deberías ver un resumen de registros insertados

**Esto creará:**
- ✅ Estructura organizacional de ejemplo
- ✅ Perfiles de usuarios
- ✅ Registros de horas de ejemplo

## 6️⃣ Obtener Credenciales de la API

1. En el panel izquierdo, click en **Settings** (⚙️)
2. Click en **API**
3. Copia estos valores:

### Project URL
```

```

### anon public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

## 7️⃣ Configurar Variables de Entorno

1. Ve a la carpeta `frontend/`
2. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edita `.env` y pega tus credenciales:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 8️⃣ Verificar Configuración

1. En Supabase, ve a **Table Editor**
2. Deberías ver estas tablas:
   - ✅ users
   - ✅ organizational_units
   - ✅ time_entries
   - ✅ refresh_tokens

3. Click en **users** → deberías ver tus usuarios
4. Click en **organizational_units** → deberías ver la estructura de ejemplo

## 9️⃣ Probar la Aplicación

1. En la terminal, ve a `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Abre `http://localhost:3000`

3. Inicia sesión con:
   - **Email**: `admin@horticola.com`
   - **Password**: (la que elegiste)

4. ¡Deberías ver el dashboard!

## 🔧 Troubleshooting

### Error: "Invalid login credentials"
- Verifica que el email y contraseña sean correctos
- Verifica que el usuario esté confirmado en Auth

### Error: "Row Level Security policy violation"
- Verifica que ejecutaste `schema.sql` correctamente
- Verifica que los UUIDs en `seed.sql` coincidan con Auth

### No veo datos en el dashboard
- Verifica que ejecutaste `seed.sql`
- Ve a Table Editor y verifica que hay datos en las tablas

### Error: "Faltan variables de entorno"
- Verifica que `.env` existe en `frontend/`
- Verifica que las variables empiezan con `VITE_`
- Reinicia el servidor de desarrollo

## 📊 Verificar Políticas RLS

1. Ve a **Authentication** → **Policies**
2. Deberías ver políticas para cada tabla
3. Si no hay políticas, vuelve a ejecutar `schema.sql`

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. ✅ Cambia las contraseñas de los usuarios de prueba
2. ✅ Crea tus propios usuarios reales
3. ✅ Personaliza la estructura organizacional
4. ✅ Comienza a registrar horas

## 🚀 Deploy a Producción

Cuando estés listo para producción:

1. Tu base de datos Supabase ya está en la nube
2. Solo necesitas deployar el frontend (Vercel/Netlify)
3. Configura las mismas variables de entorno en tu plataforma de hosting

---

**¿Necesitas ayuda?** Revisa el README.md principal o crea un issue en el repositorio.
