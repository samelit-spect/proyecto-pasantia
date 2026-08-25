import { useState, useRef, useCallback, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import './PullToRefresh.css';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
}

const THRESHOLD = 80;
const MAX_PULL = 120;

const PullToRefresh = ({ onRefresh, children, disabled = false }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || disabled || isRefreshing) return;
      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > 0) {
        e.preventDefault();
        setPullDistance(Math.min(deltaY * 0.5, MAX_PULL));
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current || disabled || isRefreshing) return;
    isDragging.current = false;

    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD * 0.5);
      try {
        await onRefresh();
      } catch {
        // noop
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, disabled, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      className="pull-to-refresh"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`pull-to-refresh__indicator ${showIndicator ? 'pull-to-refresh__indicator--visible' : ''}`}
        style={{
          height: isRefreshing ? 48 : pullDistance * 0.6,
          opacity: isRefreshing ? 1 : progress,
        }}
      >
        <RefreshCw
          size={20}
          strokeWidth={2}
          className={`pull-to-refresh__icon ${isRefreshing ? 'pull-to-refresh__icon--spinning' : ''}`}
          style={{ transform: `rotate(${progress * 180}deg)` }}
        />
        {!isRefreshing && pullDistance >= THRESHOLD && (
          <span className="pull-to-refresh__text">Soltá para actualizar</span>
        )}
        {isRefreshing && <span className="pull-to-refresh__text">Actualizando...</span>}
      </div>
      <div
        className="pull-to-refresh__content"
        style={{ transform: `translateY(${isRefreshing ? 48 : pullDistance * 0.6}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
