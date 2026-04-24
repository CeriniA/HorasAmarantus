/**
 * Auth Service
 * 
 * Responsabilidades:
 * - Lógica de autenticación
 * - Validaciones de credenciales
 * - Gestión de usuarios
 * - Acceso a base de datos
 */

import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { generateToken } from '../config/auth.js';
import logger from '../utils/logger.js';

/**
 * Login de usuario
 */
const login = async (username, password) => {
  // Buscar usuario por username con su rol
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      roles (
        id,
        slug,
        name
      )
    `)
    .eq('username', username)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !user) {
    throw new Error('Credenciales inválidas');
  }

  // Verificar password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Credenciales inválidas');
  }

  // Generar JWT con role_id y slug del rol
  const token = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role_id: user.role_id,
    role: user.roles?.slug || 'operario',  // Slug del rol para compatibilidad
    organizational_unit_id: user.organizational_unit_id
  });

  logger.info('Usuario logueado:', username);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role_id: user.role_id,
      role: user.roles?.slug || 'operario',  // Slug del rol
      role_name: user.roles?.name || 'Operario',
      organizational_unit_id: user.organizational_unit_id,
      weekly_goal: user.weekly_goal || 40
    }
  };
};

/**
 * Registrar nuevo usuario
 */
const register = async (userData) => {
  const { username, email, password, name, role_id, organizational_unit_id } = userData;

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Crear usuario
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      username,
      email: email || null,
      password_hash,
      name,
      role_id,  // Ahora usa role_id en lugar de role
      organizational_unit_id
    })
    .select(`
      *,
      roles (
        id,
        slug,
        name
      )
    `)
    .single();

  if (error) {
    logger.error('Error creando usuario:', error);
    throw new Error('Error creando usuario');
  }

  logger.info('Usuario registrado:', username);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role_id: user.role_id,
    role: user.roles?.slug || 'operario'
  };
};

/**
 * Obtener usuario actual por ID
 */
const getCurrentUser = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      email,
      name,
      role_id,
      organizational_unit_id,
      is_active,
      created_at,
      weekly_goal,
      roles (
        id,
        slug,
        name
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error('Usuario no encontrado');
  }

  // Agregar slug del rol para compatibilidad
  return {
    ...user,
    role: user.roles?.slug || 'operario'
  };
};

/**
 * Cambiar contraseña
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  // Validaciones
  if (!currentPassword || !newPassword) {
    throw new Error('Contraseña actual y nueva son requeridas');
  }

  if (newPassword.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
  }

  // Obtener usuario actual
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar contraseña actual
  const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Contraseña actual incorrecta');
  }

  // Hashear nueva contraseña
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // Actualizar contraseña
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: newPasswordHash })
    .eq('id', userId);

  if (updateError) {
    logger.error('Error actualizando contraseña:', updateError);
    throw new Error('Error actualizando contraseña');
  }

  logger.info('Contraseña actualizada para usuario:', userId);
  return true;
};

/**
 * Actualizar email
 */
const updateEmail = async (userId, email) => {
  // Validar email si se proporciona
  if (email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    // Verificar que el email no esté en uso por otro usuario
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Este email ya está en uso');
    }
  }

  // Actualizar email
  const { data, error } = await supabase
    .from('users')
    .update({ email: email && email.trim() ? email.trim() : null })
    .eq('id', userId)
    .select('id, username, email, name, role, organizational_unit_id, weekly_goal')
    .single();

  if (error) {
    logger.error('Error actualizando email:', error);
    throw new Error('Error actualizando email');
  }

  logger.info('Email actualizado para usuario:', userId);
  return data;
};

/**
 * Actualizar objetivo semanal
 */
const updateWeeklyGoal = async (userId, weekly_goal) => {
  // Validaciones
  if (weekly_goal === undefined || weekly_goal === null) {
    throw new Error('El objetivo semanal es requerido');
  }

  const goalNumber = parseFloat(weekly_goal);

  if (isNaN(goalNumber)) {
    throw new Error('El objetivo debe ser un número');
  }

  if (goalNumber < 1 || goalNumber > 168) {
    throw new Error('El objetivo debe estar entre 1 y 168 horas (hay 168 horas en una semana)');
  }

  // Actualizar objetivo
  const { data, error } = await supabase
    .from('users')
    .update({ weekly_goal: goalNumber })
    .eq('id', userId)
    .select('id, username, email, name, role, organizational_unit_id, weekly_goal')
    .single();

  if (error) {
    logger.error('Error actualizando objetivo:', error);
    throw new Error('Error actualizando objetivo');
  }

  logger.info('Objetivo actualizado para usuario:', userId);
  return data;
};

export default {
  login,
  register,
  getCurrentUser,
  changePassword,
  updateEmail,
  updateWeeklyGoal
};
