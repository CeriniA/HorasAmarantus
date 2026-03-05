import { useState } from 'react';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { authService } from '../services/api';

export const Settings = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Aquí deberías llamar a tu API para cambiar la contraseña
      // await authService.changePassword(passwordData);
      
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al cambiar la contraseña' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra tu perfil y preferencias
        </p>
      </div>

      {/* Información del Perfil */}
      <Card title="Información del Perfil" icon={User}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {user?.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {user?.username}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {user?.email || <span className="text-gray-400 italic">No configurado</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                  user?.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <Shield className="inline h-4 w-4 mr-1" />
              Para modificar tu información de perfil, contacta a un administrador.
            </p>
          </div>
        </div>
      </Card>

      {/* Cambiar Contraseña */}
      <Card title="Cambiar Contraseña" icon={Lock}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {message.text && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <Input
            label="Contraseña Actual"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            required
            placeholder="Ingresa tu contraseña actual"
          />

          <Input
            label="Nueva Contraseña"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            required
            placeholder="Mínimo 8 caracteres"
            helperText="Debe tener al menos 8 caracteres"
          />

          <Input
            label="Confirmar Nueva Contraseña"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            required
            placeholder="Repite la nueva contraseña"
          />

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>

      {/* Notificaciones (Futuro) */}
      <Card title="Notificaciones" icon={Bell}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificaciones de Sincronización</p>
              <p className="text-sm text-gray-500">Recibe alertas cuando tus datos se sincronicen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" disabled />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Alertas de Errores</p>
              <p className="text-sm text-gray-500">Notificaciones cuando ocurra un error</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" disabled />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <Bell className="inline h-4 w-4 mr-1" />
              Las notificaciones push estarán disponibles próximamente.
            </p>
          </div>
        </div>
      </Card>

      {/* Información de la Aplicación */}
      <Card title="Información de la Aplicación">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Versión:</span>
            <span className="font-medium text-gray-900">{import.meta.env.VITE_APP_VERSION || '1.0.0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Nombre:</span>
            <span className="font-medium text-gray-900">{import.meta.env.VITE_APP_NAME || 'Sistema Horas'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Modo:</span>
            <span className="font-medium text-gray-900">
              {import.meta.env.DEV ? 'Desarrollo' : 'Producción'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
