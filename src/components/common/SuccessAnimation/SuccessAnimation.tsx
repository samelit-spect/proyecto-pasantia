import { useEffect, useState } from 'react';
import './SuccessAnimation.css';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  durationMs?: number;
}

export default function SuccessAnimation({ show, onComplete, durationMs = 1800 }: SuccessAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, durationMs);
    return () => clearTimeout(t);
  }, [show, durationMs, onComplete]);

  if (!visible) return null;

  return (
    <div className="success-anim" role="status" aria-live="polite">
      <div className="success-anim__burst">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`success-anim__particle success-anim__particle--${i}`} />
        ))}
      </div>
      <svg className="success-anim__check" viewBox="0 0 52 52" width="52" height="52">
        <circle className="success-anim__circle" cx="26" cy="26" r="25" fill="none" />
        <path className="success-anim__path" d="M14 27l7 7 16-16" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
