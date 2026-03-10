import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { generateToken } from '../config/auth.js';
import { authenticate } from '../middleware/auth.js';
import { validateLogin, validateRegister } from '../middleware/validators.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizational_unit_id: user.organizational_unit_id
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        organizational_unit_id: user.organizational_unit_id
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/register (solo admins pueden crear usuarios)
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password, name, role, organizational_unit_id } = req.body;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email: email || null, // Email opcional
        password_hash,
        name,
        role,
        organizational_unit_id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/auth/me (obtener usuario actual)
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, name, role, organizational_unit_id, is_active, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/change-password (cambiar contraseña propia)
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    // Obtener usuario actual
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/auth/me/email (actualizar email propio)
router.put('/me/email', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    // Validar email si se proporciona
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      // Verificar que el email no esté en uso por otro usuario
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ error: 'Este email ya está en uso' });
      }
    }

    // Actualizar email (o establecer a null si está vacío)
    const { data, error } = await supabase
      .from('users')
      .update({ email: email && email.trim() ? email.trim() : null })
      .eq('id', userId)
      .select('id, username, email, name, role, organizational_unit_id')
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Email actualizado correctamente',
      user: data
    });
  } catch (error) {
    console.error('Error actualizando email:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
