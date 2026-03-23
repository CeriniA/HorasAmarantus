import { useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * Panel de entrada rápida de tiempo
 * Permite seleccionar tiempo con botones rápidos o entrada manual
 */
export const TimeInputPanel = ({ onTimeSelect, selectedTime = null }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Botones de tiempo rápido (en horas decimales)
  const quickTimes = [
    { label: '15min', value: 0.25 },
    { label: '30min', value: 0.5 },
    { label: '1h', value: 1 },
    { label: '2h', value: 2 },
    { label: '4h', value: 4 },
    { label: '8h', value: 8 }
  ];

  const handleQuickTime = (value) => {
    const h = Math.floor(value);
    const m = Math.round((value - h) * 60);
    setHours(h);
    setMinutes(m);
    onTimeSelect(value);
  };

  const handleManualTime = () => {
    const totalHours = hours + (minutes / 60);
    onTimeSelect(totalHours);
  };

  const totalHours = hours + (minutes / 60);

  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-lg border border-primary-200">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Tiempo Invertido</h3>
      </div>

      {/* Botones rápidos */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Atajos rápidos:</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickTimes.map((time) => (
            <button
              key={time.value}
              onClick={() => handleQuickTime(time.value)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${selectedTime === time.value
                  ? 'bg-primary-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-primary-100 hover:text-primary-700 border border-gray-200'
                }
              `}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entrada manual */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-3">O ingresa manualmente:</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Horas
            </label>
            <input
              type="number"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => {
                const val = Math.max(0, Math.min(24, parseInt(e.target.value) || 0));
                setHours(val);
              }}
              onBlur={handleManualTime}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Minutos
            </label>
            <input
              type="number"
              min="0"
              max="59"
              step="15"
              value={minutes}
              onChange={(e) => {
                const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                setMinutes(val);
              }}
              onBlur={handleManualTime}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Total
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-primary-600">
              {totalHours.toFixed(2)}h
            </div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {selectedTime !== null && selectedTime > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">
            ✓ Tiempo seleccionado: <span className="text-lg font-bold">{selectedTime.toFixed(2)}</span> horas
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeInputPanel;
