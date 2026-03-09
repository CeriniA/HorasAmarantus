import { useState } from 'react';
import { User, Lock, Bell, Save, Mail, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { authService } from '../services/api';

export const Settings = () => {
  const { user, setUser } = useAuthContext();
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });
  
  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para email
  const [emailData, setEmailData] = useState({
    email: user?.email || ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    try {
      setLoadingPassword(true);
      setPasswordMessage({ type: '', text: '' });

      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al cambiar la contraseña' 
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoadingEmail(true);
      setEmailMessage({ type: '', text: '' });

      const response = await authService.updateEmail(emailData.email);
      
      // Actualizar usuario en el contexto
      if (response.user) {
        setUser(response.user);
      }
      
      setEmailMessage({ type: 'success', text: 'Email actualizado correctamente' });
    } catch (error) {
      setEmailMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al actualizar el email' 
      });
    } finally {
      setLoadingEmail(false);
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
                @{user?.username}
              </div>
            </div>

            <div className="md:col-span-2">
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
            <p className="text-sm text-gray-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Para modificar tu nombre o rol, contacta a un administrador.
            </p>
          </div>
        </div>
      </Card>

      {/* Actualizar Email */}
      <Card title="Email" icon={Mail}>
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          {emailMessage.text && (
            <div className={`p-4 rounded-md ${
              emailMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {emailMessage.text}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={emailData.email}
            onChange={(e) => setEmailData({ email: e.target.value })}
            placeholder="tu@email.com"
            helperText="Puedes dejarlo vacío si no tienes email"
          />

          <div className="flex justify-end">
            <Button type="submit" loading={loadingEmail}>
              <Save className="h-4 w-4 mr-2" />
              Actualizar Email
            </Button>
          </div>
        </form>
      </Card>

      {/* Cambiar Contraseña */}
      <Card title="Cambiar Contraseña" icon={Lock}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordMessage.text && (
            <div className={`p-4 rounded-md ${
              passwordMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {passwordMessage.text}
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
            <Button type="submit" loading={loadingPassword}>
              <Save className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>
          </div>
        </form>
      </Card>

      {/* Preferencias */}
      <Card title="Preferencias" icon={Bell}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Las preferencias de notificaciones y otras configuraciones estarán disponibles próximamente.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <Bell className="inline h-4 w-4 mr-1" />
              Próximamente podrás configurar notificaciones por email y otras preferencias.
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
