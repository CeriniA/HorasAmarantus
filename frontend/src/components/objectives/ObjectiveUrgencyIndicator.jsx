/**
 * Indicador de Urgencia de Objetivo
 * Muestra días restantes con código de colores
 */

import { Calendar, AlertTriangle } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { OBJECTIVE_VALIDATION } from '../../constants/validation';

export const ObjectiveUrgencyIndicator = ({ endDate, size = 'md' }) => {
  const today = new Date();
  const end = new Date(endDate);
  const daysRemaining = differenceInDays(end, today);

  // Determinar urgencia y color
  const getUrgencyConfig = () => {
    if (daysRemaining < 0) {
      return {
        color: 'text-red-600 bg-red-50',
        icon: AlertTriangle,
        label: 'Vencido',
        value: `${Math.abs(daysRemaining)}d`,
        urgent: true
      };
    }
    
    if (daysRemaining === 0) {
      return {
        color: 'text-red-600 bg-red-50',
        icon: AlertTriangle,
        label: 'Hoy',
        value: 'Hoy',
        urgent: true
      };
    }
    
    if (daysRemaining <= OBJECTIVE_VALIDATION.URGENCY_CRITICAL) {
      return {
        color: 'text-red-600 bg-red-50',
        icon: AlertTriangle,
        label: `${daysRemaining} día${daysRemaining > 1 ? 's' : ''}`,
        value: `${daysRemaining}d`,
        urgent: true
      };
    }
    
    if (daysRemaining <= OBJECTIVE_VALIDATION.URGENCY_HIGH) {
      return {
        color: 'text-orange-600 bg-orange-50',
        icon: Calendar,
        label: `${daysRemaining} días`,
        value: `${daysRemaining}d`,
        urgent: false
      };
    }
    
    if (daysRemaining <= OBJECTIVE_VALIDATION.URGENCY_MEDIUM) {
      return {
        color: 'text-yellow-600 bg-yellow-50',
        icon: Calendar,
        label: `${daysRemaining} días`,
        value: `${daysRemaining}d`,
        urgent: false
      };
    }
    
    return {
      color: 'text-gray-600 bg-gray-50',
      icon: Calendar,
      label: `${daysRemaining} días`,
      value: `${daysRemaining}d`,
      urgent: false
    };
  };

  const config = getUrgencyConfig();
  const Icon = config.icon;

  // Tamaños
  const sizes = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3'
    },
    md: {
      container: 'px-2.5 py-1 text-xs',
      icon: 'h-3.5 w-3.5'
    },
    lg: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'h-4 w-4'
    }
  };

  const sizeClasses = sizes[size] || sizes.md;

  return (
    <span 
      className={`inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap ${config.color} ${sizeClasses.container}`}
      title={`${daysRemaining < 0 ? 'Vencido hace' : 'Quedan'} ${config.label}`}
    >
      <Icon className={sizeClasses.icon} />
      <span>{config.urgent && daysRemaining < 0 ? '⚠️ ' : ''}{config.value}</span>
    </span>
  );
};

export default ObjectiveUrgencyIndicator;
