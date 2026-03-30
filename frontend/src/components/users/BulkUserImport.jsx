/* eslint-disable no-undef */
/**
 * Componente de importación masiva de usuarios desde CSV
 * Permite cargar múltiples usuarios de una vez para setup inicial
 */

import { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { usersService } from '../../services/api';

export const BulkUserImport = ({ isOpen, onClose, onSuccess, existingUsers = [] }) => {
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  // Template CSV para descargar (con usuarios existentes)
  const downloadTemplate = () => {
    let csvContent = 'nombre,email,username,rol,password\n';
    
    if (existingUsers.length > 0) {
      // Agregar usuarios existentes (sin password por seguridad)
      existingUsers.forEach(user => {
        const email = user.email || '';
        const role = user.role || 'operario';
        csvContent += `${user.name},${email},${user.username},${role},\n`;
      });
    } else {
      // Si no hay usuarios, mostrar ejemplos
      csvContent += `Juan Pérez,,jperez,operario,12345678\n`;
      csvContent += `María García,maria@empresa.com,mgarcia,admin,admin123\n`;
      csvContent += `Pedro López,,plopez,operario,12345678`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = existingUsers.length > 0 ? 'usuarios_existentes.csv' : 'plantilla_usuarios.csv';
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
    const requiredHeaders = ['nombre', 'email', 'username', 'rol'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      setErrors([`Faltan columnas requeridas: ${missingHeaders.join(', ')}`]);
      return [];
    }

    const users = [];
    const validationErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const user = {};
      
      headers.forEach((header, index) => {
        user[header] = values[index] || '';
      });

      // Validaciones
      const rowErrors = [];
      if (!user.nombre) rowErrors.push('Nombre requerido');
      // Email es opcional, pero si se proporciona debe ser válido
      if (user.email && !user.email.includes('@')) rowErrors.push('Email inválido');
      if (!user.username) rowErrors.push('Username requerido');
      if (!['operario', 'admin', 'superadmin'].includes(user.rol?.toLowerCase())) {
        rowErrors.push('Rol debe ser: operario, admin o superadmin');
      }

      if (rowErrors.length > 0) {
        validationErrors.push(`Fila ${i + 1}: ${rowErrors.join(', ')}`);
      } else {
        users.push({
          name: user.nombre,
          email: user.email || null, // null si está vacío
          username: user.username,
          role: user.rol.toLowerCase(),
          password: user.password || '12345678', // Password por defecto
          organizational_unit_id: null // Se asigna después manualmente
        });
      }
    }

    setErrors(validationErrors);
    return users;
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
      const users = parseCSV(text);
      setPreview(users);
    };
    reader.readAsText(selectedFile);
  };

  // Importar usuarios
  const handleImport = async () => {
    if (preview.length === 0) return;

    setImporting(true);
    const importResults = {
      success: [],
      errors: []
    };

    for (const user of preview) {
      try {
        await usersService.create(user);
        importResults.success.push(user.username);
      } catch (error) {
        importResults.errors.push({
          username: user.username,
          error: error.message || 'Error desconocido'
        });
      }
    }

    setResults(importResults);
    setImporting(false);

    if (importResults.success.length > 0) {
      onSuccess?.();
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
      title="📥 Importación Masiva de Usuarios"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {preview.length > 0 && !results && (
            <Button onClick={handleImport} loading={importing}>
              <Upload className="h-4 w-4 mr-2" />
              Importar {preview.length} {preview.length === 1 ? 'Usuario' : 'Usuarios'}
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
            <li>Completa los datos de los usuarios</li>
            <li>Sube el archivo y revisa la vista previa</li>
            <li>Click en &quot;Importar&quot; para crear los usuarios</li>
            <li>Asigna las unidades organizacionales después desde la tabla</li>
          </ol>
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla CSV
            </Button>
          </div>
        </div>

        {/* Selector de archivo */}
        {!results && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                cursor-pointer"
            />
          </div>
        )}

        {/* Errores de validación */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-2">
                  Errores de validación
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
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
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Vista Previa ({preview.length} usuarios)
            </h3>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Username
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {preview.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{user.name}</td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">{user.username}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Password por defecto: DNI del usuario (o "12345678" si no tiene DNI)
            </p>
          </div>
        )}

        {/* Resultados */}
        {results && (
          <div className="space-y-4">
            {/* Éxitos */}
            {results.success.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">
                      ✅ {results.success.length} usuarios creados exitosamente
                    </h4>
                    <div className="text-sm text-green-800">
                      {results.success.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Errores */}
            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">
                      ❌ {results.errors.length} usuarios con errores
                    </h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      {results.errors.map((err, index) => (
                        <li key={index}>
                          <strong>{err.username}:</strong> {err.error}
                        </li>
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

export default BulkUserImport;
