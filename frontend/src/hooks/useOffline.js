import { useState, useEffect } from 'react';
import { syncService } from '../services/syncService';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    // Handlers para eventos de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Conexión perdida');
    };

    // Listener para eventos de sincronización
    const handleSyncEvent = (event) => {
      switch (event.type) {
        case 'sync_start':
          setIsSyncing(true);
          break;
        
        case 'sync_complete':
          setIsSyncing(false);
          setSyncStatus({
            type: 'success',
            message: `Sincronizados ${event.data.synced} registros`,
            data: event.data
          });
          updatePendingChanges();
          break;
        
        case 'sync_error':
          setIsSyncing(false);
          setSyncStatus({
            type: 'error',
            message: event.error
          });
          break;
        
        case 'offline':
          setIsOnline(false);
          break;
        
        case 'download_complete':
          setSyncStatus({
            type: 'success',
            message: 'Datos descargados correctamente',
            data: event.data
          });
          break;
        
        default:
          break;
      }
    };

    // Agregar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    syncService.addListener(handleSyncEvent);

    // Obtener estado inicial
    updatePendingChanges();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncService.removeListener(handleSyncEvent);
    };
  }, []);

  const updatePendingChanges = async () => {
    try {
      const status = await syncService.getSyncStatus();
      setPendingChanges(status.pendingCount + status.queueCount);
    } catch (error) {
      console.error('Error updating pending changes:', error);
    }
  };

  const manualSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncService.sync();
      await updatePendingChanges();
      return result;
    } catch (error) {
      console.error('Error during manual sync:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const downloadData = async (userId) => {
    try {
      setIsSyncing(true);
      const result = await syncService.downloadData(userId);
      return result;
    } catch (error) {
      console.error('Error downloading data:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncStatus = async () => {
    try {
      return await syncService.getSyncStatus();
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  };

  const clearSyncStatus = () => {
    setSyncStatus(null);
  };

  return {
    isOnline,
    isSyncing,
    syncStatus,
    pendingChanges,
    manualSync,
    downloadData,
    getSyncStatus,
    clearSyncStatus,
    updatePendingChanges
  };
};

export default useOffline;
