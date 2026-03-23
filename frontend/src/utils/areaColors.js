/**
 * Sistema de colores para áreas
 * Cada área tiene un color único para fácil identificación visual
 */

const AREA_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-100' },
  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', badge: 'bg-green-100' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-100' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-100' },
  { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900', badge: 'bg-pink-100' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', badge: 'bg-indigo-100' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900', badge: 'bg-teal-100' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', badge: 'bg-cyan-100' },
];

// Mapa de colores por área (se genera dinámicamente)
const areaColorMap = new Map();

/**
 * Obtener color para un área específica
 * @param {string} areaName - Nombre del área
 * @returns {object} Objeto con clases de Tailwind para colores
 */
export const getAreaColor = (areaName) => {
  if (!areaColorMap.has(areaName)) {
    const colorIndex = areaColorMap.size % AREA_COLORS.length;
    areaColorMap.set(areaName, AREA_COLORS[colorIndex]);
  }
  return areaColorMap.get(areaName);
};

/**
 * Resetear el mapa de colores (útil para testing)
 */
export const resetAreaColors = () => {
  areaColorMap.clear();
};

export default { getAreaColor, resetAreaColors };
