/* eslint-disable no-undef */
/**
 * Componente de importación masiva de unidades organizacionales desde CSV
 * Permite cargar múltiples unidades de una vez con estructura jerárquica
 */

import { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { orgUnitsService } from '../../services/api';

export const BulkOrgUnitImport = ({ isOpen, onClose, onSuccess, existingUnits = [] }) => {
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  // Template CSV para descargar (con unidades existentes)
  const downloadTemplate = () => {
    let csvContent = 'nombre,tipo,unidad_padre\n';
    
    if (existingUnits.length > 0) {
      // Agregar unidades existentes
      existingUnits.forEach(unit => {
        const parentName = unit.parent_id 
          ? existingUnits.find(u => u.id === unit.parent_id)?.name || ''
          : '';
        csvContent += `${unit.name},${unit.type},${parentName}\n`;
      });
    } else {
      // Si no hay unidades, mostrar ejemplos
      csvContent += `Producción,area,\n`;
      csvContent += `Línea 1,proceso,Producción\n`;
      csvContent += `Línea 2,proceso,Producción\n`;
      csvContent += `Administración,area,\n`;
      csvContent += `Recursos Humanos,proceso,Administración`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = existingUnits.length > 0 ? 'unidades_existentes.csv' : 'plantilla_unidades.csv';
    link.click();
  };

  // Parsear CSV
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      setErrors(['El archivo está vacío o no tiene datos']);
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const units = [];
    const validationErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const unit = {};
      
      headers.forEach((header, index) => {
        unit[header] = values[index] || '';
      });

      // Validaciones
      const rowErrors = [];
      if (!unit.nombre) rowErrors.push('Nombre requerido');
      if (!unit.tipo) rowErrors.push('Tipo requerido');
      
      if (rowErrors.length > 0) {
        validationErrors.push(`Fila ${i + 1}: ${rowErrors.join(', ')}`);
      } else {
        units.push({
          name: unit.nombre,
          type: unit.tipo,
          parent_name: unit.unidad_padre || null // Temporal, se resolverá al importar
        });
      }
    }

    setErrors(validationErrors);
    return units;
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(['Solo se permiten archivos CSV']);
      return;
    }

    setErrors([]);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const units = parseCSV(text);
      setPreview(units);
    };
    reader.readAsText(selectedFile);
  };

  // Importar unidades
  const handleImport = async () => {
    setImporting(true);

    try {
      const result = await orgUnitsService.createBulk(preview);
      
      const importResults = {
        success: preview.filter(p => !result.errors.some(e => e.name === p.name)).map(p => p.name),
        errors: result.errors || []
      };

      setResults(importResults);
      
      if (importResults.success.length > 0) {
        onSuccess?.();
      }
    } catch (error) {
      setResults({
        success: [],
        errors: [{ name: 'Error General', error: error.message || 'Error desconocido' }]
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setPreview([]);
    setErrors([]);
    setResults(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importación Masiva de Unidades Organizacionales"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {preview.length > 0 && !results && (
            <Button onClick={handleImport} loading={importing}>
              <Upload className="h-4 w-4 mr-2" />
              Importar {preview.length} {preview.length === 1 ? 'Unidad' : 'Unidades'}
            </Button>
          )}
          {results && (
            <Button onClick={handleClose}>
              Cerrar
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Instrucciones</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Descarga la plantilla CSV</li>
            <li>Completa los datos de las unidades organizacionales</li>
            <li>Para unidades padre, deja el campo &quot;unidad_padre&quot; vacío</li>
            <li>Para unidades hijas, indica el nombre exacto de la unidad padre</li>
            <li>Sube el archivo y revisa la vista previa</li>
            <li>Click en &quot;Importar&quot; para crear las unidades</li>
          </ol>
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla CSV
            </Button>
          </div>
        </div>

        {/* Selector de archivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar archivo CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              cursor-pointer"
          />
        </div>

        {/* Errores de validación */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-2">
                  Errores de validación
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Vista previa */}
        {preview.length > 0 && !results && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Vista Previa ({preview.length} unidades)
            </h4>
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nombre</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unidad Padre</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((unit, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm text-gray-900">{unit.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{unit.type}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{unit.parent_name || 'Raíz'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resultados */}
        {results && (
          <div className="space-y-4">
            {results.success.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">
                      ✅ {results.success.length} unidades creadas exitosamente
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {results.success.map((name, index) => (
                        <li key={index}>• {name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">
                      ❌ {results.errors.length} errores
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index}>• {error.name}: {error.error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkOrgUnitImport;
