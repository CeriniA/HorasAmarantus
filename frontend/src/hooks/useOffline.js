import { useState, useEffect } from 'react';
import { syncManager } from '../offline/index.js';
import { connectivityService } from '../services/ConnectivityService.js';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    // Verificar conectividad inicial
    const checkInitialConnectivity = async () => {
      const status = await connectivityService.checkConnectivity();
      setIsOnline(status.backend);
      
      if (import.meta.env.DEV) {
        console.log('🔌 Estado inicial de conectividad:', status);
      }
    };
    
    checkInitialConnectivity();

    // Handlers para eventos de conectividad del navegador
    const handleOnline = async () => {
      if (import.meta.env.DEV) {
        console.log('📶 Navegador: conexión restaurada');
      }
      // Verificar backend real
      const status = await connectivityService.checkConnectivity();
      setIsOnline(status.backend);
    };

    const handleOffline = () => {
      if (import.meta.env.DEV) {
        console.log('📴 Navegador: conexión perdida');
      }
      setIsOnline(false);
    };

    // Listener para eventos de sincronización
    const handleSyncEvent = (event) => {
      switch (event.type) {
        case 'sync_start':
          setIsSyncing(true);
          break;
        
        case 'sync_complete':
          setIsSyncing(false);
          setIsOnline(true); // Si sincronizó, está online
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
    syncManager.addListener(handleSyncEvent);

    // Obtener estado inicial
    updatePendingChanges();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncManager.removeListener(handleSyncEvent);
    };
  }, []);

  const updatePendingChanges = async () => {
    try {
      const status = await syncManager.getSyncStatus();
      setPendingChanges(status.pendingCount + status.queueCount);
    } catch (error) {
      console.error('Error updating pending changes:', error);
    }
  };

  const manualSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncManager.sync();
      await updatePendingChanges();
      return result;
    } catch (error) {
      console.error('Error during manual sync:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const downloadData = async () => {
    try {
      setIsSyncing(true);
      // TODO: Implementar downloadData en SyncManager
      console.warn('downloadData not implemented yet');
      return { success: false, error: 'Not implemented' };
    } catch (error) {
      console.error('Error downloading data:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncStatus = async () => {
    try {
      return await syncManager.getSyncStatus();
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
