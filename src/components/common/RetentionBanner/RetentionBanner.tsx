import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  if (!shouldShowRetentionWarning() || dismissedToday) return null;

  const purgeDate = getYearEndPurgeDate().toLocaleDateString('es-AR');
  const days = daysUntilYearEndPurge();

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, todayStamp());
    setDismissedToday(true);
  };

  return (
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
      <Link to="/supervisor" className="retention-banner__action">
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
  );
};

export default RetentionBanner;
