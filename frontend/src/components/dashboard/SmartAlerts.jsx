/**
 * Alertas Inteligentes
 * Sistema de notificaciones contextuales basadas en patrones de uso
 * Con sistema de snooze y persistencia
 */

import { AlertCircle, CheckCircle, Info, AlertTriangle, X, Clock } from 'lucide-react';
import logger from '../../utils/logger';
import { useState, useEffect } from 'react';
import Button from '../common/Button';

const STORAGE_KEY = 'dismissed_alerts';

// Cargar alertas descartadas del localStorage
const loadDismissedAlerts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const dismissed = JSON.parse(stored);
    const now = Date.now();
    
    // Filtrar alertas cuyo snooze ya expiró
    const active = {};
    Object.entries(dismissed).forEach(([id, data]) => {
      if (data.until > now) {
        active[id] = data;
      }
    });
    
    return active;
  } catch (error) {
    logger.error('Error loading dismissed alerts:', error);
    return {};
  }
};

// Guardar alertas descartadas en localStorage
const saveDismissedAlerts = (dismissed) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  } catch (error) {
    logger.error('Error saving dismissed alerts:', error);
  }
};

export const SmartAlerts = ({ alerts, onDismiss }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(loadDismissedAlerts());

  useEffect(() => {
    saveDismissedAlerts(dismissedAlerts);
  }, [dismissedAlerts]);

  if (!alerts || alerts.length === 0) return null;

  const now = Date.now();
  const visibleAlerts = alerts.filter(alert => {
    const dismissed = dismissedAlerts[alert.id];
    return !dismissed || dismissed.until <= now;
  });

  if (visibleAlerts.length === 0) return null;

  const handleDismiss = (alertId, duration = 'forever') => {
    const durations = {
      'today': 24 * 60 * 60 * 1000,        // 1 día
      'week': 7 * 24 * 60 * 60 * 1000,     // 1 semana
      'month': 30 * 24 * 60 * 60 * 1000,   // 30 días
      'forever': 365 * 24 * 60 * 60 * 1000 // 1 año
    };

    setDismissedAlerts(prev => ({
      ...prev,
      [alertId]: {
        until: now + durations[duration],
        dismissedAt: now
      }
    }));

    if (onDismiss) {
      onDismiss(alertId);
    }
  };

  const getAlertStyles = (type) => {
    const styles = {
      success: {
        container: 'bg-green-50 border-green-500',
        icon: 'text-green-500',
        title: 'text-green-900',
        message: 'text-green-800',
        IconComponent: CheckCircle
      },
      warning: {
        container: 'bg-yellow-50 border-yellow-500',
        icon: 'text-yellow-500',
        title: 'text-yellow-900',
        message: 'text-yellow-800',
        IconComponent: AlertTriangle
      },
      danger: {
        container: 'bg-red-50 border-red-500',
        icon: 'text-red-500',
        title: 'text-red-900',
        message: 'text-red-800',
        IconComponent: AlertCircle
      },
      info: {
        container: 'bg-blue-50 border-blue-500',
        icon: 'text-blue-500',
        title: 'text-blue-900',
        message: 'text-blue-800',
        IconComponent: Info
      }
    };

    return styles[type] || styles.info;
  };

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        const IconComponent = styles.IconComponent;

        return (
          <div
            key={alert.id}
            className={`
              p-4 rounded-lg border-l-4 
              ${styles.container}
              transition-all duration-300 ease-in-out
              animate-slideIn
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <div className="flex-shrink-0">
                  <IconComponent className={`h-5 w-5 ${styles.icon}`} />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className={`font-semibold ${styles.title}`}>
                    {alert.title}
                  </h4>
                  <p className={`text-sm mt-1 ${styles.message}`}>
                    {alert.message}
                  </p>
                  
                  {/* Datos adicionales */}
                  {alert.data && (
                    <div className="mt-2 text-xs opacity-75">
                      {Object.entries(alert.data).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <strong>{key}:</strong> {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Acción */}
                  {alert.action && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (alert.action.onClick) {
                            alert.action.onClick();
                          } else if (alert.action.route) {
                            window.location.href = alert.action.route;
                          }
                        }}
                      >
                        {alert.action.label}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex-shrink-0 ml-4 flex gap-2">
                {/* Dropdown de snooze */}
                <div className="relative group">
                  <button
                    className="
                      p-1 hover:bg-black hover:bg-opacity-10 
                      rounded transition-colors duration-200
                      focus:outline-none
                    "
                    aria-label="Posponer alerta"
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                  
                  {/* Menú dropdown */}
                  <div className="
                    absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-10
                  ">
                    <div className="py-1">
                      <button
                        onClick={() => handleDismiss(alert.id, 'today')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        Ocultar por hoy
                      </button>
                      <button
                        onClick={() => handleDismiss(alert.id, 'week')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        Ocultar por 1 semana
                      </button>
                      <button
                        onClick={() => handleDismiss(alert.id, 'month')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        Ocultar por 1 mes
                      </button>
                      <button
                        onClick={() => handleDismiss(alert.id, 'forever')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors border-t border-gray-200"
                      >
                        No mostrar más
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botón cerrar rápido */}
                <button
                  onClick={() => handleDismiss(alert.id, 'today')}
                  className="
                    p-1 hover:bg-black hover:bg-opacity-10 
                    rounded transition-colors duration-200
                    focus:outline-none
                  "
                  aria-label="Cerrar alerta"
                  title="Ocultar por hoy"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SmartAlerts;
