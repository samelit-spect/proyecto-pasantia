import { useEffect, useRef } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="confirm-dialog__overlay"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
          <m.div
            className="confirm-dialog"
            ref={dialogRef}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'translateY(8px) scale(0.98)' }
            }
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: 'none' }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'translateY(6px) scale(0.98)' }
            }
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          >
            <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}>
              <AlertTriangle size={24} strokeWidth={1.5} />
            </div>
            <h3 className="confirm-dialog__title">{title}</h3>
            <p className="confirm-dialog__message">{message}</p>
            <div className="confirm-dialog__actions">
              <button
                ref={cancelRef}
                className="confirm-dialog__btn confirm-dialog__btn--cancel"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                className={`confirm-dialog__btn confirm-dialog__btn--${variant}`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
