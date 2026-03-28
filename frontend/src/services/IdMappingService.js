/**
 * ============================================
 * SERVICIO DE MAPEO DE IDs
 * ============================================
 * 
 * Gestiona el mapeo entre IDs temporales (generados offline)
 * e IDs permanentes (asignados por el servidor).
 * 
 * Problema que resuelve:
 * - Cuando se crea un registro offline, se genera un UUID temporal
 * - Al sincronizar, el servidor devuelve un ID diferente
 * - Esto causa referencias rotas si otros registros apuntan al ID temporal
 * 
 * Solución:
 * - Mantiene un mapa de temp_id -> server_id
 * - Actualiza todas las referencias cuando se mapea un ID
 * - Persiste en IndexedDB para sobrevivir recargas
 * 
 * Uso:
 *   import { idMappingService } from '@/services/IdMappingService';
 *   
 *   // Mapear ID temporal a ID del servidor
 *   await idMappingService.mapId('temp-123', 'server-456');
 *   
 *   // Obtener ID del servidor
 *   const serverId = await idMappingService.getServerId('temp-123');
 */

import { db } from '../offline/core/db.js';

/**
 * ============================================
 * ID MAPPING SERVICE
 * ============================================
 */
export class IdMappingService {
  constructor() {
    // Caché en memoria para acceso rápido
    this.mappings = new Map();
    this.initialized = false;
  }

  /**
   * Inicializar el servicio cargando mappings desde IndexedDB
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Verificar si la tabla existe
      if (!db.id_mappings) {
        console.warn('⚠️ Tabla id_mappings no existe aún. Esperando migración de DB...');
        this.initialized = true;
        return;
      }

      const mappings = await db.id_mappings.toArray();
      
      for (const mapping of mappings) {
        this.mappings.set(mapping.temp_id, mapping.server_id);
      }

      this.initialized = true;

      if (import.meta.env.DEV) {
        console.log(`📋 IdMappingService inicializado con ${mappings.length} mappings`);
      }
    } catch (error) {
      // Si la tabla no existe, solo advertir pero no fallar
      if (error.name === 'NotFoundError' || error.message.includes('id_mappings')) {
        console.warn('⚠️ Tabla id_mappings no disponible. Se creará en próxima versión de DB.');
        this.initialized = true;
      } else {
        console.error('Error inicializando IdMappingService:', error);
      }
    }
  }

  /**
   * Mapear un ID temporal a un ID del servidor
   * @param {string} tempId - ID temporal generado offline
   * @param {string} serverId - ID asignado por el servidor
   * @param {string} entityType - Tipo de entidad (time_entries, etc.)
   */
  async mapId(tempId, serverId, entityType = 'unknown') {
    if (!tempId || !serverId) {
      throw new Error('tempId y serverId son requeridos');
    }

    if (tempId === serverId) {
      // No es necesario mapear si son iguales
      return;
    }

    try {
      // Guardar en caché
      this.mappings.set(tempId, serverId);

      // Guardar en IndexedDB
      await db.id_mappings.put({
        temp_id: tempId,
        server_id: serverId,
        entity_type: entityType,
        created_at: new Date().toISOString(),
      });

      if (import.meta.env.DEV) {
        console.log(`🔗 ID mapeado: ${tempId} -> ${serverId} (${entityType})`);
      }
    } catch (error) {
      console.error('Error mapeando ID:', error);
      throw error;
    }
  }

  /**
   * Obtener el ID del servidor para un ID temporal
   * @param {string} tempId - ID temporal
   * @returns {string} ID del servidor o el mismo ID si no hay mapeo
   */
  async getServerId(tempId) {
    if (!tempId) return tempId;

    // Buscar en caché primero
    if (this.mappings.has(tempId)) {
      return this.mappings.get(tempId);
    }

    // Buscar en IndexedDB
    try {
      const mapping = await db.id_mappings.get(tempId);
      
      if (mapping) {
        // Actualizar caché
        this.mappings.set(tempId, mapping.server_id);
        return mapping.server_id;
      }
    } catch (error) {
      console.error('Error obteniendo server ID:', error);
    }

    // Si no hay mapeo, devolver el ID original
    return tempId;
  }

  /**
   * Verificar si un ID es temporal (tiene mapeo)
   * @param {string} id - ID a verificar
   * @returns {boolean} true si es temporal
   */
  async isTemporaryId(id) {
    if (!id) return false;

    if (this.mappings.has(id)) {
      return true;
    }

    try {
      const mapping = await db.id_mappings.get(id);
      return !!mapping;
    } catch (error) {
      console.error('Error verificando ID temporal:', error);
      return false;
    }
  }

  /**
   * Actualizar referencias en la cola de sincronización
   * Busca todos los items que referencian el ID temporal y los actualiza
   * @param {string} entityType - Tipo de entidad
   * @param {string} tempId - ID temporal
   * @param {string} serverId - ID del servidor
   */
  async updateReferencesInQueue(entityType, tempId, serverId) {
    if (!tempId || !serverId || tempId === serverId) {
      return;
    }

    try {
      // Obtener todos los items de la cola
      const queueItems = await db.sync_queue.toArray();
      let updatedCount = 0;

      for (const item of queueItems) {
        let needsUpdate = false;
        const updatedData = { ...item };

        // Actualizar entity_id si coincide
        if (item.entity_id === tempId) {
          updatedData.entity_id = serverId;
          needsUpdate = true;
        }

        // Actualizar referencias en el data
        if (item.data) {
          const updatedItemData = this.updateReferencesInObject(item.data, tempId, serverId);
          if (updatedItemData !== item.data) {
            updatedData.data = updatedItemData;
            needsUpdate = true;
          }
        }

        // Guardar si hubo cambios
        if (needsUpdate) {
          await db.sync_queue.update(item.id, updatedData);
          updatedCount++;
        }
      }

      if (import.meta.env.DEV && updatedCount > 0) {
        console.log(`🔄 Actualizadas ${updatedCount} referencias en cola de sync`);
      }
    } catch (error) {
      console.error('Error actualizando referencias en cola:', error);
    }
  }

  /**
   * Actualizar referencias en un objeto recursivamente
   * @param {Object} obj - Objeto a actualizar
   * @param {string} tempId - ID temporal a reemplazar
   * @param {string} serverId - ID del servidor
   * @returns {Object} Objeto actualizado
   */
  updateReferencesInObject(obj, tempId, serverId) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // Crear copia para no mutar el original
    const updated = Array.isArray(obj) ? [...obj] : { ...obj };
    let hasChanges = false;

    for (const key in updated) {
      const value = updated[key];

      // Si el valor es el ID temporal, reemplazarlo
      if (value === tempId) {
        updated[key] = serverId;
        hasChanges = true;
      }
      // Si es un objeto, recursión
      else if (typeof value === 'object' && value !== null) {
        const updatedValue = this.updateReferencesInObject(value, tempId, serverId);
        if (updatedValue !== value) {
          updated[key] = updatedValue;
          hasChanges = true;
        }
      }
    }

    return hasChanges ? updated : obj;
  }

  /**
   * Limpiar mappings antiguos (más de 30 días)
   */
  async cleanOldMappings() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const allMappings = await db.id_mappings.toArray();
      let deletedCount = 0;

      for (const mapping of allMappings) {
        const createdAt = new Date(mapping.created_at);
        
        if (createdAt < thirtyDaysAgo) {
          await db.id_mappings.delete(mapping.temp_id);
          this.mappings.delete(mapping.temp_id);
          deletedCount++;
        }
      }

      if (import.meta.env.DEV && deletedCount > 0) {
        console.log(`🧹 Limpiados ${deletedCount} mappings antiguos`);
      }
    } catch (error) {
      console.error('Error limpiando mappings antiguos:', error);
    }
  }

  /**
   * Obtener estadísticas de mappings
   */
  async getStats() {
    try {
      const allMappings = await db.id_mappings.toArray();
      
      return {
        total: allMappings.length,
        inMemory: this.mappings.size,
        byEntityType: allMappings.reduce((acc, m) => {
          acc[m.entity_type] = (acc[m.entity_type] || 0) + 1;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('Error obteniendo stats:', error);
      return { total: 0, inMemory: 0, byEntityType: {} };
    }
  }

  /**
   * Limpiar todos los mappings (útil para testing)
   */
  async clearAll() {
    try {
      await db.id_mappings.clear();
      this.mappings.clear();
      
      if (import.meta.env.DEV) {
        console.log('🧹 Todos los mappings limpiados');
      }
    } catch (error) {
      console.error('Error limpiando mappings:', error);
    }
  }
}

/**
 * ============================================
 * EXPORT SINGLETON
 * ============================================
 */
export const idMappingService = new IdMappingService();

// Inicializar automáticamente
idMappingService.initialize().catch(error => {
  console.error('Error auto-inicializando IdMappingService:', error);
});

export default idMappingService;
