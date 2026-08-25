import { useCallback } from 'react';

const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export function useHaptic() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (!isSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // noop
    }
  }, []);

  const success = useCallback(() => vibrate([10, 30, 10]), [vibrate]);
  const error = useCallback(() => vibrate([50, 40, 50]), [vibrate]);
  const light = useCallback(() => vibrate(8), [vibrate]);

  return { vibrate, success, error, light };
}
