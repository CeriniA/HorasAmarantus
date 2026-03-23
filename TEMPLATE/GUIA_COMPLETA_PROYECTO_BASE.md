# 🚀 Guía Completa - Template Base para Proyectos Full-Stack

## 📋 Índice

1. [Estructura de Carpetas](#estructura-de-carpetas)
2. [Variables de Entorno](#variables-de-entorno)
3. [Manejo de Errores](#manejo-de-errores)
4. [Logging](#logging)
5. [Constantes y Verdad Única](#constantes-y-verdad-única)
6. [Buenas Prácticas](#buenas-prácticas)
7. [Patrones de Diseño](#patrones-de-diseño)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## 📁 Estructura de Carpetas

### Backend

```
backend/
├── src/
│   ├── config/           # Configuración
│   │   ├── database.js   # Conexión DB
│   │   ├── env.js        # Variables entorno
│   │   └── constants.js  # Constantes globales
│   │
│   ├── middleware/       # Middleware
│   │   ├── auth.js       # Autenticación
│   │   ├── errorHandler.js
│   │   ├── validators.js
│   │   └── rateLimiter.js
│   │
│   ├── routes/           # Rutas API
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── index.js
│   │
│   ├── services/         # Lógica de negocio
│   │   ├── authService.js
│   │   └── userService.js
│   │
│   ├── utils/            # Utilidades
│   │   ├── logger.js
│   │   ├── helpers.js
│   │   └── responses.js
│   │
│   └── app.js            # Servidor
│
├── tests/                # Tests
├── .env.example
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── components/       # Componentes
│   │   ├── common/       # Reutilizables
│   │   ├── layout/       # Layout
│   │   └── features/     # Por feature
│   │
│   ├── pages/            # Páginas
│   ├── context/          # Context API
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── utils/            # Utilidades
│   ├── constants/        # Constantes
│   └── styles/           # Estilos
│
├── public/
└── package.json
```

---

## 🔐 Variables de Entorno

### Archivo `.env.example`

```env
# ============================================
# AMBIENTE
# ============================================
NODE_ENV=development

# ============================================
# SERVIDOR
# ============================================
PORT=3001
HOST=localhost

# ============================================
# BASE DE DATOS
# ============================================
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# PostgreSQL (alternativa)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=password

# ============================================
# AUTENTICACIÓN
# ============================================
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# CORS
# ============================================
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# ============================================
# RATE LIMITING
# ============================================
ENABLE_RATE_LIMIT=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# EMAIL
# ============================================
EMAIL_ENABLED=false
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@myapp.com

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug
LOG_FILE=logs/app.log
LOG_ERROR_FILE=logs/error.log

# ============================================
# UPLOADS
# ============================================
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf
UPLOAD_DESTINATION=uploads/
```

### Validación de Variables

```javascript
// config/env.js
import dotenv from 'dotenv';
dotenv.config();

const requireEnv = (key, defaultValue) => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Variable ${key} no encontrada`);
  }
  return value;
};

export const config = {
  port: parseInt(requireEnv('PORT', '3001'), 10),
  jwtSecret: requireEnv('JWT_SECRET'),
  // ... más configuración
};

// Validar al inicio
export const validateConfig = () => {
  const errors = [];
  
  if (config.jwtSecret.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres');
  }
  
  if (errors.length > 0) {
    throw new Error(`Errores de configuración: ${errors.join(', ')}`);
  }
};
```

---

## ⚠️ Manejo de Errores

### Clase de Error Personalizada

```javascript
// middleware/errorHandler.js
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos
export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}
```

### Middleware de Errores

```javascript
export const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  // Respuesta
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
      ...(config.isDevelopment && { stack: err.stack }),
    }
  });
};
```

### Wrapper para Async

```javascript
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Uso
router.get('/users', asyncHandler(async (req, res) => {
  const users = await getUsers();
  res.json(users);
}));
```

---

## 📝 Logging

### Configuración de Winston

```javascript
// utils/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
  ],
});

// Métodos personalizados
logger.logRequest = (req, res, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
  });
};
```

### Uso

```javascript
logger.info('Usuario creado', { userId: '123' });
logger.error('Error en DB', { error: err.message });
logger.warn('Intento de acceso no autorizado', { ip: req.ip });
```

---

## 🎯 Constantes y Verdad Única

### Backend

```javascript
// config/constants.js
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  UNAUTHORIZED: 'No autorizado',
  NOT_FOUND: 'Recurso no encontrado',
};
```

### Frontend

```javascript
// constants/index.js
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user',
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};
```

### Sincronización Backend-Frontend

**Importante:** Las constantes deben estar sincronizadas.

```javascript
// Opción 1: Compartir archivo (monorepo)
// shared/constants.js

// Opción 2: Script de sincronización
// scripts/sync-constants.js

// Opción 3: Generar desde backend
// npm run generate:constants
```

---

## ✅ Buenas Prácticas

### 1. **Naming Conventions**

```javascript
// Variables y funciones: camelCase
const userName = 'John';
function getUserData() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Clases y Componentes: PascalCase
class UserService {}
function UserProfile() {}

// Archivos: kebab-case o camelCase
// user-service.js o userService.js
```

### 2. **Estructura de Funciones**

```javascript
/**
 * Obtiene un usuario por ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Usuario encontrado
 * @throws {NotFoundError} Si el usuario no existe
 */
async function getUserById(userId) {
  // 1. Validar entrada
  if (!userId) {
    throw new ValidationError('userId es requerido');
  }

  // 2. Lógica principal
  const user = await db.users.findById(userId);

  // 3. Validar resultado
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  // 4. Retornar
  return user;
}
```

### 3. **Manejo de Promesas**

```javascript
// ❌ MAL
async function badExample() {
  const user = await getUser();
  const posts = await getPosts();
  const comments = await getComments();
  // Secuencial: ~300ms
}

// ✅ BIEN
async function goodExample() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);
  // Paralelo: ~100ms
}
```

### 4. **Validaciones**

```javascript
// middleware/validators.js
import { body, validationResult } from 'express-validator';

export const validateUser = [
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Contraseña debe tener al menos 8 caracteres'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nombre es requerido'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Errores de validación', errors.array());
    }
    next();
  },
];
```

### 5. **Respuestas Estandarizadas**

```javascript
// utils/responses.js
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  });
};

// Uso
router.get('/users', async (req, res) => {
  const users = await getUsers();
  return successResponse(res, users, 'Usuarios obtenidos');
});
```

---

## 🏗️ Patrones de Diseño

### 1. **Repository Pattern**

```javascript
// repositories/UserRepository.js
class UserRepository {
  async findById(id) {
    return await db.users.findById(id);
  }

  async findByEmail(email) {
    return await db.users.findOne({ email });
  }

  async create(userData) {
    return await db.users.create(userData);
  }

  async update(id, userData) {
    return await db.users.update(id, userData);
  }

  async delete(id) {
    return await db.users.delete(id);
  }
}

export default new UserRepository();
```

### 2. **Service Layer**

```javascript
// services/UserService.js
import UserRepository from '../repositories/UserRepository.js';
import { NotFoundError } from '../middleware/errorHandler.js';

class UserService {
  async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return user;
  }

  async createUser(userData) {
    // Validaciones de negocio
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email ya existe');
    }

    // Hash password
    userData.password = await bcrypt.hash(userData.password, 10);

    // Crear
    return await UserRepository.create(userData);
  }
}

export default new UserService();
```

### 3. **Dependency Injection**

```javascript
// services/UserService.js
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async createUser(userData) {
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}

// Inyectar dependencias
export default new UserService(
  UserRepository,
  EmailService
);
```

---

## 🧪 Testing

### Unit Tests

```javascript
// tests/unit/userService.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import UserService from '../../src/services/UserService.js';

describe('UserService', () => {
  beforeEach(() => {
    // Setup
  });

  it('debe crear un usuario', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const user = await UserService.createUser(userData);

    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.password).not.toBe(userData.password); // Hasheado
  });

  it('debe lanzar error si email ya existe', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
    };

    await expect(UserService.createUser(userData))
      .rejects
      .toThrow('Email ya existe');
  });
});
```

### Integration Tests

```javascript
// tests/integration/auth.test.js
import request from 'supertest';
import app from '../../src/app.js';

describe('Auth API', () => {
  it('POST /auth/login - debe autenticar usuario', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

---

## 🚀 Deployment

### Checklist Pre-Deployment

```markdown
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET cambiado en producción
- [ ] Base de datos migrada
- [ ] Tests pasando
- [ ] Logs configurados
- [ ] Rate limiting habilitado
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado
- [ ] Backups configurados
- [ ] Monitoring configurado
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "src/app.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## 📚 Recursos Adicionales

### Librerías Recomendadas

**Backend:**
- `express` - Framework web
- `express-validator` - Validaciones
- `bcrypt` - Hash de passwords
- `jsonwebtoken` - JWT
- `winston` - Logging
- `helmet` - Seguridad
- `cors` - CORS
- `express-rate-limit` - Rate limiting

**Frontend:**
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `react-query` - Data fetching
- `zustand` o `redux` - State management
- `react-hook-form` - Formularios
- `zod` - Validaciones
- `tailwindcss` - Estilos

---

## 🎯 Conclusión

Este template base te proporciona:

✅ Estructura organizada y escalable
✅ Manejo de errores centralizado
✅ Logging estructurado
✅ Constantes sincronizadas
✅ Validaciones robustas
✅ Buenas prácticas implementadas
✅ Patrones de diseño probados
✅ Testing configurado
✅ Listo para deployment

**¡Úsalo como base para todos tus proyectos!** 🚀
