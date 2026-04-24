/**
 * Badge de Estado de Objetivo
 * Muestra el estado del objetivo con colores y iconos apropiados
 */

import { CheckCircle, Clock, AlertCircle, XCircle, Ban } from 'lucide-react';
import { OBJECTIVE_STATUS, OBJECTIVE_STATUS_LABELS, OBJECTIVE_STATUS_COLORS } from '../../constants';

export const ObjectiveStatusBadge = ({ status, size = 'md', showIcon = true }) => {
  // Mapeo de iconos por estado
  const statusIcons = {
    [OBJECTIVE_STATUS.PLANNED]: Clock,
    [OBJECTIVE_STATUS.IN_PROGRESS]: Clock,
    [OBJECTIVE_STATUS.COMPLETED]: CheckCircle,
    [OBJECTIVE_STATUS.OVERDUE]: AlertCircle,
    [OBJECTIVE_STATUS.FAILED]: XCircle,
    [OBJECTIVE_STATUS.CANCELLED]: Ban
  };

  const Icon = statusIcons[status] || Clock;
  const label = OBJECTIVE_STATUS_LABELS[status] || status;
  const colorClass = OBJECTIVE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

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
      className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap ${colorClass} ${sizeClasses.badge}`}
      title={label}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{label}</span>
    </span>
  );
};

export default ObjectiveStatusBadge;
