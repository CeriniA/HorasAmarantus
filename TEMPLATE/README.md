# 🚀 Template Base - Proyecto Full-Stack

Template profesional para iniciar proyectos Full-Stack con React + Express + PostgreSQL/Supabase.

## 📋 ¿Qué incluye este template?

### ✅ Backend
- ✅ Express.js configurado con mejores prácticas
- ✅ Manejo de errores centralizado
- ✅ Sistema de logging con Winston
- ✅ Autenticación JWT
- ✅ Validaciones con express-validator
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Variables de entorno validadas
- ✅ Constantes centralizadas (Single Source of Truth)

### ✅ Frontend
- ✅ React con Vite
- ✅ Context API para estado global
- ✅ Custom hooks
- ✅ Cliente HTTP configurado
- ✅ Manejo de errores
- ✅ Constantes sincronizadas con backend
- ✅ Componentes reutilizables base

### ✅ Base de Datos
- ✅ Configuración para Supabase
- ✅ Configuración para PostgreSQL directo
- ✅ Migraciones y seeds

### ✅ DevOps
- ✅ Docker y Docker Compose
- ✅ Scripts de deployment
- ✅ Configuración de CI/CD base

---

## 🏗️ Estructura del Proyecto

```
template-base/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuración
│   │   ├── middleware/       # Middleware
│   │   ├── routes/           # Rutas API
│   │   ├── services/         # Lógica de negocio
│   │   ├── utils/            # Utilidades
│   │   └── app.js            # Servidor
│   ├── tests/                # Tests
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes
│   │   ├── pages/            # Páginas
│   │   ├── context/          # Context API
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   ├── utils/            # Utilidades
│   │   └── constants/        # Constantes
│   └── package.json
│
├── database/
│   ├── migrations/           # Migraciones
│   └── seeds/                # Datos de prueba
│
├── docs/
│   └── GUIA_COMPLETA_PROYECTO_BASE.md
│
└── docker-compose.yml
```

---

## 🚀 Inicio Rápido

### 1. Clonar el Template

```bash
# Copiar la carpeta TEMPLATE a tu nuevo proyecto
cp -r TEMPLATE mi-nuevo-proyecto
cd mi-nuevo-proyecto
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus valores
nano .env

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus valores
nano .env

# Iniciar aplicación
npm run dev
```

### 4. Configurar Base de Datos

#### Opción A: Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar URL y Service Role Key
3. Actualizar `.env` del backend

#### Opción B: PostgreSQL Local

```bash
# Crear base de datos
createdb mi_app

# Ejecutar migraciones
npm run migrate

# Ejecutar seeds (opcional)
npm run seed
```

---

## 📝 Variables de Entorno

### Backend (.env)

```env
# Servidor
NODE_ENV=development
PORT=3001

# Base de Datos
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Mi App
```

---

## 🎯 Archivos Clave

### Backend

| Archivo | Descripción |
|---------|-------------|
| `config/env.js` | Variables de entorno centralizadas |
| `config/constants.js` | Constantes globales (Single Source of Truth) |
| `middleware/errorHandler.js` | Manejo de errores centralizado |
| `utils/logger.js` | Sistema de logging |
| `app.js` | Configuración del servidor Express |

### Frontend

| Archivo | Descripción |
|---------|-------------|
| `constants/index.js` | Constantes globales sincronizadas |
| `services/api.js` | Cliente HTTP base |
| `context/AuthContext.jsx` | Contexto de autenticación |
| `hooks/useAuth.js` | Hook de autenticación |

---

## 🔐 Seguridad

### Implementado

✅ JWT para autenticación
✅ Passwords hasheados con bcrypt
✅ Helmet para headers seguros
✅ CORS configurado
✅ Rate limiting
✅ Validación de inputs
✅ Variables de entorno validadas

### Recomendaciones

- Cambiar `JWT_SECRET` en producción (mínimo 32 caracteres)
- Usar HTTPS en producción
- Configurar CORS solo para dominios permitidos
- Habilitar rate limiting en producción
- Implementar 2FA para usuarios admin
- Configurar backups automáticos

---

## 🧪 Testing

### Backend

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

### Frontend

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 📦 Scripts Disponibles

### Backend

```json
{
  "dev": "nodemon src/app.js",
  "start": "node src/app.js",
  "test": "vitest",
  "lint": "eslint src/",
  "format": "prettier --write src/"
}
```

### Frontend

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint src/"
}
```

---

## 🐳 Docker

### Desarrollo

```bash
docker-compose up
```

### Producción

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Documentación

- [Guía Completa](./GUIA_COMPLETA_PROYECTO_BASE.md) - Documentación detallada
- [API Documentation](./docs/API.md) - Endpoints de la API
- [Architecture](./docs/ARCHITECTURE.md) - Arquitectura del sistema

---

## 🎨 Personalización

### 1. Cambiar Nombre del Proyecto

```bash
# package.json (backend y frontend)
{
  "name": "mi-nuevo-proyecto",
  "description": "Descripción de mi proyecto"
}
```

### 2. Agregar Nuevas Constantes

```javascript
// backend/src/config/constants.js
export const MI_NUEVA_CONSTANTE = {
  VALOR1: 'valor1',
  VALOR2: 'valor2',
};

// frontend/src/constants/index.js
export const MI_NUEVA_CONSTANTE = {
  VALOR1: 'valor1',
  VALOR2: 'valor2',
};
```

### 3. Agregar Nuevas Rutas

```javascript
// backend/src/routes/miRecurso.js
import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  // Tu lógica aquí
});

export default router;

// backend/src/app.js
import miRecursoRoutes from './routes/miRecurso.js';
app.use('/api/mi-recurso', miRecursoRoutes);
```

---

## 🤝 Contribuir

Si encuentras bugs o tienes sugerencias:

1. Crea un issue
2. Haz un fork
3. Crea una rama (`git checkout -b feature/nueva-feature`)
4. Commit tus cambios (`git commit -am 'Agregar nueva feature'`)
5. Push a la rama (`git push origin feature/nueva-feature`)
6. Crea un Pull Request

---

## 📄 Licencia

MIT License - Úsalo libremente en tus proyectos.

---

## 🎯 Checklist de Inicio

Antes de empezar tu proyecto:

- [ ] Copiar template a nuevo directorio
- [ ] Cambiar nombre en package.json
- [ ] Configurar variables de entorno
- [ ] Cambiar JWT_SECRET
- [ ] Configurar base de datos
- [ ] Actualizar README con info del proyecto
- [ ] Inicializar git (`git init`)
- [ ] Crear repositorio en GitHub
- [ ] Configurar CI/CD
- [ ] Configurar monitoring

---

## 💡 Tips

### Desarrollo

- Usa `npm run dev` para hot-reload
- Revisa logs en `logs/app.log`
- Usa Postman/Insomnia para probar API

### Producción

- Siempre usa HTTPS
- Configura variables de entorno correctamente
- Habilita rate limiting
- Configura backups automáticos
- Implementa monitoring (Sentry, LogRocket, etc.)

---

## 🆘 Soporte

Si necesitas ayuda:

1. Revisa la [Guía Completa](./GUIA_COMPLETA_PROYECTO_BASE.md)
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles

---

## 🎉 ¡Listo para Empezar!

Este template incluye todo lo necesario para iniciar un proyecto profesional.

**Características principales:**
- ✅ Arquitectura escalable
- ✅ Código limpio y organizado
- ✅ Buenas prácticas implementadas
- ✅ Seguridad incluida
- ✅ Testing configurado
- ✅ Listo para producción

**¡Comienza a construir tu aplicación ahora!** 🚀
