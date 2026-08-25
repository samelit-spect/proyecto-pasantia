import { useRef, useCallback } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }: UseSwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const dx = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    dx.current = 0;
    swiping.current = false;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX.current;
      const deltaY = e.touches[0].clientY - startY.current;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        swiping.current = true;
        dx.current = deltaX;
      }
    },
    []
  );

  const onTouchEnd = useCallback(() => {
    if (!swiping.current) return;
    if (dx.current < -threshold) onSwipeLeft?.();
    if (dx.current > threshold) onSwipeRight?.();
    dx.current = 0;
    swiping.current = false;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
