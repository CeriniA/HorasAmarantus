# 🎯 Guía Definitiva de Buenas Prácticas

## 📋 Índice

1. [Principios SOLID](#principios-solid)
2. [Arquitectura Limpia](#arquitectura-limpia)
3. [Naming Conventions](#naming-conventions)
4. [Manejo de Errores](#manejo-de-errores)
5. [Validaciones](#validaciones)
6. [**Manejo de Fechas y Timestamps**](#manejo-de-fechas-y-timestamps) ⭐ NUEVO
7. [Testing](#testing)
8. [Seguridad](#seguridad)
9. [Performance](#performance)
10. [Code Review Checklist](#code-review-checklist)

---

## 🔷 Principios SOLID

### 1. Single Responsibility Principle (SRP)
**Una clase/función debe tener una sola razón para cambiar.**

❌ **MAL:**
```javascript
// Hace demasiadas cosas
class UserService {
  async createUser(data) {
    // Validar
    if (!data.email) throw new Error('Email required');
    
    // Hashear password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Guardar en DB
    const user = await db.users.create({ ...data, password: hashedPassword });
    
    // Enviar email
    await sendEmail(user.email, 'Welcome!');
    
    // Loggear
    console.log('User created:', user.id);
    
    return user;
  }
}
```

✅ **BIEN:**
```javascript
// Cada clase tiene una responsabilidad
class UserValidator {
  validate(data) {
    if (!data.email) throw new ValidationError('Email required');
    if (!data.password) throw new ValidationError('Password required');
    return true;
  }
}

class PasswordHasher {
  async hash(password) {
    return await bcrypt.hash(password, 10);
  }
}

class UserRepository {
  async create(userData) {
    return await db.users.create(userData);
  }
}

class EmailService {
  async sendWelcomeEmail(email) {
    await sendEmail(email, 'Welcome!');
  }
}

class UserService {
  constructor(validator, hasher, repository, emailService, logger) {
    this.validator = validator;
    this.hasher = hasher;
    this.repository = repository;
    this.emailService = emailService;
    this.logger = logger;
  }

  async createUser(data) {
    // Validar
    this.validator.validate(data);
    
    // Hashear password
    const hashedPassword = await this.hasher.hash(data.password);
    
    // Guardar
    const user = await this.repository.create({
      ...data,
      password: hashedPassword,
    });
    
    // Enviar email (async, no bloquea)
    this.emailService.sendWelcomeEmail(user.email).catch(err => {
      this.logger.error('Error sending welcome email', err);
    });
    
    // Loggear
    this.logger.info('User created', { userId: user.id });
    
    return user;
  }
}
```

### 2. Open/Closed Principle (OCP)
**Abierto para extensión, cerrado para modificación.**

❌ **MAL:**
```javascript
class PaymentProcessor {
  process(payment) {
    if (payment.type === 'credit_card') {
      // Procesar tarjeta
    } else if (payment.type === 'paypal') {
      // Procesar PayPal
    } else if (payment.type === 'crypto') {
      // Procesar crypto
    }
    // Cada nuevo método requiere modificar esta clase
  }
}
```

✅ **BIEN:**
```javascript
// Clase base
class PaymentMethod {
  process(payment) {
    throw new Error('Must implement process method');
  }
}

// Implementaciones específicas
class CreditCardPayment extends PaymentMethod {
  process(payment) {
    // Procesar tarjeta
  }
}

class PayPalPayment extends PaymentMethod {
  process(payment) {
    // Procesar PayPal
  }
}

class CryptoPayment extends PaymentMethod {
  process(payment) {
    // Procesar crypto
  }
}

// Procesador genérico
class PaymentProcessor {
  constructor() {
    this.methods = new Map();
  }

  registerMethod(type, method) {
    this.methods.set(type, method);
  }

  process(payment) {
    const method = this.methods.get(payment.type);
    if (!method) {
      throw new Error(`Unknown payment type: ${payment.type}`);
    }
    return method.process(payment);
  }
}

// Uso
const processor = new PaymentProcessor();
processor.registerMethod('credit_card', new CreditCardPayment());
processor.registerMethod('paypal', new PayPalPayment());
processor.registerMethod('crypto', new CryptoPayment());
```

### 3. Liskov Substitution Principle (LSP)
**Los objetos derivados deben poder sustituir a sus objetos base.**

❌ **MAL:**
```javascript
class Bird {
  fly() {
    return 'Flying';
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('Penguins cannot fly'); // Rompe el contrato
  }
}
```

✅ **BIEN:**
```javascript
class Bird {
  move() {
    throw new Error('Must implement move method');
  }
}

class FlyingBird extends Bird {
  move() {
    return this.fly();
  }
  
  fly() {
    return 'Flying';
  }
}

class Penguin extends Bird {
  move() {
    return this.swim();
  }
  
  swim() {
    return 'Swimming';
  }
}
```

### 4. Interface Segregation Principle (ISP)
**No forzar a implementar interfaces que no se usan.**

❌ **MAL:**
```javascript
class Worker {
  work() {}
  eat() {}
  sleep() {}
}

class Robot extends Worker {
  work() { /* OK */ }
  eat() { throw new Error('Robots do not eat'); } // No necesita esto
  sleep() { throw new Error('Robots do not sleep'); } // No necesita esto
}
```

✅ **BIEN:**
```javascript
class Workable {
  work() {
    throw new Error('Must implement work');
  }
}

class Eatable {
  eat() {
    throw new Error('Must implement eat');
  }
}

class Sleepable {
  sleep() {
    throw new Error('Must implement sleep');
  }
}

class Human extends Workable {
  work() { /* Implementación */ }
}
// Human también puede implementar Eatable y Sleepable si necesita

class Robot extends Workable {
  work() { /* Implementación */ }
}
// Robot solo implementa lo que necesita
```

### 5. Dependency Inversion Principle (DIP)
**Depender de abstracciones, no de implementaciones concretas.**

❌ **MAL:**
```javascript
class MySQLDatabase {
  save(data) {
    // Guardar en MySQL
  }
}

class UserService {
  constructor() {
    this.db = new MySQLDatabase(); // Dependencia directa
  }
  
  createUser(data) {
    this.db.save(data);
  }
}
```

✅ **BIEN:**
```javascript
// Abstracción
class Database {
  save(data) {
    throw new Error('Must implement save');
  }
}

// Implementaciones
class MySQLDatabase extends Database {
  save(data) {
    // Guardar en MySQL
  }
}

class PostgreSQLDatabase extends Database {
  save(data) {
    // Guardar en PostgreSQL
  }
}

class MongoDatabase extends Database {
  save(data) {
    // Guardar en MongoDB
  }
}

// Servicio depende de la abstracción
class UserService {
  constructor(database) {
    this.db = database; // Inyección de dependencia
  }
  
  createUser(data) {
    this.db.save(data);
  }
}

// Uso
const mysqlDb = new MySQLDatabase();
const userService = new UserService(mysqlDb);

// Fácil cambiar a otra DB
const postgresDb = new PostgreSQLDatabase();
const userService2 = new UserService(postgresDb);
```

---

## 🏛️ Arquitectura Limpia

### Capas de la Aplicación

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (Controllers, Routes, Views)         │
├─────────────────────────────────────────┤
│         Application Layer               │
│      (Use Cases, Services)              │
├─────────────────────────────────────────┤
│         Domain Layer                    │
│   (Entities, Business Logic)            │
├─────────────────────────────────────────┤
│      Infrastructure Layer               │
│  (Database, External APIs, Files)       │
└─────────────────────────────────────────┘
```

### Ejemplo Práctico

```javascript
// ============================================
// DOMAIN LAYER - Entidades y lógica de negocio
// ============================================
class User {
  constructor(id, email, password, role) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  // Lógica de negocio
  canAccessResource(resource) {
    return this.role === 'admin' || resource.ownerId === this.id;
  }

  isAdmin() {
    return this.role === 'admin';
  }
}

// ============================================
// INFRASTRUCTURE LAYER - Acceso a datos
// ============================================
class UserRepository {
  constructor(database) {
    this.db = database;
  }

  async findById(id) {
    const data = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!data) return null;
    return new User(data.id, data.email, data.password, data.role);
  }

  async save(user) {
    await this.db.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [user.email, user.password, user.role]
    );
  }
}

// ============================================
// APPLICATION LAYER - Casos de uso
// ============================================
class CreateUserUseCase {
  constructor(userRepository, passwordHasher, emailService, logger) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.emailService = emailService;
    this.logger = logger;
  }

  async execute(userData) {
    // Validar
    if (!userData.email || !userData.password) {
      throw new ValidationError('Email and password required');
    }

    // Verificar si existe
    const existing = await this.userRepository.findByEmail(userData.email);
    if (existing) {
      throw new ConflictError('User already exists');
    }

    // Hashear password
    const hashedPassword = await this.passwordHasher.hash(userData.password);

    // Crear entidad
    const user = new User(null, userData.email, hashedPassword, userData.role || 'user');

    // Guardar
    await this.userRepository.save(user);

    // Enviar email (no bloquea)
    this.emailService.sendWelcomeEmail(user.email).catch(err => {
      this.logger.error('Error sending email', err);
    });

    // Log
    this.logger.info('User created', { email: user.email });

    return user;
  }
}

// ============================================
// PRESENTATION LAYER - Controllers
// ============================================
class UserController {
  constructor(createUserUseCase) {
    this.createUserUseCase = createUserUseCase;
  }

  async create(req, res, next) {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      
      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
```

---

## 📝 Naming Conventions

### Variables y Funciones

```javascript
// ✅ BIEN - Descriptivo y claro
const userEmailAddress = 'user@example.com';
const isUserAuthenticated = true;
const totalOrderAmount = 150.50;

function calculateTotalPrice(items) {}
function sendWelcomeEmail(userEmail) {}
function validateUserCredentials(email, password) {}

// ❌ MAL - Ambiguo
const data = 'user@example.com';
const flag = true;
const x = 150.50;

function calc(arr) {}
function send(e) {}
function check(a, b) {}
```

### Constantes

```javascript
// ✅ BIEN - UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT_MS = 30000;

// ❌ MAL
const maxLoginAttempts = 5;
const apiBaseUrl = 'https://api.example.com';
```

### Clases y Componentes

```javascript
// ✅ BIEN - PascalCase
class UserService {}
class PaymentProcessor {}
function UserProfile() {} // React component

// ❌ MAL
class userService {}
class payment_processor {}
function userProfile() {}
```

### Archivos

```javascript
// ✅ BIEN - kebab-case o camelCase consistente
user-service.js
payment-processor.js
auth-middleware.js

// O
userService.js
paymentProcessor.js
authMiddleware.js

// ❌ MAL - Inconsistente
UserService.js
payment_processor.js
auth-Middleware.js
```

### Booleanos

```javascript
// ✅ BIEN - Prefijos is, has, can, should
const isAuthenticated = true;
const hasPermission = false;
const canEdit = true;
const shouldRedirect = false;

// ❌ MAL
const authenticated = true;
const permission = false;
const edit = true;
```

### Funciones que retornan booleanos

```javascript
// ✅ BIEN
function isValidEmail(email) {}
function hasAccess(user, resource) {}
function canDelete(user, item) {}

// ❌ MAL
function validateEmail(email) {} // No es claro que retorna boolean
function checkAccess(user, resource) {}
```

---

## ⚠️ Manejo de Errores

### Jerarquía de Errores

```javascript
// Error base
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}
```

### Try-Catch Apropiado

```javascript
// ❌ MAL - Catch vacío
try {
  await saveUser(user);
} catch (error) {
  // Silenciosamente ignora el error
}

// ❌ MAL - Catch genérico
try {
  await saveUser(user);
} catch (error) {
  console.log('Error'); // No útil
}

// ✅ BIEN - Manejo específico
try {
  await saveUser(user);
} catch (error) {
  if (error.code === 'DUPLICATE_EMAIL') {
    throw new ConflictError('Email already exists');
  }
  
  if (error.code === 'CONNECTION_ERROR') {
    logger.error('Database connection failed', { error: error.message });
    throw new DatabaseError('Unable to save user');
  }
  
  // Error inesperado
  logger.error('Unexpected error saving user', {
    error: error.message,
    stack: error.stack,
  });
  throw error;
}
```

### Async/Await vs Promises

```javascript
// ✅ BIEN - Async/await
async function getUser(id) {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  } catch (error) {
    logger.error('Error getting user', { id, error: error.message });
    throw error;
  }
}

// ❌ MAL - Promise hell
function getUser(id) {
  return userRepository.findById(id)
    .then(user => {
      if (!user) {
        throw new NotFoundError('User');
      }
      return user;
    })
    .catch(error => {
      logger.error('Error getting user', { id, error: error.message });
      throw error;
    });
}
```

---

## ✅ Validaciones

### Input Validation

```javascript
// ✅ BIEN - Validación completa
import { body, validationResult } from 'express-validator';

const validateCreateUser = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Invalid role'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }
    next();
  },
];

// Uso
router.post('/users', validateCreateUser, createUserHandler);
```

### Business Logic Validation

```javascript
// ✅ BIEN - Validación de negocio
class UserService {
  async createUser(userData) {
    // Validar email único
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    // Validar edad mínima
    if (userData.age && userData.age < 18) {
      throw new ValidationError('User must be at least 18 years old');
    }

    // Validar rol permitido
    const allowedRoles = ['user', 'admin'];
    if (userData.role && !allowedRoles.includes(userData.role)) {
      throw new ValidationError(`Role must be one of: ${allowedRoles.join(', ')}`);
    }

    // Continuar con la creación...
  }
}
```

---

## 📅 Manejo de Fechas y Timestamps

### ⚠️ Problema Común: Zonas Horarias

**El problema:** PostgreSQL guarda `TIMESTAMP WITHOUT TIME ZONE`, pero JavaScript interpreta timestamps sin zona como UTC, causando cambios de día en zonas UTC negativas (ej: Argentina UTC-3).

**Ejemplo del problema:**
```javascript
// ❌ MAL - Causa cambios de fecha
const timestamp = "2026-03-26T08:00:00";  // Sin zona horaria
const date = new Date(timestamp);         // JavaScript lo interpreta como UTC
// En Argentina (UTC-3): se convierte a 2026-03-26T05:00:00-03:00
// Al formatear: puede mostrar 2026-03-25 (día anterior!)

// ❌ MAL - Peor aún con solo fecha
const dateOnly = "2026-03-26";
const date = new Date(dateOnly);  // UTC medianoche
// En Argentina: 2026-03-25T21:00:00-03:00 (día anterior!)
```

### ✅ Solución: Helper Functions

**Crear archivo `utils/dateHelpers.js`:**

```javascript
/**
 * Parsear timestamp de DB como fecha local
 * @param {string} timestamp - Timestamp ISO (YYYY-MM-DDTHH:MM:SS)
 * @returns {Date} - Date object en hora local
 */
export const parseDBTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  // Si ya tiene hora, usarlo directamente
  if (timestamp.includes('T')) {
    return new Date(timestamp);
  }
  
  // Si es solo fecha, agregar mediodía para evitar cambios de día
  return new Date(timestamp + 'T12:00:00');
};

/**
 * Extraer solo la fecha de un timestamp (YYYY-MM-DD)
 * @param {string} timestamp - Timestamp ISO
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const extractDate = (timestamp) => {
  if (!timestamp) return '';
  return timestamp.split('T')[0];
};

/**
 * Formatear fecha para mostrar, evitando problemas de zona horaria
 * @param {string} timestamp - Timestamp de la DB
 * @returns {Date} - Date object seguro para formatear
 */
export const safeDate = (timestamp) => {
  const dateStr = extractDate(timestamp);
  return new Date(dateStr + 'T12:00:00');
};

/**
 * Calcular horas entre dos timestamps
 * @param {string} startTime - Timestamp de inicio
 * @param {string} endTime - Timestamp de fin
 * @returns {number} - Horas transcurridas
 */
export const calculateHours = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end - start) / (1000 * 60 * 60);
};

/**
 * Crear timestamp para guardar en DB (sin zona horaria)
 * @param {string} date - Fecha YYYY-MM-DD
 * @param {string} time - Hora HH:MM
 * @returns {string} - Timestamp YYYY-MM-DD HH:MM:SS
 */
export const createDBTimestamp = (date, time) => {
  return `${date} ${time}:00`;
};
```

### 📋 Patrones de Uso

#### 1. Calcular Horas
```javascript
// ❌ MAL - Conversión manual propensa a errores
const hours = (new Date(end_time) - new Date(start_time)) / (1000 * 60 * 60);

// ✅ BIEN - Usar helper
import { calculateHours } from '../utils/dateHelpers';
const hours = calculateHours(start_time, end_time);
```

#### 2. Extraer Fecha
```javascript
// ❌ MAL - Puede dar fecha incorrecta por zona horaria
const date = format(new Date(entry.start_time), 'yyyy-MM-dd');

// ✅ BIEN - Extrae directamente del string
import { extractDate } from '../utils/dateHelpers';
const date = extractDate(entry.start_time);
```

#### 3. Formatear para Mostrar
```javascript
// ❌ MAL - Puede mostrar día incorrecto
format(new Date(entry.start_time), 'dd/MM/yyyy')

// ✅ BIEN - Usa safeDate
import { safeDate } from '../utils/dateHelpers';
format(safeDate(entry.start_time), 'dd/MM/yyyy')
```

#### 4. Comparar Fechas
```javascript
// ❌ MAL - Conversión directa
const entryDate = new Date(entry.start_time);
if (entryDate >= startDate && entryDate <= endDate) { }

// ✅ BIEN - Usa safeDate
import { safeDate } from '../utils/dateHelpers';
const entryDate = safeDate(entry.start_time);
if (entryDate >= startDate && entryDate <= endDate) { }
```

#### 5. Agrupar por Fecha
```javascript
// ❌ MAL - Puede agrupar en día incorrecto
const grouped = entries.reduce((acc, entry) => {
  const date = format(new Date(entry.start_time), 'yyyy-MM-dd');
  // ...
}, {});

// ✅ BIEN - Extrae fecha directamente
import { extractDate } from '../utils/dateHelpers';
const grouped = entries.reduce((acc, entry) => {
  const date = extractDate(entry.start_time);
  // ...
}, {});
```

### 🗄️ Base de Datos

**Configuración correcta en PostgreSQL:**

```sql
-- ✅ BIEN - TIMESTAMP WITHOUT TIME ZONE
CREATE TABLE time_entries (
  id UUID PRIMARY KEY,
  start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- ❌ MAL - WITH TIME ZONE causa conversiones
CREATE TABLE time_entries (
  start_time TIMESTAMP WITH TIME ZONE  -- Evitar esto
);
```

**Migración si ya existe:**

```sql
-- Cambiar columnas existentes
ALTER TABLE time_entries 
  ALTER COLUMN start_time TYPE TIMESTAMP WITHOUT TIME ZONE,
  ALTER COLUMN end_time TYPE TIMESTAMP WITHOUT TIME ZONE;
```

### 📤 Enviar a Backend

```javascript
// ✅ BIEN - Formato simple sin zona horaria
const timestamp = `${date} ${time}:00`;  // "2026-03-26 08:00:00"

// ❌ MAL - Con zona horaria
const timestamp = new Date().toISOString();  // "2026-03-26T11:00:00.000Z"
```

### 🎯 Reglas de Oro

1. **NUNCA** usar `new Date()` directamente con timestamps de la DB
2. **SIEMPRE** usar helpers de `dateHelpers.js`
3. **EXTRAER** fechas con `.split('T')[0]` cuando sea posible
4. **AGREGAR** `T12:00:00` cuando necesites crear un Date object de solo fecha
5. **GUARDAR** timestamps SIN zona horaria en la DB
6. **MIGRAR** columnas a `TIMESTAMP WITHOUT TIME ZONE`

### ✅ Checklist de Code Review

- [ ] ¿Se usa `calculateHours()` en vez de cálculo manual?
- [ ] ¿Se usa `extractDate()` para obtener fechas?
- [ ] ¿Se usa `safeDate()` para formatear fechas?
- [ ] ¿Los timestamps se guardan sin zona horaria?
- [ ] ¿Las columnas de DB son `WITHOUT TIME ZONE`?
- [ ] ¿No hay `new Date(timestamp)` directo en el código?

---

## 🧪 Testing

### Unit Tests

```javascript
// ✅ BIEN - Test completo
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './UserService';

describe('UserService', () => {
  let userService;
  let mockRepository;
  let mockHasher;
  let mockEmailService;
  let mockLogger;

  beforeEach(() => {
    // Crear mocks
    mockRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    };
    mockHasher = {
      hash: vi.fn(),
    };
    mockEmailService = {
      sendWelcomeEmail: vi.fn(),
    };
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    // Crear instancia con mocks
    userService = new UserService(
      mockRepository,
      mockHasher,
      mockEmailService,
      mockLogger
    );
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockHasher.hash.mockResolvedValue('hashedPassword');
      mockRepository.save.mockResolvedValue({ id: '123', ...userData });

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockHasher.hash).toHaveBeenCalledWith(userData.password);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(userData.email);
    });

    it('should throw ConflictError if email already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
      };

      mockRepository.findByEmail.mockResolvedValue({ id: '123' });

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects
        .toThrow(ConflictError);
      
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
      };

      // Act & Assert
      await expect(userService.createUser(invalidData))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### Integration Tests

```javascript
// ✅ BIEN - Test de integración
import request from 'supertest';
import app from '../app';
import { setupTestDatabase, cleanupTestDatabase } from './helpers';

describe('User API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.password).toBeUndefined(); // No exponer password
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          password: 'Password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('valid email');
    });
  });
});
```

---

## 🔒 Seguridad

### 1. Nunca Hardcodear Secrets

```javascript
// ❌ MAL
const JWT_SECRET = 'my-secret-key';
const API_KEY = 'abc123xyz';

// ✅ BIEN
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;

// Validar que existan
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}
```

### 2. Sanitizar Inputs

```javascript
// ✅ BIEN
import validator from 'validator';

function sanitizeInput(input) {
  // Eliminar HTML
  let sanitized = validator.escape(input);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Normalizar
  sanitized = validator.normalizeEmail(sanitized);
  
  return sanitized;
}
```

### 3. Prevenir SQL Injection

```javascript
// ❌ MAL - Vulnerable a SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ BIEN - Usar prepared statements
const query = 'SELECT * FROM users WHERE email = ?';
const result = await db.query(query, [email]);
```

### 4. Rate Limiting

```javascript
// ✅ BIEN
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Too many login attempts, please try again later',
});

router.post('/login', loginLimiter, loginHandler);
```

### 5. Helmet para Headers Seguros

```javascript
// ✅ BIEN
import helmet from 'helmet';

app.use(helmet());
```

---

## ⚡ Performance

### 1. Evitar N+1 Queries

```javascript
// ❌ MAL - N+1 queries
async function getUsersWithPosts() {
  const users = await db.users.findAll();
  
  for (const user of users) {
    user.posts = await db.posts.findByUserId(user.id); // N queries
  }
  
  return users;
}

// ✅ BIEN - Single query con JOIN
async function getUsersWithPosts() {
  return await db.query(`
    SELECT 
      users.*,
      posts.*
    FROM users
    LEFT JOIN posts ON users.id = posts.user_id
  `);
}
```

### 2. Usar Índices en DB

```sql
-- ✅ BIEN
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

### 3. Cachear Datos Frecuentes

```javascript
// ✅ BIEN
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutos

async function getUser(id) {
  // Verificar cache
  const cached = cache.get(`user:${id}`);
  if (cached) {
    return cached;
  }
  
  // Obtener de DB
  const user = await db.users.findById(id);
  
  // Guardar en cache
  cache.set(`user:${id}`, user);
  
  return user;
}
```

### 4. Paginación

```javascript
// ✅ BIEN
async function getUsers(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  
  const [users, total] = await Promise.all([
    db.users.findAll({ limit: pageSize, offset }),
    db.users.count(),
  ]);
  
  return {
    data: users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

---

## ✅ Code Review Checklist

### Antes de Commit

- [ ] El código compila sin errores
- [ ] Todos los tests pasan
- [ ] No hay console.log() olvidados
- [ ] No hay código comentado innecesario
- [ ] Variables y funciones tienen nombres descriptivos
- [ ] No hay secrets hardcodeados
- [ ] Errores manejados apropiadamente
- [ ] Inputs validados
- [ ] Documentación actualizada
- [ ] Sin warnings de linter

### Durante Code Review

- [ ] El código sigue los principios SOLID
- [ ] Responsabilidades bien separadas
- [ ] No hay duplicación de código
- [ ] Manejo de errores robusto
- [ ] Tests cubren casos edge
- [ ] Performance considerada
- [ ] Seguridad verificada
- [ ] Accesibilidad considerada (frontend)
- [ ] Responsive design (frontend)

### Manejo de Fechas ⭐ NUEVO

- [ ] Se usan helpers de `dateHelpers.js` en vez de `new Date()` directo
- [ ] Cálculo de horas usa `calculateHours()` en vez de cálculo manual
- [ ] Extracción de fechas usa `extractDate()` o `.split('T')[0]`
- [ ] Formateo de fechas usa `safeDate()` para evitar cambios de día
- [ ] Timestamps se guardan SIN zona horaria en DB
- [ ] Columnas de DB son `TIMESTAMP WITHOUT TIME ZONE`
- [ ] No hay conversiones de zona horaria innecesarias

---

## 🎯 Resumen

### Principios Clave

1. **SOLID** - Base de código mantenible
2. **DRY** - Don't Repeat Yourself
3. **KISS** - Keep It Simple, Stupid
4. **YAGNI** - You Aren't Gonna Need It
5. **Separation of Concerns** - Cada cosa en su lugar

### Reglas de Oro

1. ✅ Código claro > Código clever
2. ✅ Funciones pequeñas y específicas
3. ✅ Nombres descriptivos
4. ✅ Manejar todos los errores
5. ✅ Validar todos los inputs
6. ✅ Testear todo
7. ✅ Nunca hardcodear secrets
8. ✅ **Usar helpers para fechas, nunca `new Date()` directo** ⭐ NUEVO
8. ✅ Loggear apropiadamente
9. ✅ Documentar decisiones importantes
10. ✅ Refactorizar constantemente

**¡Sigue estas prácticas y tendrás código profesional y mantenible!** 🚀
