# 🌱 Sistema de Registro de Horas - Producción Hortícola

Sistema web progresivo (PWA) para registro y gestión de horas de trabajo en producción hortícola, con soporte offline completo.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Iniciar desarrollo
npm run dev  # Desde la raíz (ambos servicios)
```

📖 **Ver:** [INICIAR_DEV.md](./INICIAR_DEV.md) para instrucciones detalladas

## 📋 Características Principales

### ✨ Funcionalidades Core
- ✅ **Registro de horas** por tarea/unidad organizacional
- ✅ **Carga masiva** de múltiples tareas en un día
- ✅ **Reportes avanzados** con gráficos y exportación
- ✅ **Gestión de estructura** organizacional jerárquica
- ✅ **Sistema de roles** (Operario, Admin, SuperAdmin)
- ✅ **Modo offline completo** con sincronización automática
- ✅ **PWA instalable** (funciona como app nativa)

### 🎯 Funcionalidades Avanzadas
- ✅ **Objetivos de horas** semanales personalizables
- ✅ **Comparación semanal** de rendimiento
- ✅ **Historial de objetivos** cumplidos
- ✅ **Notificaciones inteligentes** de progreso
- ✅ **Plantillas de jornada** reutilizables
- ✅ **Alertas contextuales** con sistema de snooze
- ✅ **Dashboard interactivo** con métricas en tiempo real

## 🏗️ Arquitectura

```
app-web/
├── backend/              # API REST (Node.js + Express)
│   ├── src/
│   │   ├── routes/      # Endpoints API
│   │   ├── middleware/  # Auth, validación, errores
│   │   └── config/      # Configuración DB
│   └── server.js
│
├── frontend/            # React SPA + PWA
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas principales
│   │   ├── hooks/       # Custom hooks
│   │   ├── context/     # Context API (Auth, Offline)
│   │   ├── services/    # API client, sync
│   │   ├── offline/     # Sistema offline (Dexie)
│   │   └── utils/       # Helpers y utilidades
│   └── public/
│       ├── manifest.webmanifest
│       └── service-worker.js
│
└── docs/                # Documentación adicional
```

📖 **Ver:** [MAPA_COMPLETO_SISTEMA.md](./MAPA_COMPLETO_SISTEMA.md) para arquitectura detallada

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express** - API REST
- **PostgreSQL** (Supabase) - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Dexie.js** - IndexedDB para offline
- **date-fns** - Manejo de fechas
- **Recharts** - Gráficos
- **lucide-react** - Iconos

### Infraestructura
- **Render.com** - Hosting backend
- **Netlify** - Hosting frontend
- **Supabase** - PostgreSQL managed

## 📚 Documentación

### Guías Principales
- 📖 [INICIAR_DEV.md](./INICIAR_DEV.md) - Cómo iniciar el proyecto
- 🗺️ [MAPA_COMPLETO_SISTEMA.md](./MAPA_COMPLETO_SISTEMA.md) - Arquitectura completa
- 📅 [REGLAS_FECHAS_TIMESTAMPS.md](./REGLAS_FECHAS_TIMESTAMPS.md) - Manejo de fechas
- 🎯 [FUNCIONALIDADES_IMPLEMENTADAS_HOY.md](./FUNCIONALIDADES_IMPLEMENTADAS_HOY.md) - Última sesión
- 📋 [PENDIENTES_PROXIMA_SESION.md](./PENDIENTES_PROXIMA_SESION.md) - Próximos pasos

### Documentación Técnica
- 🏗️ [TEMPLATE/BUENAS_PRACTICAS_DEFINITIVAS.md](./TEMPLATE/BUENAS_PRACTICAS_DEFINITIVAS.md) - Reglas del proyecto
- 📘 [TEMPLATE/GUIA_COMPLETA_PROYECTO_BASE.md](./TEMPLATE/GUIA_COMPLETA_PROYECTO_BASE.md) - Guía base

### Deploy y Configuración
- 🚀 [docs/DEPLOY_RENDER.md](./docs/DEPLOY_RENDER.md) - Deploy a producción
- 📱 [docs/INSTALAR_PWA.md](./docs/INSTALAR_PWA.md) - Instalar como PWA
- 👤 [docs/CREAR_SUPERADMIN.md](./docs/CREAR_SUPERADMIN.md) - Crear superadmin

## 🔐 Variables de Entorno

### Backend (.env)
```env
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secret_aqui
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🎯 Roles y Permisos

### 👷 Operario
- Registrar sus propias horas
- Ver su dashboard personal
- Exportar sus reportes

### 👨‍💼 Admin
- Todo lo del Operario +
- Ver horas de todos los usuarios
- Gestionar estructura organizacional
- Gestionar usuarios (excepto superadmins)
- Reportes globales

### 🔑 SuperAdmin
- Todo lo del Admin +
- Gestionar otros admins
- Acceso completo al sistema

## 📊 Características del Sistema Offline

### Sincronización Inteligente
- ✅ Detección automática de conectividad
- ✅ Cola de sincronización con reintentos
- ✅ Resolución de conflictos
- ✅ Indicador visual de estado
- ✅ Sincronización en background

### Almacenamiento Local
- ✅ IndexedDB con Dexie.js
- ✅ Versionado de esquema
- ✅ Mapeo de IDs temporales
- ✅ Cache de datos críticos

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Build para Producción

```bash
# Frontend
cd frontend
npm run build

# Backend (no requiere build)
cd backend
npm start
```

## 🐛 Troubleshooting

### Problema: Error de conexión a DB
**Solución:** Verificar `DATABASE_URL` en `.env`

### Problema: Sincronización offline no funciona
**Solución:** Limpiar IndexedDB desde DevTools → Application → Storage

### Problema: PWA no se actualiza
**Solución:** Desregistrar service worker y recargar

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- ✅ **ESLint** configurado
- ✅ **Prettier** para formato
- ✅ Componentes funcionales con hooks
- ✅ Nombres en español para variables de negocio
- ✅ Comentarios JSDoc en funciones complejas
- ✅ Try-catch en todas las operaciones async

Ver: [TEMPLATE/BUENAS_PRACTICAS_DEFINITIVAS.md](./TEMPLATE/BUENAS_PRACTICAS_DEFINITIVAS.md)

## 📅 Manejo de Fechas

**IMPORTANTE:** El sistema usa timestamps sin zona horaria para evitar problemas de conversión.

- ✅ Usar helpers de `utils/dateHelpers.js`
- ✅ Formato DB: `YYYY-MM-DD HH:mm:ss`
- ✅ Evitar `new Date()` directo con strings
- ✅ Usar `date-fns` para operaciones

Ver: [REGLAS_FECHAS_TIMESTAMPS.md](./REGLAS_FECHAS_TIMESTAMPS.md)

## 🔄 Estado del Proyecto

**Última actualización:** 28 de Marzo 2026

### ✅ Completado
- Sistema base funcional
- Modo offline completo
- PWA instalable
- Reportes avanzados
- Sistema de objetivos
- Plantillas de jornada
- Notificaciones inteligentes

### 🚧 En Desarrollo
- Exportación de reportes (PDF/Excel)
- Modo oscuro
- Filtros avanzados

### 📋 Backlog
- Recordatorios de carga
- Dashboard móvil optimizado
- Tests E2E
- Búsqueda global (Cmd+K)

Ver: [PENDIENTES_PROXIMA_SESION.md](./PENDIENTES_PROXIMA_SESION.md)

## 📞 Soporte

Para problemas o preguntas:
1. Revisar documentación en `/docs`
2. Buscar en issues cerrados
3. Crear nuevo issue con detalles

## 📄 Licencia

Este proyecto es privado y propietario.

---

**Desarrollado con ❤️ para optimizar la gestión de horas en producción hortícola**
