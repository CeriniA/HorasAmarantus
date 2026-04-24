/**
 * Badge de Tipo de Objetivo
 * Muestra el tipo del objetivo (Empresa, Asignado, Personal) con iconos
 */

import { Building2, UserCheck, User } from 'lucide-react';
import { OBJECTIVE_TYPES, OBJECTIVE_TYPE_LABELS } from '../../constants';

export const ObjectiveTypeBadge = ({ type, size = 'md', showIcon = true }) => {
  // Mapeo de iconos y colores por tipo
  const typeConfig = {
    [OBJECTIVE_TYPES.COMPANY]: {
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      label: OBJECTIVE_TYPE_LABELS[OBJECTIVE_TYPES.COMPANY]
    },
    [OBJECTIVE_TYPES.ASSIGNED]: {
      icon: UserCheck,
      color: 'bg-blue-100 text-blue-800',
      label: OBJECTIVE_TYPE_LABELS[OBJECTIVE_TYPES.ASSIGNED]
    },
    [OBJECTIVE_TYPES.PERSONAL]: {
      icon: User,
      color: 'bg-indigo-100 text-indigo-800',
      label: OBJECTIVE_TYPE_LABELS[OBJECTIVE_TYPES.PERSONAL]
    }
  };

  const config = typeConfig[type] || typeConfig[OBJECTIVE_TYPES.COMPANY];
  const Icon = config.icon;

  // Tamaños
  const sizes = {
    sm: {
      badge: 'px-2 py-0.5 text-xs',
      icon: 'h-3 w-3'
    },
    md: {
      badge: 'px-2.5 py-1 text-xs',
      icon: 'h-3.5 w-3.5'
    },
    lg: {
      badge: 'px-3 py-1.5 text-sm',
      icon: 'h-4 w-4'
    }
  };

  const sizeClasses = sizes[size] || sizes.md;

  return (
    <span 
      className={`inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap ${config.color} ${sizeClasses.badge}`}
      title={config.label}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </span>
  );
};

export default ObjectiveTypeBadge;
