import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useRoleValidation } from '../hooks/useRoleValidation';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading: authLoading } = useAuthContext();
  const { hasRole, loading: rolesLoading } = useRoleValidation();

  const loading = authLoading || rolesLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Validar roles usando el hook (soporta roles sistema + DB)
  if (allowedRoles.length > 0 && !hasRole(user, ...allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
