import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface NetworkInformation extends EventTarget {
  readonly type?: string;
  readonly effectiveType?: string;
  readonly saveData?: boolean;
}

const getConnection = (): NetworkInformation | undefined => {
  const nav = navigator as Navigator & { connection?: NetworkInformation };
  return nav.connection;
};

/**
 * Decide si las animaciones continuas pueden correr:
 * - respeta prefers-reduced-motion (accesibilidad)
 * - offline → no
 * - datos móviles / conexión lenta / saveData → no
 * - WiFi, Ethernet o API no disponible (iOS Safari) → sí
 */
const evaluate = (): boolean => {
  if (!navigator.onLine) return false;

  const conn = getConnection();
  // Sin Network Information API (iOS Safari, Firefox): asumimos buena conexión.
  if (!conn) return true;
  if (conn.saveData) return false;

  switch (conn.type) {
    case 'wifi':
    case 'ethernet':
      return true;
    case 'cellular':
    case 'none':
      return false;
    default:
      break;
  }

  switch (conn.effectiveType) {
    case '4g':
    case undefined:
      return true;
    default:
      return false;
  }
};

export function useAmbientMotion(): boolean {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(evaluate);

  useEffect(() => {
    const update = () => setEnabled(evaluate());
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const conn = getConnection();
    conn?.addEventListener('change', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      conn?.removeEventListener('change', update);
    };
  }, []);

  return Boolean(enabled) && !reduceMotion;
}
