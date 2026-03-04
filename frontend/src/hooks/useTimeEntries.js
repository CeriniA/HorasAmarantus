import { useState, useEffect } from 'react';
import { timeEntriesService } from '../services/api';
import { timeEntryRepository, syncQueue } from '../offline/index.js';

export const useTimeEntries = (userId) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadTimeEntries();
    }
  }, [userId]);

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Cargar desde backend
        const { timeEntries: data } = await timeEntriesService.getAll();
        setTimeEntries(data);

        // Guardar en cache local
        for (const entry of data) {
          await timeEntryRepository.save({
            ...entry,
            pending_sync: false,
            synced_at: new Date().toISOString()
          });
        }
      } else {
        // Modo offline: cargar desde IndexedDB
        const localEntries = await timeEntryRepository.findByUser(userId);
        setTimeEntries(localEntries);
      }
    } catch (err) {
      console.error('Error loading time entries:', err);
      setError(err.message);

      // Fallback a datos locales
      try {
        const localEntries = await timeEntryRepository.findByUser(userId);
        setTimeEntries(localEntries);
      } catch (localErr) {
        console.error('Error loading local entries:', localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (entryData) => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Online: crear en backend
        const { timeEntry } = await timeEntriesService.create(entryData);
        
        setTimeEntries(prev => [timeEntry, ...prev]);

        // Guardar en cache local
        await timeEntryRepository.save({
          ...timeEntry,
          pending_sync: false,
          synced_at: new Date().toISOString()
        });

        return { success: true, data: timeEntry };
      } else {
        // Offline: guardar localmente
        const prepared = timeEntryRepository.prepareForLocal({
          ...entryData,
          status: 'completed'
        }, userId);
        
        await timeEntryRepository.save(prepared);
        await syncQueue.add('time_entries', prepared.id, 'create', prepared);
        
        const localEntry = prepared;

        setTimeEntries(prev => [localEntry, ...prev]);
        return { success: true, data: localEntry };
      }
    } catch (err) {
      console.error('Error creating entry:', err);
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
        // Online: actualizar en backend
        const { timeEntry } = await timeEntriesService.update(entryId, updates);

        setTimeEntries(prev => 
          prev.map(e => e.id === entryId ? timeEntry : e)
        );

        // Actualizar cache local
        await timeEntryRepository.save({
          ...timeEntry,
          pending_sync: false,
          synced_at: new Date().toISOString()
        });

        return { success: true, data: timeEntry };
      } else {
        // Offline: actualizar localmente
        const entry = timeEntries.find(e => e.id === entryId);
        if (!entry) throw new Error('Entrada no encontrada');

        const updatedEntry = { ...entry, ...updates, pending_sync: true };
        await timeEntryRepository.save(updatedEntry);
        await syncQueue.add('time_entries', entryId, 'update', updatedEntry);

        setTimeEntries(prev => 
          prev.map(e => e.id === entryId ? updatedEntry : e)
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
        // Online: eliminar en backend
        await timeEntriesService.delete(entryId);

        setTimeEntries(prev => prev.filter(e => e.id !== entryId));

        // Eliminar de cache local
        await timeEntryRepository.delete(entryId);

        return { success: true };
      } else {
        // Offline: marcar para eliminación
        await timeEntryRepository.delete(entryId);
        await syncQueue.add('time_entries', entryId, 'delete', { id: entryId });

        setTimeEntries(prev => prev.filter(e => e.id !== entryId));
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

  // Helper: Calcular horas totales de un array de entries
  const getTotalHours = (entries) => {
    return entries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
  };

  // Helper: Filtrar entries por rango de fechas
  const getEntriesByDateRange = (startDate, endDate) => {
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  return {
    timeEntries,
    loading,
    error,
    loadTimeEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getTotalHours,
    getEntriesByDateRange,
  };
};

export default useTimeEntries;
