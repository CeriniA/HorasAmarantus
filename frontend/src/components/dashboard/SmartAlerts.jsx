/**
 * Alertas Inteligentes
 * Sistema de notificaciones contextuales basadas en patrones de uso
 */

import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';

export const SmartAlerts = ({ alerts, onDismiss }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  if (!alerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) return null;

  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
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

              {/* Botón cerrar */}
              <button
                onClick={() => handleDismiss(alert.id)}
                className="
                  flex-shrink-0 ml-4 p-1 
                  hover:bg-black hover:bg-opacity-10 
                  rounded transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                "
                aria-label="Cerrar alerta"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SmartAlerts;
