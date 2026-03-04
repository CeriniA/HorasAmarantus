import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, canManageUser } from '../middleware/roles.js';
import { validateCreateUser, validateUpdateUser, validateUUID } from '../middleware/validators.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/users - Obtener usuarios según rol
router.get('/', async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = supabase
      .from('users')
      .select('id, email, name, role, organizational_unit_id, is_active, created_at')
      .eq('is_active', true);

    // Filtrar según rol
    if (role === 'operario') {
      // Operarios solo ven su propio perfil
      query = query.eq('id', id);
    }
    // Superadmin y Admin ven todos (no se filtra)

    const { data, error } = await query;

    if (error) throw error;

    res.json({ users: data });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/users/:id - Obtener un usuario
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, organizational_unit_id, is_active, created_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar permisos
    if (role === 'operario' && id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos' });
    }
    // Superadmin y Admin pueden ver cualquier usuario

    res.json({ user: data });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/users - Crear usuario (solo admin/superadmin)
router.post('/', requireAdmin, canManageUser, validateCreateUser, async (req, res) => {
  try {

    const { email, password, name, role, organizational_unit_id } = req.body;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        name,
        role,
        organizational_unit_id
      })
      .select('id, email, name, role, organizational_unit_id, is_active, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({ user: data });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', validateUpdateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { role: userRole, id: userId } = req.user;
    const updates = { ...req.body };

    // Solo el usuario mismo, admin o superadmin pueden actualizar
    if (id !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    // Verificar si intenta cambiar rol
    if (updates.role) {
      // Solo superadmin puede cambiar roles
      if (userRole !== 'superadmin') {
        delete updates.role;
      }
      // Admin no puede crear/editar otros admins o superadmins
      else if (userRole === 'admin' && (updates.role === 'admin' || updates.role === 'superadmin')) {
        return res.status(403).json({ error: 'No puedes gestionar usuarios con rol admin o superadmin' });
      }
    }

    // Si hay password, hashearlo
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, name, role, organizational_unit_id, is_active, created_at')
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
