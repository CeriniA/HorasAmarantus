import { body, param, validationResult } from 'express-validator';
import { VALIDATION_RULES } from '../models/types.js';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Errores de validación',
      errors: errors.array() 
    });
  }
  next();
};

// Validadores para Auth
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Usuario requerido'),
  body('password')
    .notEmpty()
    .withMessage('Password requerido'),
  handleValidationErrors
];

export const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Usuario requerido')
    .isLength({ min: 3 })
    .withMessage('Usuario debe tener al menos 3 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Usuario solo puede contener letras, números, guiones y guiones bajos'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: VALIDATION_RULES.password.minLength })
    .withMessage(`Password debe tener al menos ${VALIDATION_RULES.password.minLength} caracteres`),
  body('name')
    .trim()
    .isLength({ min: VALIDATION_RULES.name.minLength })
    .withMessage(`Nombre debe tener al menos ${VALIDATION_RULES.name.minLength} caracteres`),
  body('role')
    .isIn(['superadmin', 'admin', 'operario'])
    .withMessage('Rol inválido'),
  body('organizational_unit_id')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('ID de unidad organizacional inválido'),
  handleValidationErrors
];

// Validadores para Users
export const validateCreateUser = validateRegister;

export const validateUpdateUser = [
  param('id').isUUID().withMessage('ID de usuario inválido'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Usuario debe tener al menos 3 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Usuario solo puede contener letras, números, guiones y guiones bajos'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: VALIDATION_RULES.name.minLength })
    .withMessage(`Nombre debe tener al menos ${VALIDATION_RULES.name.minLength} caracteres`),
  body('role')
    .optional()
    .isIn(['superadmin', 'admin', 'operario'])
    .withMessage('Rol inválido'),
  body('password')
    .optional()
    .isLength({ min: VALIDATION_RULES.password.minLength })
    .withMessage(`Password debe tener al menos ${VALIDATION_RULES.password.minLength} caracteres`),
  body('organizational_unit_id')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('ID de unidad organizacional inválido'),
  handleValidationErrors
];

// Validadores para Time Entries
export const validateCreateTimeEntry = [
  body('organizational_unit_id')
    .isUUID()
    .withMessage('ID de unidad organizacional inválido'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.description.maxLength })
    .withMessage(`Descripción no puede exceder ${VALIDATION_RULES.description.maxLength} caracteres`),
  body('start_time')
    .isISO8601()
    .withMessage('Fecha de inicio inválida')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const maxPast = new Date();
      maxPast.setDate(maxPast.getDate() - VALIDATION_RULES.timeEntry.maxDaysInPast);
      
      if (date > now) {
        throw new Error('La fecha de inicio no puede ser futura');
      }
      if (date < maxPast) {
        throw new Error(`La fecha no puede ser mayor a ${VALIDATION_RULES.timeEntry.maxDaysInPast} días en el pasado`);
      }
      return true;
    }),
  body('end_time')
    .isISO8601()
    .withMessage('Fecha de fin inválida')
    .custom((value, { req }) => {
      const start = new Date(req.body.start_time);
      const end = new Date(value);
      
      if (end <= start) {
        throw new Error('La fecha de fin debe ser posterior a la de inicio');
      }
      
      const hours = (end - start) / (1000 * 60 * 60);
      if (hours > VALIDATION_RULES.timeEntry.maxHoursPerDay) {
        throw new Error(`Las horas no pueden exceder ${VALIDATION_RULES.timeEntry.maxHoursPerDay} por día`);
      }
      
      return true;
    }),
  body('user_id')
    .optional()
    .isUUID()
    .withMessage('ID de usuario inválido'),
  handleValidationErrors
];

export const validateUpdateTimeEntry = [
  param('id').isUUID().withMessage('ID de registro inválido'),
  body('organizational_unit_id')
    .optional()
    .isUUID()
    .withMessage('ID de unidad organizacional inválido'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.description.maxLength })
    .withMessage(`Descripción no puede exceder ${VALIDATION_RULES.description.maxLength} caracteres`),
  body('start_time')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  body('end_time')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida'),
  handleValidationErrors
];

// Validadores para Organizational Units
export const validateCreateOrgUnit = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nombre requerido')
    .isLength({ max: 255 })
    .withMessage('Nombre muy largo'),
  body('type')
    .isIn(['area', 'proceso', 'subproceso', 'tarea'])
    .withMessage('Tipo inválido'),
  body('parent_id')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error('ID de padre inválido');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateUpdateOrgUnit = [
  param('id').isUUID().withMessage('ID de unidad inválido'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nombre no puede estar vacío')
    .isLength({ max: 255 })
    .withMessage('Nombre muy largo'),
  body('type')
    .optional()
    .isIn(['area', 'proceso', 'subproceso', 'tarea'])
    .withMessage('Tipo inválido'),
  body('parent_id')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error('ID de padre inválido');
      }
      return true;
    }),
  handleValidationErrors
];

// Validador genérico de UUID en params
export const validateUUID = (paramName = 'id') => [
  param(paramName).isUUID().withMessage(`${paramName} inválido`),
  handleValidationErrors
];

export default {
  validateLogin,
  validateRegister,
  validateCreateUser,
  validateUpdateUser,
  validateCreateTimeEntry,
  validateUpdateTimeEntry,
  validateCreateOrgUnit,
  validateUpdateOrgUnit,
  validateUUID,
  handleValidationErrors
};
