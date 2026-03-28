import { useState, useEffect, useCallback } from 'react';
import { timeEntriesService } from '../services/api';
import { timeEntryRepository, syncQueue, syncManager } from '../offline/index.js';

export const useTimeEntries = (userId) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadTimeEntries();
    }
  }, [userId, loadTimeEntries]);

  // Escuchar eventos de sincronización
  useEffect(() => {
    const handleSyncComplete = (event) => {
      if (event.type === 'sync_complete' && event.data.synced > 0) {
        // Recargar datos después de sincronizar
        loadTimeEntries();
      }
    };

    syncManager.addListener(handleSyncComplete);

    return () => {
      syncManager.removeListener(handleSyncComplete);
    };
  }, [loadTimeEntries]);

  const loadTimeEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Cargar desde backend
        const { timeEntries: data } = await timeEntriesService.getAll();
        
        // Obtener entries pendientes de IndexedDB
        const pendingEntries = await timeEntryRepository.findPending();
        
        // Combinar: backend + pendientes locales
        const combined = [...data];
        
        // Agregar pendientes que no estén en backend
        for (const pending of pendingEntries) {
          const existsInBackend = data.some(d => 
            d.id === pending.id || d.client_id === pending.client_id
          );
          if (!existsInBackend) {
            combined.push(pending);
          }
        }
        
        // Eliminar duplicados
        const uniqueEntries = [];
        const seenIds = new Set();
        
        for (const entry of combined) {
          if (seenIds.has(entry.id)) continue;
          seenIds.add(entry.id);
          uniqueEntries.push(entry);
        }
        
        setTimeEntries(uniqueEntries);
        
        // NO guardar en IndexedDB - solo mantener pendientes
        // IndexedDB es solo para offline, no para cache
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
  }, [userId]);

  const createEntry = async (entryData) => {
    try {
      // Solo mostrar loading si estamos online (más rápido)
      if (navigator.onLine) {
        setLoading(true);
      }
      setError(null);

      if (navigator.onLine) {
        // Online: crear en backend
        const { timeEntry } = await timeEntriesService.create(entryData);
        
        setTimeEntries(prev => [timeEntry, ...prev]);

        // NO guardar en IndexedDB - backend es la fuente de verdad

        return { success: true, data: timeEntry };
      } else {
        // Offline: guardar localmente (sin loading para no bloquear UI)
        const prepared = timeEntryRepository.prepareForLocal({
          ...entryData,
          status: 'completed'
        }, userId);
        
        await timeEntryRepository.save(prepared);
        await syncQueue.add('time_entries', prepared.id, 'create', prepared);
        
        // Agregar a la UI inmediatamente
        setTimeEntries(prev => [prepared, ...prev]);

        // Sincronizar en background (sin esperar)
        syncManager.sync().catch(err => {
          console.error('Error en sincronización automática:', err);
        });

        return { success: true, data: prepared };
      }
    } catch (err) {
      console.error('Error creating entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      if (navigator.onLine) {
        setLoading(false);
      }
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

        // Intentar sincronizar en background
        syncManager.sync().catch(err => {
          console.error('Error en sincronización automática:', err);
        });

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
    setTimeEntries,
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
