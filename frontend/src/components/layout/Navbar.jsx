import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { USER_ROLES, getRoleLabel } from '../../constants';
import { useOffline } from '../../hooks/useOffline';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuthContext();
  const { isOnline, isSyncing, pendingChanges, manualSync } = useOffline();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleManualSync = async () => {
    await manualSync();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Sistema Horas
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/time-entries"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Registrar Horas
              </Link>
              {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) && (
                <>
                  <Link
                    to="/organizational-units"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Estructura
                  </Link>
                  <Link
                    to="/reports"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Reportes
                  </Link>
                  <Link
                    to="/admin/users"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Usuarios
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Estado de conexión y usuario */}
          <div className="flex items-center space-x-4">
            {/* Indicador de conexión */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-5 w-5" />
                  <span className="ml-1 text-sm hidden md:inline">Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-5 w-5" />
                  <span className="ml-1 text-sm hidden md:inline">Offline</span>
                </div>
              )}

              {/* Botón de sincronización */}
              {pendingChanges > 0 && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing || !isOnline}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  title={`${pendingChanges} cambios pendientes`}
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="ml-1 hidden md:inline">{pendingChanges}</span>
                </button>
              )}
            </div>

            {/* Menú de usuario */}
            <div className="hidden sm:flex sm:items-center">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium">{user?.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500">
                        @{user?.username}
                      </div>
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">
                        Rol: <span className="font-medium">{getRoleLabel(user?.role)}</span>
                      </div>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="inline h-4 w-4 mr-2" />
                        Configuración
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de menú móvil */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/time-entries"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Registrar Horas
            </Link>
            {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) && (
              <>
                <Link
                  to="/organizational-units"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Estructura
                </Link>
                <Link
                  to="/reports"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reportes
                </Link>
              </>
            )}
            {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) && (
              <Link
                to="/admin/users"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Usuarios
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">@{user?.username}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/settings"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Configuración
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
