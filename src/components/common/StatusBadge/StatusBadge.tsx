import type { IncidentStatus } from '@/types';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: IncidentStatus;
}

const STATUS_CONFIG: Record<IncidentStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'status-badge--pendiente' },
  en_analisis: { label: 'En análisis', className: 'status-badge--analisis' },
  en_gestion: { label: 'En gestión', className: 'status-badge--gestion' },
  resuelto: { label: 'Resuelto', className: 'status-badge--resuelto' },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
};

export default StatusBadge;
