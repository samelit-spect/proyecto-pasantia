import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import {
  daysUntilYearEndPurge,
  getYearEndPurgeDate,
  shouldShowRetentionWarning,
} from '@/utils/constants';
import './RetentionBanner.css';

const DISMISS_STORAGE_KEY = 'sipnam-retention-dismissed';

const todayStamp = () => new Date().toISOString().split('T')[0];

const daysLabel = (days: number) => {
  if (days === 0) return 'El borrado está programado para hoy.';
  if (days === 1) return 'Falta 1 día.';
  return `Faltan ${days} días.`;
};

const RetentionBanner = () => {
  const [dismissedToday, setDismissedToday] = useState(
    () => localStorage.getItem(DISMISS_STORAGE_KEY) === todayStamp()
  );
  const reduceMotion = useReducedMotion();

  const visible = shouldShowRetentionWarning() && !dismissedToday;

  const purgeDate = getYearEndPurgeDate().toLocaleDateString('es-AR');
  const days = daysUntilYearEndPurge();

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, todayStamp());
    setDismissedToday(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          className="retention-banner-wrapper"
          style={{ overflow: 'hidden' }}
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: 'auto', opacity: 1, marginBottom: '1.5rem' }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
        >
          <div className="retention-banner" role="alert">
            <div className="retention-banner__icon">
              <AlertTriangle size={20} strokeWidth={1.5} />
            </div>
            <div className="retention-banner__content">
              <p className="retention-banner__title">Borrado anual de datos programado</p>
              <p className="retention-banner__text">
                El {purgeDate} se vaciarán los registros del sistema para liberar la base de datos.{' '}
                {daysLabel(days)} Revisá la información y exportá un respaldo antes de esa fecha.
              </p>
            </div>
            <Link viewTransition to="/supervisor" className="retention-banner__action">
              Exportar respaldo
            </Link>
            <button
              className="retention-banner__close"
              onClick={handleDismiss}
              aria-label="Cerrar aviso por hoy"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default RetentionBanner;
