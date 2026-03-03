import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { 
  db, 
  saveTimeEntryLocally, 
  updateTimeEntryLocally,
  deleteTimeEntryLocally,
  getLocalTimeEntries 
} from '../db/indexedDB';

export const useTimeEntries = (userId) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);

  useEffect(() => {
    if (userId) {
      loadTimeEntries();
      subscribeToChanges();
    }
  }, [userId]);

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar desde Supabase
      if (navigator.onLine) {
        const { data, error: supabaseError } = await supabase
          .from('time_entries')
          .select(`
            *,
            organizational_units (
              id,
              name,
              type
            )
          `)
          .eq('user_id', userId)
          .order('start_time', { ascending: false });

        if (supabaseError) throw supabaseError;

        setTimeEntries(data);

        // Guardar en cache local
        for (const entry of data) {
          await db.time_entries.put({
            ...entry,
            pending_sync: false,
            synced_at: new Date().toISOString()
          });
        }

        // Buscar entrada activa
        const active = data.find(e => e.status === 'in_progress');
        setActiveEntry(active || null);

      } else {
        // Modo offline: cargar desde IndexedDB
        const localEntries = await getLocalTimeEntries(userId);
        setTimeEntries(localEntries);

        const active = localEntries.find(e => e.status === 'in_progress');
        setActiveEntry(active || null);
      }

    } catch (err) {
      console.error('Error loading time entries:', err);
      setError(err.message);

      // Fallback a datos locales
      try {
        const localEntries = await getLocalTimeEntries(userId);
        setTimeEntries(localEntries);
      } catch (localErr) {
        console.error('Error loading local entries:', localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    // Suscribirse a cambios en tiempo real (solo si está online)
    const channel = supabase
      .channel('time_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Time entry changed:', payload);
          loadTimeEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startEntry = async (organizationalUnitId, description = '') => {
    try {
      setLoading(true);
      setError(null);

      // Verificar que no haya una entrada activa
      if (activeEntry) {
        throw new Error('Ya tienes un registro de horas en progreso');
      }

      const newEntry = {
        client_id: crypto.randomUUID(),
        user_id: userId,
        organizational_unit_id: organizationalUnitId,
        description,
        start_time: new Date().toISOString(),
        end_time: null,
        status: 'in_progress'
      };

      if (navigator.onLine) {
        // Online: guardar en Supabase
        const { data, error: supabaseError } = await supabase
          .from('time_entries')
          .insert(newEntry)
          .select(`
            *,
            organizational_units (
              id,
              name,
              type
            )
          `)
          .single();

        if (supabaseError) throw supabaseError;

        setActiveEntry(data);
        setTimeEntries(prev => [data, ...prev]);

        // Guardar en cache local
        await db.time_entries.put({
          ...data,
          pending_sync: false,
          synced_at: new Date().toISOString()
        });

        return { success: true, data };

      } else {
        // Offline: guardar localmente
        const savedEntry = await saveTimeEntryLocally(newEntry);
        setActiveEntry(savedEntry);
        setTimeEntries(prev => [savedEntry, ...prev]);

        return { success: true, data: savedEntry };
      }

    } catch (err) {
      console.error('Error starting entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const stopEntry = async (entryId, description = null) => {
    try {
      setLoading(true);
      setError(null);

      const endTime = new Date().toISOString();
      const updates = {
        end_time: endTime,
        status: 'completed'
      };

      if (description !== null) {
        updates.description = description;
      }

      if (navigator.onLine) {
        // Online: actualizar en Supabase
        const { data, error: supabaseError } = await supabase
          .from('time_entries')
          .update(updates)
          .eq('id', entryId)
          .select(`
            *,
            organizational_units (
              id,
              name,
              type
            )
          `)
          .single();

        if (supabaseError) throw supabaseError;

        setActiveEntry(null);
        setTimeEntries(prev => 
          prev.map(e => e.id === entryId ? data : e)
        );

        // Actualizar cache local
        await db.time_entries.put({
          ...data,
          pending_sync: false,
          synced_at: new Date().toISOString()
        });

        return { success: true, data };

      } else {
        // Offline: actualizar localmente
        const entry = timeEntries.find(e => e.id === entryId || e.client_id === entryId);
        if (!entry) throw new Error('Entrada no encontrada');

        const updatedEntry = await updateTimeEntryLocally(entry.client_id, updates);
        
        setActiveEntry(null);
        setTimeEntries(prev => 
          prev.map(e => 
            (e.id === entryId || e.client_id === entry.client_id) ? updatedEntry : e
          )
        );

        return { success: true, data: updatedEntry };
      }

    } catch (err) {
      console.error('Error stopping entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (entryId, updates) => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Online: actualizar en Supabase
        const { data, error: supabaseError } = await supabase
          .from('time_entries')
          .update(updates)
          .eq('id', entryId)
          .select(`
            *,
            organizational_units (
              id,
              name,
              type
            )
          `)
          .single();

        if (supabaseError) throw supabaseError;

        setTimeEntries(prev => 
          prev.map(e => e.id === entryId ? data : e)
        );

        // Actualizar cache local
        await db.time_entries.put({
          ...data,
          pending_sync: false,
          synced_at: new Date().toISOString()
        });

        return { success: true, data };

      } else {
        // Offline: actualizar localmente
        const entry = timeEntries.find(e => e.id === entryId || e.client_id === entryId);
        if (!entry) throw new Error('Entrada no encontrada');

        const updatedEntry = await updateTimeEntryLocally(entry.client_id, updates);
        
        setTimeEntries(prev => 
          prev.map(e => 
            (e.id === entryId || e.client_id === entry.client_id) ? updatedEntry : e
          )
        );

        return { success: true, data: updatedEntry };
      }

    } catch (err) {
      console.error('Error updating entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Online: eliminar de Supabase
        const { error: supabaseError } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', entryId);

        if (supabaseError) throw supabaseError;

        setTimeEntries(prev => prev.filter(e => e.id !== entryId));

        // Eliminar de cache local
        await db.time_entries.delete(entryId);

        return { success: true };

      } else {
        // Offline: eliminar localmente
        const entry = timeEntries.find(e => e.id === entryId || e.client_id === entryId);
        if (!entry) throw new Error('Entrada no encontrada');

        await deleteTimeEntryLocally(entry.client_id);
        
        setTimeEntries(prev => 
          prev.filter(e => e.id !== entryId && e.client_id !== entry.client_id)
        );

        return { success: true };
      }

    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getEntriesByDateRange = (startDate, endDate) => {
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  const getTotalHours = (entries = timeEntries) => {
    return entries
      .filter(e => e.status === 'completed')
      .reduce((total, entry) => total + (entry.total_hours || 0), 0);
  };

  return {
    timeEntries,
    activeEntry,
    loading,
    error,
    startEntry,
    stopEntry,
    updateEntry,
    deleteEntry,
    loadTimeEntries,
    getEntriesByDateRange,
    getTotalHours,
    hasActiveEntry: !!activeEntry
  };
};

export default useTimeEntries;
