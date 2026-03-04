# 🌱 Sistema de Horas Hortícola

Sistema web progresivo (PWA) para registro y gestión de horas de trabajo en producción hortícola, con soporte offline completo.

## 🚀 Características

- ✅ **PWA (Progressive Web App)** - Instalable como app nativa en celular
- ✅ **Modo Offline** - Funciona sin conexión a internet
- ✅ **Sincronización Automática** - Los datos se sincronizan cuando hay internet
- ✅ **Jerarquía Flexible** - Estructura organizacional multinivel (Áreas → Procesos → Subprocesos → Tareas)
- ✅ **Registro Manual de Horas** - Carga tus horas al finalizar el día con fecha, hora inicio y hora fin
- ✅ **Cálculo Automático** - El sistema calcula las horas totales automáticamente
- ✅ **Reportes y Gráficos** - Análisis visual de horas trabajadas
- ✅ **Roles y Permisos** - Admin, Supervisor, Operario
- ✅ **Responsive Design** - Optimizado para móvil y desktop

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Framework de UI
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **React Router** - Navegación
- **Dexie.js** - IndexedDB para almacenamiento offline
- **Recharts** - Gráficos
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL (Base de datos)
  - Auth (Autenticación JWT)
  - Row Level Security (Seguridad)
  - Realtime (Sincronización en tiempo real)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta en Supabase (gratis)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
cd "C:\Users\Adri\Desktop\Sistema Horas\app-web"
```

### 2. Configurar Supabase

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Ir a **SQL Editor** y ejecutar:
   - Primero: `supabase/schema.sql` (crear tablas y políticas)
   - Después: `supabase/seed.sql` (datos de ejemplo)

4. Ir a **Settings → API** y copiar:
   - `Project URL`
   - `anon public key`

### 3. Configurar variables de entorno

```bash
cd frontend
cp .env.example .env
```

Editar `.env` y agregar tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Crear usuarios en Supabase Auth

Ir a **Authentication → Users** en Supabase y crear usuarios manualmente:

**Usuarios de prueba:**

| Email | Rol | Contraseña |
|-------|-----|------------|
| admin@horticola.com | admin | (la que elijas) |
| supervisor.produccion@horticola.com | supervisor | (la que elijas) |
| operario1@horticola.com | operario | (la que elijas) |

**IMPORTANTE:** Los IDs de los usuarios creados en Supabase Auth deben coincidir con los IDs en la tabla `users`. Puedes:
- Opción A: Copiar los UUIDs generados por Auth y actualizar `seed.sql`
- Opción B: Crear los usuarios en Auth y luego insertar sus datos en la tabla `users` con el mismo ID

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Instalar como PWA

### En Android/iOS:
1. Abrir la app en el navegador
2. Tocar el menú del navegador (⋮)
3. Seleccionar "Agregar a pantalla de inicio"
4. ¡Listo! La app se instalará como nativa

### En Desktop:
1. Abrir la app en Chrome/Edge
2. Buscar el ícono de instalación en la barra de direcciones
3. Click en "Instalar"

## 🏗️ Estructura del Proyecto

```
frontend/
├── public/
│   ├── icons/              # Iconos PWA (generar con herramienta online)
│   ├── manifest.webmanifest
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── common/         # Componentes reutilizables
│   │   ├── layout/         # Layout y navegación
│   │   └── ProtectedRoute.jsx
│   ├── config/
│   │   └── supabase.js     # Cliente de Supabase
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── db/
│   │   └── indexedDB.js    # Configuración IndexedDB
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useOffline.js
│   │   ├── useTimeEntries.js
│   │   └── useOrganizationalUnits.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TimeEntries.jsx
│   │   ├── OrganizationalUnits.jsx
│   │   └── Reports.jsx
│   ├── services/
│   │   └── syncService.js  # Sincronización offline
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.js

supabase/
├── schema.sql              # Schema de base de datos
└── seed.sql                # Datos de ejemplo
```

## 🎯 Uso

### Registrar Horas

1. Ir a **Registro de Horas**
2. Click en **Nuevo Registro**
3. Seleccionar la fecha de trabajo
4. Ingresar hora de inicio y hora de fin
5. El sistema calcula automáticamente las horas totales
6. Seleccionar unidad organizacional (área/proceso/tarea)
7. Agregar descripción opcional
8. Click en **Guardar Registro**

**Ejemplo:** Si trabajaste el 3 de marzo de 08:00 a 17:00 en "Siembra de Tomates", el sistema calculará automáticamente 9 horas.

### Modo Offline

- La app funciona completamente sin internet
- Los registros se guardan localmente en IndexedDB
- Cuando vuelve la conexión, se sincronizan automáticamente
- Indicador de estado en la barra superior (Online/Offline)
- Contador de cambios pendientes de sincronización

### Gestionar Estructura Organizacional

1. Ir a **Estructura** (solo Admin/Supervisor)
2. Click en **Nueva Unidad**
3. Seleccionar tipo y nombre
4. Opcionalmente seleccionar unidad padre
5. La jerarquía se actualiza automáticamente

### Ver Reportes

1. Ir a **Reportes** (solo Admin/Supervisor)
2. Seleccionar rango de fechas
3. Filtrar por usuario o unidad
4. Ver gráficos y tablas
5. Exportar a CSV

## 🔐 Roles y Permisos

| Funcionalidad | Operario | Supervisor | Admin |
|---------------|----------|------------|-------|
| Registrar horas propias | ✅ | ✅ | ✅ |
| Ver dashboard propio | ✅ | ✅ | ✅ |
| Ver reportes del área | ❌ | ✅ | ✅ |
| Gestionar estructura | ❌ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Ver todos los reportes | ❌ | ❌ | ✅ |

## 🚢 Deployment

### Frontend (Vercel - Recomendado)

1. Crear cuenta en [Vercel](https://vercel.com)
2. Conectar repositorio de GitHub
3. Configurar variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático

### Frontend (Netlify - Alternativa)

1. Crear cuenta en [Netlify](https://netlify.com)
2. Conectar repositorio
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Configurar variables de entorno

### Base de Datos

Supabase ya está en la nube, no requiere deployment adicional.

## 📊 Base de Datos

### Tablas Principales

- **users** - Usuarios del sistema
- **organizational_units** - Estructura jerárquica
- **time_entries** - Registros de horas
- **refresh_tokens** - Tokens de autenticación

### Políticas RLS (Row Level Security)

Todas las tablas tienen políticas de seguridad que:
- Permiten a los usuarios ver solo sus datos
- Permiten a supervisores ver datos de su área
- Permiten a admins ver todos los datos

## 🐛 Troubleshooting

### Error: "Faltan variables de entorno de Supabase"
- Verificar que `.env` existe y tiene las variables correctas
- Reiniciar el servidor de desarrollo

### Los usuarios no pueden iniciar sesión
- Verificar que los usuarios existen en Supabase Auth
- Verificar que los IDs coinciden entre Auth y la tabla `users`
- Revisar las políticas RLS en Supabase

### La sincronización no funciona
- Verificar conexión a internet
- Abrir DevTools → Console para ver errores
- Verificar que las políticas RLS permiten las operaciones

### Los iconos PWA no aparecen
- Generar iconos con [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- Colocarlos en `public/icons/`
- Verificar que los tamaños coinciden con `manifest.webmanifest`

## 📝 Generar Iconos PWA

1. Ir a [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. Subir un logo cuadrado (512x512px mínimo)
3. Descargar el paquete de iconos
4. Copiar todos los archivos a `frontend/public/icons/`

## 🔄 Actualizar la App

```bash
git pull
cd frontend
npm install
npm run build
```

## 📄 Licencia

Este proyecto es de código abierto para uso educativo y comercial.

## 👨‍💻 Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.

---

**Desarrollado con ❤️ para la industria hortícola**
