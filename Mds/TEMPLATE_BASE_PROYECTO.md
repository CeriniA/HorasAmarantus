# 🚀 Template Base para Proyectos Full-Stack

## 📁 Estructura de Carpetas Completa

```
proyecto-base/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Conexión a DB
│   │   │   ├── env.js               # Variables de entorno
│   │   │   └── constants.js         # Constantes globales
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js              # Autenticación JWT
│   │   │   ├── errorHandler.js      # Manejo de errores
│   │   │   ├── validators.js        # Validaciones
│   │   │   └── rateLimiter.js       # Rate limiting
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js              # Rutas de autenticación
│   │   │   ├── users.js             # CRUD usuarios
│   │   │   └── index.js             # Agregador de rutas
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js       # Lógica de negocio auth
│   │   │   ├── userService.js       # Lógica de negocio users
│   │   │   └── emailService.js      # Servicio de emails
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js            # Sistema de logs
│   │   │   ├── helpers.js           # Funciones auxiliares
│   │   │   └── responses.js         # Respuestas estandarizadas
│   │   │
│   │   ├── models/
│   │   │   └── constants.js         # Constantes de modelos
│   │   │
│   │   └── app.js                   # Servidor Express
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.js
│   │
│   ├── .env.example                 # Ejemplo de variables
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── assets/                  # Imágenes, fonts, etc.
│   │   │
│   │   ├── components/
│   │   │   ├── common/              # Componentes reutilizables
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   │
│   │   │   └── features/            # Componentes por feature
│   │   │       ├── auth/
│   │   │       └── users/
│   │   │
│   │   ├── pages/                   # Páginas/Vistas
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── context/                 # Context API
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── services/                # Servicios API
│   │   │   ├── api.js               # Cliente HTTP base
│   │   │   ├── authService.js
│   │   │   └── userService.js
│   │   │
│   │   ├── utils/                   # Utilidades
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── constants/               # Constantes
│   │   │   └── index.js
│   │   │
│   │   ├── styles/                  # Estilos globales
│   │   │   └── index.css
│   │   │
│   │   ├── App.jsx                  # Componente raíz
│   │   └── main.jsx                 # Entry point
│   │
│   ├── public/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── database/
│   ├── migrations/                  # Migraciones SQL
│   ├── seeds/                       # Datos de prueba
│   └── schema.sql                   # Schema inicial
│
├── docs/
│   ├── API.md                       # Documentación API
│   ├── ARCHITECTURE.md              # Arquitectura
│   └── SETUP.md                     # Guía de instalación
│
├── .gitignore
├── docker-compose.yml               # Docker setup
└── README.md
```

---

## 🎯 Principios de Diseño

### 1. **Single Source of Truth (Verdad Única)**
- Constantes centralizadas
- Estado global con Context API
- Variables de entorno validadas

### 2. **Separation of Concerns (Separación de Responsabilidades)**
- Lógica de negocio en services
- Validaciones en middleware
- UI en components

### 3. **DRY (Don't Repeat Yourself)**
- Componentes reutilizables
- Funciones auxiliares
- Custom hooks

### 4. **Error Handling Centralizado**
- Middleware de errores
- Respuestas estandarizadas
- Logging estructurado

### 5. **Type Safety**
- Validaciones con express-validator
- PropTypes o TypeScript
- Constantes tipadas

---

## 📝 Archivos Base a Crear

Voy a crear los archivos fundamentales que necesitas para cualquier proyecto.

