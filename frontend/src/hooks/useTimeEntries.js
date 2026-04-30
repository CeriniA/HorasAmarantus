import { useState, useEffect, useCallback } from 'react';
import { timeEntriesService } from '../services/api';
import { timeEntryRepository, syncQueue, syncManager } from '../offline/index.js';
import logger from '../utils/logger';
import { safeDate } from '../utils/dateHelpers';

export const useTimeEntries = (userId) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definir loadTimeEntries ANTES de usarlo en useEffect
  const loadTimeEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        if (import.meta.env.DEV) console.log('🔄 LOAD: Cargando desde backend...');
        // Cargar desde backend
        const { timeEntries: data } = await timeEntriesService.getAll();
        if (import.meta.env.DEV) console.log('📥 LOAD: Backend devolvió', data.length, 'entries');
        
        // Obtener entries pendientes de IndexedDB
        const pendingEntries = await timeEntryRepository.findPending();
        if (import.meta.env.DEV) console.log('💾 LOAD: IndexedDB tiene', pendingEntries.length, 'pendientes');
        
        // Combinar: backend + pendientes locales
        const combined = [...data];
        
        // Agregar pendientes que no estén en backend
        const entriesToKeep = [];
        const entriesToDelete = [];
        
        for (const pending of pendingEntries) {
          const existsInBackend = data.some(d => 
            d.id === pending.id || d.client_id === pending.client_id
          );
          if (!existsInBackend) {
            if (import.meta.env.DEV) console.log('➕ LOAD: Agregando pending', pending.client_id, 'a combined');
            combined.push(pending);
            entriesToKeep.push(pending);
          } else {
            if (import.meta.env.DEV) console.log('🗑️ LOAD: Pending', pending.client_id, 'ya existe en backend, marcado para borrar');
            entriesToDelete.push(pending);
          }
        }
        
        // Limpiar entries sincronizados de IndexedDB
        if (import.meta.env.DEV) console.log('🧹 LOAD: Limpiando', entriesToDelete.length, 'entries de IndexedDB');
        for (const entry of entriesToDelete) {
          try {
            await timeEntryRepository.delete(entry.id);
            if (import.meta.env.DEV) console.log('✅ LOAD: Eliminado de IndexedDB:', entry.id);
          } catch (err) {
            console.error('❌ LOAD: Error eliminando entry sincronizado:', err);
          }
        }
        
        // Eliminar duplicados por id y client_id
        const uniqueEntries = [];
        const seenIds = new Set();
        const seenClientIds = new Set();
        
        for (const entry of combined) {
          const isDuplicate = seenIds.has(entry.id) || 
                             (entry.client_id && seenClientIds.has(entry.client_id));
          if (isDuplicate) continue;
          
          seenIds.add(entry.id);
          if (entry.client_id) seenClientIds.add(entry.client_id);
          uniqueEntries.push(entry);
        }
        
        if (import.meta.env.DEV) console.log('✅ LOAD: Total final después de dedup:', uniqueEntries.length, 'entries');
        setTimeEntries(uniqueEntries);
        
        // NO guardar en IndexedDB - solo mantener pendientes
        // IndexedDB es solo para offline, no para cache
      } else {
        logger.info('📴 LOAD: Modo offline, cargando desde IndexedDB');
        // Modo offline: cargar SOLO entries pendientes del usuario actual
        const pendingEntries = await timeEntryRepository.findPending();
        const userPendingEntries = pendingEntries.filter(e => e.user_id === userId);
        logger.info('💾 LOAD: Offline tiene', userPendingEntries.length, 'entries pendientes del usuario');
        setTimeEntries(userPendingEntries);
      }
    } catch (err) {
      logger.error('Error loading time entries:', err);
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

  // useEffect para cargar datos cuando cambia userId
  useEffect(() => {
    if (userId) {
      loadTimeEntries();
    }
  }, [userId, loadTimeEntries]);

  // Escuchar eventos de sincronización
  useEffect(() => {
    const handleSyncComplete = (event) => {
      if (event.type === 'sync_complete' && event.data.synced > 0) {
        if (import.meta.env.DEV) console.log('🎉 EVENT: sync_complete recibido, synced:', event.data.synced);
        // NO recargar - los entries ya están en la UI
        // Solo actualizar IDs si es necesario
      }
    };

    syncManager.addListener(handleSyncComplete);

    return () => {
      syncManager.removeListener(handleSyncComplete);
    };
  }, [loadTimeEntries]);

  const createEntry = async (entryData) => {
    try {
      setError(null);
      // NO usar setLoading aquí - solo para carga inicial
      // Las operaciones individuales usan su propio loading local

      if (navigator.onLine) {
        // Online: crear en backend
        const { timeEntry } = await timeEntriesService.create(entryData);
        
        setTimeEntries(prev => [timeEntry, ...prev]);

        // NO guardar en IndexedDB - backend es la fuente de verdad

        return { success: true, data: timeEntry };
      } else {
        if (import.meta.env.DEV) console.log('📴 CREATE: Modo offline, guardando localmente');
        // Offline: guardar localmente
        const prepared = timeEntryRepository.prepareForLocal({
          ...entryData,
          status: 'completed'
        }, userId);
        
        if (import.meta.env.DEV) console.log('💾 CREATE: Guardando en IndexedDB:', prepared.client_id);
        await timeEntryRepository.save(prepared);
        await syncQueue.add('time_entries', prepared.id, 'create', prepared);
        
        // Agregar a la UI inmediatamente
        if (import.meta.env.DEV) console.log('➕ CREATE: Agregando a UI:', prepared.client_id);
        setTimeEntries(prev => {
          if (import.meta.env.DEV) console.log('📊 CREATE: UI tenía', prev.length, 'entries');
          return [prepared, ...prev];
        });

        // Sincronizar en background Y actualizar ID cuando vuelva
        if (import.meta.env.DEV) console.log('🔄 CREATE: Iniciando sync en background...');
        syncManager.sync().then(() => {
          if (import.meta.env.DEV) console.log('✅ SYNC: Completado, recargando entries...');
          // Después de sincronizar, recargar para obtener IDs reales del backend
          loadTimeEntries();
        }).catch(err => {
          console.error('❌ SYNC: Error en sincronización automática:', err);
        });

        return { success: true, data: prepared };
      }
    } catch (err) {
      console.error('Error creating entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateEntry = async (entryId, updates) => {
    try {
      setError(null);
      // NO usar setLoading - solo para carga inicial

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
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      setError(null);
      // NO usar setLoading - solo para carga inicial

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
    }
  };

  // Helper: Calcular horas totales de un array de entries
  const getTotalHours = (entries) => {
    return entries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
  };

  // Helper: Filtrar entries por rango de fechas
  const getEntriesByDateRange = (startDate, endDate) => {
    return timeEntries.filter(entry => {
      const entryDate = safeDate(entry.start_time);
      if (!entryDate) return false;
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
