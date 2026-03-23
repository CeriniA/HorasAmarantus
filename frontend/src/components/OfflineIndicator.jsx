/**
 * ============================================
 * INDICADOR DE ESTADO OFFLINE
 * ============================================
 * 
 * Componente visual que muestra:
 * - Estado de conectividad (online/offline)
 * - Progreso de sincronización
 * - Cambios pendientes
 * - Errores de sincronización
 * 
 * Uso:
 *   import { OfflineIndicator } from '@/components/OfflineIndicator';
 *   <OfflineIndicator />
 */

import { useOffline } from '../hooks/useOffline';
import { WifiOff, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export const OfflineIndicator = () => {
  const { 
    isOnline, 
    isSyncing, 
    pendingChanges, 
    syncStatus, 
    manualSync,
    clearSyncStatus 
  } = useOffline();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Mostrar toast cuando cambia syncStatus
  useEffect(() => {
    if (syncStatus) {
      setToastMessage(syncStatus);
      setShowToast(true);

      // Auto-ocultar después de 5 segundos
      const timer = setTimeout(() => {
        setShowToast(false);
        clearSyncStatus();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [syncStatus, clearSyncStatus]);

  // Si está online, sin cambios pendientes y no está sincronizando, no mostrar nada
  if (isOnline && pendingChanges === 0 && !isSyncing && !showToast) {
    return null;
  }

  return (
    <>
      {/* Indicador Principal */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Badge de Estado */}
        {(!isOnline || pendingChanges > 0 || isSyncing) && (
          <div
            className={`
              px-4 py-3 rounded-lg shadow-lg flex items-center gap-3
              transition-all duration-300 ease-in-out
              ${!isOnline 
                ? 'bg-red-500 text-white' 
                : isSyncing 
                  ? 'bg-blue-500 text-white'
                  : 'bg-yellow-500 text-white'
              }
            `}
          >
            {/* Icono */}
            <div className="flex-shrink-0">
              {!isOnline ? (
                <WifiOff className="w-5 h-5" />
              ) : isSyncing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>

            {/* Mensaje */}
            <div className="flex-1 min-w-0">
              {!isOnline && (
                <>
                  <p className="font-medium text-sm">Sin conexión</p>
                  {pendingChanges > 0 && (
                    <p className="text-xs opacity-90 mt-0.5">
                      {pendingChanges} {pendingChanges === 1 ? 'cambio' : 'cambios'} pendiente{pendingChanges === 1 ? '' : 's'}
                    </p>
                  )}
                </>
              )}

              {isOnline && isSyncing && (
                <>
                  <p className="font-medium text-sm">Sincronizando...</p>
                  {pendingChanges > 0 && (
                    <p className="text-xs opacity-90 mt-0.5">
                      {pendingChanges} {pendingChanges === 1 ? 'cambio' : 'cambios'}
                    </p>
                  )}
                </>
              )}

              {isOnline && !isSyncing && pendingChanges > 0 && (
                <>
                  <p className="font-medium text-sm">Cambios pendientes</p>
                  <p className="text-xs opacity-90 mt-0.5">
                    {pendingChanges} {pendingChanges === 1 ? 'registro' : 'registros'} sin sincronizar
                  </p>
                </>
              )}
            </div>

            {/* Botón de Sync Manual */}
            {isOnline && !isSyncing && pendingChanges > 0 && (
              <button
                onClick={manualSync}
                className="
                  flex-shrink-0 px-3 py-1.5 
                  bg-white text-yellow-600 
                  rounded-md text-sm font-medium
                  hover:bg-gray-100 
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-500
                "
              >
                Sincronizar
              </button>
            )}
          </div>
        )}

        {/* Toast de Notificación */}
        {showToast && toastMessage && (
          <div
            className={`
              mt-2 px-4 py-3 rounded-lg shadow-lg
              flex items-center gap-3
              transition-all duration-300 ease-in-out
              ${toastMessage.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
              }
            `}
          >
            {/* Icono */}
            <div className="flex-shrink-0">
              {toastMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>

            {/* Mensaje */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toastMessage.message}</p>
              {toastMessage.data && toastMessage.data.synced > 0 && (
                <p className="text-xs opacity-90 mt-0.5">
                  {toastMessage.data.synced} {toastMessage.data.synced === 1 ? 'registro sincronizado' : 'registros sincronizados'}
                </p>
              )}
            </div>

            {/* Botón Cerrar */}
            <button
              onClick={() => {
                setShowToast(false);
                clearSyncStatus();
              }}
              className="
                flex-shrink-0 p-1 
                hover:bg-white hover:bg-opacity-20 
                rounded transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-white
              "
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Badge Pequeño en la Esquina (cuando todo está bien pero hay actividad reciente) */}
      {isOnline && pendingChanges === 0 && !isSyncing && showToast && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
