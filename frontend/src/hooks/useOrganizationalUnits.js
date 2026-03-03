import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { db, cacheOrganizationalUnits, getLocalOrganizationalUnits } from '../db/indexedDB';

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
        // Online: cargar desde Supabase
        const { data, error: supabaseError } = await supabase
          .from('organizational_units')
          .select('*')
          .eq('is_active', true)
          .order('path');

        if (supabaseError) throw supabaseError;

        setUnits(data);
        
        // Guardar en cache local
        await cacheOrganizationalUnits(data);

      } else {
        // Offline: cargar desde IndexedDB
        const localUnits = await getLocalOrganizationalUnits();
        setUnits(localUnits);
      }

    } catch (err) {
      console.error('Error loading organizational units:', err);
      setError(err.message);

      // Fallback a datos locales
      try {
        const localUnits = await getLocalOrganizationalUnits();
        setUnits(localUnits);
      } catch (localErr) {
        console.error('Error loading local units:', localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const createUnit = async (unitData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('organizational_units')
        .insert(unitData)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setUnits(prev => [...prev, data]);
      await db.organizational_units.put(data);

      return { success: true, data };
    } catch (err) {
      console.error('Error creating unit:', err);
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

      const { data, error: supabaseError } = await supabase
        .from('organizational_units')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setUnits(prev => prev.map(u => u.id === id ? data : u));
      await db.organizational_units.put(data);

      return { success: true, data };
    } catch (err) {
      console.error('Error updating unit:', err);
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

      const { error: supabaseError } = await supabase
        .from('organizational_units')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      setUnits(prev => prev.filter(u => u.id !== id));
      await db.organizational_units.delete(id);

      return { success: true };
    } catch (err) {
      console.error('Error deleting unit:', err);
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
