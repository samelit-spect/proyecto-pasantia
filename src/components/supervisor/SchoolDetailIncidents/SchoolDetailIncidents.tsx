import { memo } from 'react';
import type { Incident, IncidentStatus } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import FotoThumb from '@/components/common/FotoThumb/FotoThumb';
import IncidentHistory from '@/components/common/IncidentHistory/IncidentHistory';
import {
  incidentCategoriaLabel,
  incidentUrgenciaLabel,
  incidentStatusLabel,
  canTransitionIncidentStatus,
  INCIDENT_STATUS_ORDER,
} from '@/utils/constants';
import AccordionSection from '../AccordionSection/AccordionSection';

interface SchoolDetailIncidentsProps {
  incidents: Incident[];
  expandedSection: string;
  onToggle: () => void;
  onStatusChange: (id: string, status: IncidentStatus) => Promise<void> | void;
  statusUpdatingId: string | null;
  onLightbox: (url: string) => void;
  onExport?: () => void;
  exporting?: boolean;
}

const schoolDetailIncidents = ({
  incidents,
  expandedSection,
  onToggle,
  onStatusChange,
  statusUpdatingId,
  onLightbox,
  onExport,
  exporting,
}: SchoolDetailIncidentsProps) => {
  const reachableStatuses = (current: IncidentStatus): IncidentStatus[] =>
    INCIDENT_STATUS_ORDER.filter(
      (status) => status !== current && canTransitionIncidentStatus(current, status)
    );

  return (
    <>
      <AccordionSection
        title="Incidentes"
        count={`${incidents.length} registros`}
        isExpanded={expandedSection === 'incidentes'}
        onToggle={onToggle}
        onExport={onExport}
        exporting={exporting}
      >
        {incidents.length === 0 ? (
          <div className="supervisor-sub__empty">No hay registros de incidentes.</div>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="supervisor-sub__record supervisor-detail__incident">
              <div className="supervisor-sub__record-header">
                <span className="supervisor-sub__record-date">
                  {inc.fecha.toDate().toLocaleDateString('es-AR')}
                </span>
                <StatusBadge status={inc.estado} />
              </div>
              <div className="supervisor-detail__meta">
                <span className="supervisor-detail__meta-tag">
                  {incidentCategoriaLabel(inc.categoria)}
                </span>
                {inc.urgencia && (
                  <span
                    className={`supervisor-detail__meta-tag supervisor-detail__meta-tag--urgencia-${inc.urgencia}`}
                  >
                    Urgencia {incidentUrgenciaLabel(inc.urgencia)}
                  </span>
                )}
                {inc.ubicacion && (
                  <span className="supervisor-detail__meta-tag">Ubicación: {inc.ubicacion}</span>
                )}
              </div>
              <p className="supervisor-detail__desc">{inc.descripcion}</p>
              {inc.fotoDataUrl && (
                <div className="supervisor-detail__incident-photo">
                  <button
                    className="supervisor-detail__foto-btn"
                    onClick={() => onLightbox(inc.fotoDataUrl ?? '')}
                  >
                    <FotoThumb dataUrl={inc.fotoDataUrl} alt="Foto del incidente" />
                  </button>
                </div>
              )}
              <IncidentHistory events={inc.historialEstados} />
              <div className="supervisor-detail__incident-footer">
                <span className="supervisor-sub__record-author">
                  Cargado por: {inc.cargadoPorNombre}
                </span>
                <span className="supervisor-detail__status-control">
                  <span className="supervisor-detail__status-label">Estado</span>
                  <span
                    className="supervisor-detail__status-actions"
                    role="group"
                    aria-label={`Cambiar estado del incidente del ${inc.fecha
                      .toDate()
                      .toLocaleDateString('es-AR')}`}
                  >
                    {reachableStatuses(inc.estado).map((status) => (
                      <button
                        key={status}
                        type="button"
                        className="supervisor-detail__status-btn"
                        disabled={statusUpdatingId === inc.id}
                        onClick={() => void onStatusChange(inc.id, status)}
                      >
                        {incidentStatusLabel(status)}
                      </button>
                    ))}
                    {reachableStatuses(inc.estado).length === 0 && (
                      <span className="supervisor-detail__status-none">
                        Sin transiciones disponibles
                      </span>
                    )}
                  </span>
                </span>
              </div>
            </div>
          ))
        )}
      </AccordionSection>
    </>
  );
};

export default memo(schoolDetailIncidents);