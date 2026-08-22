import type { IncidentStatusEvent } from '@/types';
import { incidentStatusLabel } from '@/utils/constants';
import './IncidentHistory.css';

interface IncidentHistoryProps {
  events?: IncidentStatusEvent[];
}

const STATUS_DOT_CLASS: Record<string, string> = {
  pendiente: 'incident-history__dot--pendiente',
  en_analisis: 'incident-history__dot--analisis',
  en_gestion: 'incident-history__dot--gestion',
  resuelto: 'incident-history__dot--resuelto',
};

const formatEventDate = (ts: { toDate: () => Date }) =>
  ts.toDate().toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const IncidentHistory = ({ events }: IncidentHistoryProps) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="incident-history">
      <span className="incident-history__title">Historial de estados</span>
      {events.map((event, index) => (
        <div key={`${event.fecha.seconds}-${index}`} className="incident-history__item">
          <span className={`incident-history__dot ${STATUS_DOT_CLASS[event.estadoNuevo] ?? ''}`} />
          <span className="incident-history__status">{incidentStatusLabel(event.estadoNuevo)}</span>
          <span className="incident-history__meta">
            {!event.estadoAnterior ? 'Creado por' : 'por'} {event.cambiadoPorNombre} ·{' '}
            {formatEventDate(event.fecha)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default IncidentHistory;
