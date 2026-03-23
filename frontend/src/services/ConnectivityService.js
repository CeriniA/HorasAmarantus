/**
 * ============================================
 * SERVICIO DE CONECTIVIDAD
 * ============================================
 * 
 * Verifica la conectividad real con el backend.
 * No solo usa navigator.onLine, sino que hace ping al servidor.
 * 
 * Uso:
 *   import { connectivityService } from '@/services/ConnectivityService';
 *   const status = await connectivityService.checkConnectivity();
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// Remover /api del final si existe para construir la URL del health endpoint
const BASE_URL = API_URL.replace(/\/api$/, '');
const HEALTH_ENDPOINT = `${BASE_URL}/health`;
const TIMEOUT_MS = 5000; // 5 segundos

/**
 * ============================================
 * CONNECTIVITY SERVICE
 * ============================================
 */
export class ConnectivityService {
  constructor() {
    this.lastCheck = null;
    this.lastStatus = null;
    this.checkInterval = null;
    this.listeners = [];
  }

  /**
   * Verificar conectividad completa
   * @returns {Object} { online, backend, latency, error }
   */
  async checkConnectivity() {
    // 1. Verificar navigator.onLine primero (rápido)
    if (!navigator.onLine) {
      const status = {
        online: false,
        backend: false,
        latency: null,
        error: 'No network connection',
        timestamp: new Date().toISOString(),
      };
      
      this.updateStatus(status);
      return status;
    }

    // 2. Verificar backend con fetch simple
    try {
      const startTime = Date.now();
      
      if (import.meta.env.DEV) {
        console.log(`🔍 Verificando conectividad con: ${HEALTH_ENDPOINT}`);
      }
      
      // Fetch simple sin AbortController
      const response = await fetch(HEALTH_ENDPOINT, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const latency = Date.now() - startTime;

      const status = {
        online: true,
        backend: response.ok,
        latency,
        error: response.ok ? null : `Backend returned ${response.status}`,
        timestamp: new Date().toISOString(),
      };

      if (import.meta.env.DEV) {
        console.log(`✅ Conectividad verificada:`, status);
      }

      this.updateStatus(status);
      return status;

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`❌ Error de conectividad:`, error.message);
        console.log(`   Endpoint: ${HEALTH_ENDPOINT}`);
        console.log(`   ¿Backend corriendo en http://localhost:3001?`);
      }
      
      const status = {
        online: true,
        backend: false,
        latency: null,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      this.updateStatus(status);
      return status;
    }
  }

  /**
   * Verificar solo si el backend responde (sin actualizar estado)
   * Útil para verificaciones rápidas
   */
  async isBackendReachable() {
    try {
      const response = await fetch(HEALTH_ENDPOINT, {
        method: 'GET',
        cache: 'no-cache',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Obtener último estado conocido
   */
  getLastStatus() {
    return this.lastStatus;
  }

  /**
   * Verificar si está online (usa último estado conocido)
   */
  isOnline() {
    if (!this.lastStatus) {
      return navigator.onLine;
    }
    return this.lastStatus.online && this.lastStatus.backend;
  }

  /**
   * Actualizar estado y notificar listeners
   */
  updateStatus(status) {
    const previousStatus = this.lastStatus;
    this.lastStatus = status;
    this.lastCheck = Date.now();

    // Notificar solo si cambió el estado
    if (
      !previousStatus ||
      previousStatus.online !== status.online ||
      previousStatus.backend !== status.backend
    ) {
      this.notifyListeners(status, previousStatus);
    }
  }

  /**
   * Agregar listener para cambios de conectividad
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remover listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }

  /**
   * Notificar a todos los listeners
   */
  notifyListeners(newStatus, oldStatus) {
    this.listeners.forEach((listener) => {
      try {
        listener(newStatus, oldStatus);
      } catch (error) {
        console.error('Error in connectivity listener:', error);
      }
    });
  }

  /**
   * Iniciar monitoreo periódico de conectividad
   * @param {number} intervalMs - Intervalo en milisegundos
   */
  startMonitoring(intervalMs = 30000) {
    if (this.checkInterval) {
      console.warn('Connectivity monitoring already started');
      return;
    }

    // Verificar inmediatamente
    this.checkConnectivity();

    // Verificar periódicamente
    // eslint-disable-next-line no-undef
    this.checkInterval = setInterval(() => {
      this.checkConnectivity();
    }, intervalMs);

    // Escuchar eventos del navegador
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    if (import.meta.env.DEV) {
      console.log('🔍 Connectivity monitoring started');
    }
  }

  /**
   * Detener monitoreo
   */
  stopMonitoring() {
    if (this.checkInterval) {
      // eslint-disable-next-line no-undef
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if (import.meta.env.DEV) {
      console.log('🔍 Connectivity monitoring stopped');
    }
  }

  /**
   * Handler para evento online
   */
  handleOnline = () => {
    if (import.meta.env.DEV) {
      console.log('📶 Browser online event');
    }
    this.checkConnectivity();
  };

  /**
   * Handler para evento offline
   */
  handleOffline = () => {
    if (import.meta.env.DEV) {
      console.log('📵 Browser offline event');
    }
    this.updateStatus({
      online: false,
      backend: false,
      latency: null,
      error: 'Browser offline',
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Obtener estadísticas de conectividad
   */
  getStats() {
    return {
      lastCheck: this.lastCheck,
      lastStatus: this.lastStatus,
      isMonitoring: !!this.checkInterval,
      listenersCount: this.listeners.length,
    };
  }
}

/**
 * ============================================
 * EXPORT SINGLETON
 * ============================================
 */
export const connectivityService = new ConnectivityService();

export default connectivityService;
