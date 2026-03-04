import { useState, useEffect } from 'react';
import { orgUnitsService } from '../services/api';
import { orgUnitRepository, syncQueue } from '../offline/index.js';
import { generateUUID } from '../utils/uuid';

export const useOrganizationalUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Online: cargar desde backend
        const { organizationalUnits: data } = await orgUnitsService.getAll();

        setUnits(data);
        
        // Guardar en cache local
        await orgUnitRepository.saveMany(data);

      } else {
        // Offline: cargar desde IndexedDB
        const localUnits = await orgUnitRepository.findAll();
        setUnits(localUnits);
      }

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading organizational units:', err);
      }
      setError(err.message);

      // Fallback a datos locales
      try {
        const localUnits = await orgUnitRepository.findAll();
        setUnits(localUnits);
      } catch (localErr) {
        if (import.meta.env.DEV) {
          console.error('Error loading local units:', localErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const createUnit = async (unitData) => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Online: crear en backend
        const response = await orgUnitsService.create(unitData);
        
        if (import.meta.env.DEV) {
          console.log('Response from backend:', response);
        }
        
        const organizationalUnit = response.organizationalUnit;
        
        if (!organizationalUnit || !organizationalUnit.id) {
          if (import.meta.env.DEV) {
            console.error('Respuesta inválida:', response);
          }
          throw new Error('Respuesta inválida del servidor');
        }

        setUnits(prev => [...prev, organizationalUnit]);
        
        // Guardar en IndexedDB con manejo de errores
        try {
          await orgUnitRepository.save(organizationalUnit);
        } catch (dbError) {
          if (import.meta.env.DEV) {
            console.error('Error guardando en IndexedDB:', dbError);
            console.error('Objeto a guardar:', organizationalUnit);
          }
          // No fallar si IndexedDB falla, solo logear
        }

        return { success: true, data: organizationalUnit };
      } else {
        // Offline: guardar localmente
        const localUnit = {
          ...unitData,
          id: generateUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          pending_sync: true
        };

        if (import.meta.env.DEV) {
          console.log('Guardando unidad offline:', localUnit);
        }

        try {
          await orgUnitRepository.save(localUnit);
          await syncQueue.add('organizational_units', localUnit.id, 'create', localUnit);
          setUnits(prev => [...prev, localUnit]);
          return { success: true, data: localUnit };
        } catch (dbError) {
          if (import.meta.env.DEV) {
            console.error('Error guardando en IndexedDB offline:', dbError);
            console.error('Objeto:', localUnit);
          }
          throw new Error('No se pudo guardar offline');
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error creating unit:', err);
      }
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUnit = async (id, updates) => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Online: actualizar en backend
        const { organizationalUnit } = await orgUnitsService.update(id, updates);

        setUnits(prev => prev.map(u => u.id === id ? organizationalUnit : u));
        await orgUnitRepository.save(organizationalUnit);

        return { success: true, data: organizationalUnit };
      } else {
        // Offline: actualizar localmente
        const unit = units.find(u => u.id === id);
        if (!unit) throw new Error('Unidad no encontrada');

        const updatedUnit = {
          ...unit,
          ...updates,
          updated_at: new Date().toISOString(),
          pending_sync: true
        };

        await orgUnitRepository.save(updatedUnit);
        await syncQueue.add('organizational_units', id, 'update', updatedUnit);
        setUnits(prev => prev.map(u => u.id === id ? updatedUnit : u));

        return { success: true, data: updatedUnit };
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error updating unit:', err);
      }
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteUnit = async (id) => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Online: eliminar en backend
        await orgUnitsService.delete(id);

        setUnits(prev => prev.filter(u => u.id !== id));
        await orgUnitRepository.delete(id);

        return { success: true };
      } else {
        // Offline: marcar para eliminación
        await orgUnitRepository.delete(id);
        await syncQueue.add('organizational_units', id, 'delete', { id });

        setUnits(prev => prev.filter(u => u.id !== id));
        return { success: true };
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error deleting unit:', err);
      }
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (parentId = null) => {
    return units
      .filter(unit => unit.parent_id === parentId)
      .map(unit => ({
        ...unit,
        children: buildTree(unit.id)
      }));
  };

  const getUnitsByType = (type) => {
    return units.filter(unit => unit.type === type);
  };

  const getUnitById = (id) => {
    return units.find(unit => unit.id === id);
  };

  const getUnitChildren = (parentId) => {
    return units.filter(unit => unit.parent_id === parentId);
  };

  const getUnitPath = (unitId) => {
    const unit = getUnitById(unitId);
    if (!unit) return [];

    const path = [unit];
    let currentUnit = unit;

    while (currentUnit.parent_id) {
      currentUnit = getUnitById(currentUnit.parent_id);
      if (currentUnit) {
        path.unshift(currentUnit);
      } else {
        break;
      }
    }

    return path;
  };

  return {
    units,
    loading,
    error,
    createUnit,
    updateUnit,
    deleteUnit,
    loadUnits,
    buildTree,
    getUnitsByType,
    getUnitById,
    getUnitChildren,
    getUnitPath
  };
};

export default useOrganizationalUnits;
