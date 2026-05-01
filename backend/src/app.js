import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Configuración centralizada
import { config, validateConfig, logConfig } from './config/env.js';
import logger from './utils/logger.js';

// Middleware de errores
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import timeEntriesRoutes from './routes/timeEntries.js';
import usersRoutes from './routes/users.js';
import orgUnitsRoutes from './routes/organizationalUnits.js';
import reportsRoutes from './routes/reports.js';
import objectivesRoutes from './routes/objectives.routes.js';
import rolesRoutes from './routes/roles.js';
import permissionsRoutes from './routes/permissions.js';

// Validar configuración al inicio
validateConfig();

const app = express();

// Middleware de seguridad con CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Para estilos inline si es necesario
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.cors.frontendUrl],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Permite recursos de otros orígenes
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS - Configuración desde config centralizada
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, apps móviles)
    if (!origin) return callback(null, true);
    
    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS bloqueado para origin: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

// Rate limiting - Configuración desde config centralizada
if (config.rateLimit.enabled) {
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  // Aplicar a todas las rutas excepto health check
  app.use(limiter);
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales - Registradas con y sin prefijo /api para compatibilidad
// Con prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/time-entries', timeEntriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/organizational-units', orgUnitsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);

// Sin prefijo /api (para compatibilidad con frontend que llame directo)
app.use('/auth', authRoutes);
app.use('/time-entries', timeEntriesRoutes);
app.use('/users', usersRoutes);
app.use('/organizational-units', orgUnitsRoutes);
app.use('/reports', reportsRoutes);
app.use('/objectives', objectivesRoutes);
app.use('/roles', rolesRoutes);
app.use('/permissions', permissionsRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check alternativo en raíz (sin rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejar preflight requests (OPTIONS) para CORS
app.options('*', cors());

// Manejo de errores centralizado
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
app.listen(config.port, () => {
  logger.info(`\n🚀 Servidor backend iniciado`);
  logger.info(`   URL: http://localhost:${config.port}`);
  logConfig();
});

export default app;
