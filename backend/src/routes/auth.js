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

    const { email, password } = req.body;

    // Buscar usuario en Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

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
      email: user.email,
      role: user.role,
      organizational_unit_id: user.organizational_unit_id
    });

    res.json({
      token,
      user: {
        id: user.id,
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

    const { email, password, name, role, organizational_unit_id } = req.body;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario en Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        name,
        role,
        organizational_unit_id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
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
      .select('id, email, name, role, organizational_unit_id, is_active, created_at')
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

export default router;
