import { useState, useEffect } from 'react';
import { usersService } from '../services/api';

/**
 * Hook para gestión de usuarios
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { users: data } = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const { user } = await usersService.create(userData);
      setUsers(prev => [...prev, user]);

      return { success: true, data: user };
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const { user } = await usersService.update(userId, updates);
      setUsers(prev => prev.map(u => u.id === userId ? user : u));

      return { success: true, data: user };
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      await usersService.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));

      return { success: true };
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser
  };
};

export default useUsers;
