/**
 * Auth Routes
 * 
 * Responsabilidad: SOLO definir endpoints HTTP
 * - NO lógica de negocio
 * - NO acceso a base de datos
 * - Solo middleware y delegación a controller
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateLogin, validateRegister } from '../middleware/validators.js';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, authController.login);

// POST /api/auth/register
router.post('/register', validateRegister, authController.register);

// GET /api/auth/me
router.get('/me', authenticate, authController.getCurrentUser);

// POST /api/auth/change-password
router.post('/change-password', authenticate, authController.changePassword);

// PUT /api/auth/me/email
router.put('/me/email', authenticate, authController.updateEmail);

// PUT /api/auth/me/goal
router.put('/me/goal', authenticate, authController.updateWeeklyGoal);

export default router;
