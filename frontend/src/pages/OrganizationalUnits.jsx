import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Alert from '../components/common/Alert';
import HierarchicalSelect from '../components/common/HierarchicalSelect';

const TreeNode = ({ node, onEdit, onDelete, onAddChild }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const typeColors = {
    area: 'bg-blue-100 text-blue-800',
    proceso: 'bg-green-100 text-green-800',
    subproceso: 'bg-yellow-100 text-yellow-800',
    tarea: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="ml-4">
      <div className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2 group">
        {/* Expand/Collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mr-2 text-gray-400 hover:text-gray-600"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        {/* Node info */}
        <div className="flex-1 flex items-center space-x-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[node.type]}`}>
            {node.type}
          </span>
          <span className="font-medium text-gray-900">{node.name}</span>
          <span className="text-xs text-gray-500">Nivel {node.level}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(node)}
            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
            title="Agregar hijo"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Editar"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l-2 border-gray-200">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrganizationalUnits = () => {
  const { units, loading, createUnit, updateUnit, deleteUnit, buildTree } = useOrganizationalUnits();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentUnit, setCurrentUnit] = useState(null);
  const [parentUnit, setParentUnit] = useState(null);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'area',
    parent_id: null
  });

  const typeOptions = [
    { value: 'area', label: 'Área' },
    { value: 'proceso', label: 'Proceso' },
    { value: 'subproceso', label: 'Subproceso' },
    { value: 'tarea', label: 'Tarea' }
  ];

  const handleCreate = () => {
    setModalMode('create');
    setCurrentUnit(null);
    setParentUnit(null);
    setFormData({
      name: '',
      type: 'area',
      parent_id: null
    });
    setShowModal(true);
  };

  const handleAddChild = (parent) => {
    setModalMode('create');
    setParentUnit(parent);
    setCurrentUnit(null);
    
    // Determinar el tipo automáticamente basado en el nivel
    let childType = 'tarea';
    if (parent.type === 'area') childType = 'proceso';
    else if (parent.type === 'proceso') childType = 'subproceso';
    else if (parent.type === 'subproceso') childType = 'tarea';

    setFormData({
      name: '',
      type: childType,
      parent_id: parent.id
    });
    setShowModal(true);
  };

  const handleEdit = (unit) => {
    setModalMode('edit');
    setCurrentUnit(unit);
    setParentUnit(null);
    setFormData({
      name: unit.name,
      type: unit.type,
      parent_id: unit.parent_id
    });
    setShowModal(true);
  };

  const handleDelete = async (unit) => {
    if (!confirm(`¿Estás seguro de eliminar "${unit.name}"? Esto también eliminará todas sus unidades hijas.`)) {
      return;
    }

    const result = await deleteUnit(unit.id);
    
    if (result.success) {
      setAlert({ type: 'success', message: 'Unidad eliminada correctamente' });
    } else {
      setAlert({ type: 'error', message: result.error });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'El nombre es requerido' });
      return;
    }

    let result;
    
    if (modalMode === 'create') {
      result = await createUnit(formData);
    } else {
      result = await updateUnit(currentUnit.id, formData);
    }

    if (result.success) {
      setAlert({
        type: 'success',
        message: modalMode === 'create' ? 'Unidad creada correctamente' : 'Unidad actualizada correctamente'
      });
      setShowModal(false);
      setFormData({ name: '', type: 'area', parent_id: null });
    } else {
      setAlert({ type: 'error', message: result.error });
    }
  };

  const tree = buildTree();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estructura Organizacional</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona áreas, procesos, subprocesos y tareas
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-5 w-5 mr-2" />
          Nueva Unidad
        </Button>
      </div>

      {/* Alertas */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Leyenda de colores */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Área
            </span>
            <span className="text-sm text-gray-600">Nivel 0</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              Proceso
            </span>
            <span className="text-sm text-gray-600">Nivel 1</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              Subproceso
            </span>
            <span className="text-sm text-gray-600">Nivel 2</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Tarea
            </span>
            <span className="text-sm text-gray-600">Nivel 3+</span>
          </div>
        </div>
      </Card>

      {/* Árbol */}
      <Card title="Jerarquía" subtitle={`${units.length} unidades en total`}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : tree.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay unidades organizacionales aún.</p>
            <Button onClick={handleCreate} className="mt-4">
              Crear Primera Unidad
            </Button>
          </div>
        ) : (
          <div className="py-4">
            {tree.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Modal de crear/editar */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setFormData({ name: '', type: 'area', parent_id: null });
          }}
          title={modalMode === 'create' ? 'Nueva Unidad Organizacional' : 'Editar Unidad'}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', type: 'area', parent_id: null });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} loading={loading}>
                {modalMode === 'create' ? 'Crear' : 'Guardar'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {parentUnit && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Unidad padre:</strong> {parentUnit.name} ({parentUnit.type})
                </p>
              </div>
            )}

            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Producción, Siembra, etc."
              required
            />

            <Select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                type: e.target.value,
                parent_id: e.target.value === 'area' ? null : formData.parent_id // Resetear si es área
              })}
              options={typeOptions}
              disabled={!!parentUnit}
            />

            {!parentUnit && modalMode === 'create' && formData.type !== 'area' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad Padre {formData.type === 'proceso' ? '(Área)' : formData.type === 'subproceso' ? '(Proceso)' : '(Subproceso)'}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="no-parent"
                      checked={!formData.parent_id}
                      onChange={(e) => setFormData({ ...formData, parent_id: e.target.checked ? null : '' })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="no-parent" className="text-sm text-gray-700">
                      Sin padre (será una unidad raíz)
                    </label>
                  </div>
                  
                  {formData.parent_id !== null && (
                    <HierarchicalSelect
                      units={units.filter(u => {
                        // Filtrar según el tipo que estamos creando
                        if (formData.type === 'proceso') return u.type === 'area';
                        if (formData.type === 'subproceso') return u.type === 'area' || u.type === 'proceso';
                        if (formData.type === 'tarea') return u.type === 'area' || u.type === 'proceso' || u.type === 'subproceso';
                        return false;
                      })}
                      value={formData.parent_id || ''}
                      onChange={(unitId) => setFormData({ ...formData, parent_id: unitId || null })}
                    />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.type === 'proceso' && 'Selecciona el área a la que pertenece este proceso'}
                  {formData.type === 'subproceso' && 'Selecciona el proceso al que pertenece este subproceso'}
                  {formData.type === 'tarea' && 'Selecciona el subproceso al que pertenece esta tarea'}
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Jerarquía sugerida:</strong>
              </p>
              <ul className="mt-2 text-xs text-gray-600 space-y-1">
                <li>• <strong>Área:</strong> División principal (ej: Producción, Empaque)</li>
                <li>• <strong>Proceso:</strong> Proceso dentro de un área (ej: Siembra, Cosecha)</li>
                <li>• <strong>Subproceso:</strong> Subproceso de un proceso (ej: Preparación de Suelo)</li>
                <li>• <strong>Tarea:</strong> Tarea específica (ej: Arado, Fertilización)</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrganizationalUnits;
