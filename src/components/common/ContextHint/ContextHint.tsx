import { useState } from 'react';
import { Info, X } from 'lucide-react';
import './ContextHint.css';

interface ContextHintProps {
  id: string;
  children: React.ReactNode;
}

const getKey = (id: string) => `sipnam-hint-dismissed-${id}`;

const isDismissed = (id: string): boolean => {
  try {
    return localStorage.getItem(getKey(id)) !== null;
  } catch {
    return true;
  }
};

const ContextHint = ({ id, children }: ContextHintProps) => {
  const [visible, setVisible] = useState(() => !isDismissed(id));

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(getKey(id), Date.now().toString());
    } catch {
      // noop
    }
  };

  if (!visible) return null;

  return (
    <div className="context-hint" role="note">
      <Info size={15} strokeWidth={1.5} className="context-hint__icon" />
      <p className="context-hint__text">{children}</p>
      <button className="context-hint__close" onClick={dismiss} aria-label="No volver a mostrar">
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default ContextHint;
