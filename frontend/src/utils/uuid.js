/**
 * Generador de UUID v4 con fallback
 * Usa crypto.randomUUID() si está disponible, sino usa Math.random()
 */

export const generateUUID = () => {
  // Intentar usar crypto.randomUUID() (moderno y seguro)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  // Fallback para navegadores antiguos o entornos sin crypto
  // Genera UUID v4 compatible
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default generateUUID;
