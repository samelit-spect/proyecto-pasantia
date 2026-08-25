import { useState, useRef } from 'react';
import './SwipeableRow.css';

interface SwipeableRowProps {
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  onSwipeAction?: () => void;
}

export default function SwipeableRow({ children, rightAction, onSwipeAction }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const swiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    swiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - startX.current;
    if (Math.abs(delta) > 10) swiping.current = true;
    if (!rightAction) return;
    const clamped = Math.min(0, Math.max(-100, delta * 0.6));
    setOffset(clamped);
  };

  const handleTouchEnd = () => {
    if (!swiping.current) return;
    if (offset < -50 && onSwipeAction) {
      setOffset(-100);
      onSwipeAction();
    } else {
      setOffset(0);
    }
  };

  return (
    <div className="swipeable-row">
      {rightAction && (
        <div className="swipeable-row__action">{rightAction}</div>
      )}
      <div
        className="swipeable-row__content"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
