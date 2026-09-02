import { memo, useState } from 'react';
import type { Incident, IncidentStatus } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import FotoThumb from '@/components/common/FotoThumb/FotoThumb';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import IncidentHistory from '@/components/common/IncidentHistory/IncidentHistory';
import {
  incidentCategoriaLabel,
  incidentUrgenciaLabel,
  incidentStatusLabel,
  canTransitionIncidentStatus,
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

interface PendingStatusChange {
  incidentId: string;
  newStatus: IncidentStatus;
}

const SchoolDetailIncidents = ({
  incidents,
  expandedSection,
  onToggle,
  onStatusChange,
  statusUpdatingId,
  onLightbox,
  onExport,
  exporting,
}: SchoolDetailIncidentsProps) => {
  const [pendingChange, setPendingChange] = useState<PendingStatusChange | null>(null);
  const [applying, setApplying] = useState<PendingStatusChange | null>(null);

  const handleSelectChange = (incidentId: string, newStatus: IncidentStatus) => {
    setPendingChange({ incidentId, newStatus });
  };

  // La opción actual nunca debe estar deshabilitada: un <select> con la
  // opción seleccionada en disabled hace que el control nativo (iOS/Safari)
  // se trabe y sea inusable hasta recargar la página.
  const isOptionDisabled = (incidentStatus: IncidentStatus, option: IncidentStatus) =>
    option !== incidentStatus && !canTransitionIncidentStatus(incidentStatus, option);

  // Mientras hay un cambio en confirmación o en aplicación mostramos el valor
  // elegido; si se cancela (o la actualización falla), el <select> vuelve al
  // estado real. Esto mantiene el control sincronizado sin bloquear la UI.
  const displayValue = (incident: Incident) =>
    (applying?.incidentId === incident.id ? applying.newStatus : undefined) ??
    (pendingChange?.incidentId === incident.id ? pendingChange.newStatus : undefined) ??
    incident.estado;

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
                <label className="supervisor-detail__status-control">
                  <span className="supervisor-detail__status-label">Estado</span>
                  <select
                    className="supervisor-detail__status-select"
                    name={`incident-status-${inc.id}`}
                    value={displayValue(inc)}
                    disabled={statusUpdatingId === inc.id}
                    onChange={(e) => handleSelectChange(inc.id, e.target.value as IncidentStatus)}
                  >
                    <option value="pendiente" disabled={isOptionDisabled(inc.estado, 'pendiente')}>
                      Pendiente
                    </option>
                    <option
                      value="en_analisis"
                      disabled={isOptionDisabled(inc.estado, 'en_analisis')}
                    >
                      En análisis
                    </option>
                    <option
                      value="en_gestion"
                      disabled={isOptionDisabled(inc.estado, 'en_gestion')}
                    >
                      En gestión
                    </option>
                    <option value="resuelto" disabled={isOptionDisabled(inc.estado, 'resuelto')}>
                      Resuelto
                    </option>
                  </select>
                </label>
              </div>
            </div>
          ))
        )}
      </AccordionSection>

      <ConfirmDialog
        open={!!pendingChange}
        title="Cambiar estado del incidente"
        message={
          pendingChange
            ? `¿Cambiar el estado a "${incidentStatusLabel(pendingChange.newStatus)}"? El cambio quedará registrado en el historial.`
            : ''
        }
        confirmLabel="Cambiar estado"
        variant="warning"
        onConfirm={() => {
          if (pendingChange) {
            const pc = pendingChange;
            // Cerramos el diálogo de inmediato para no bloquear la UI con el
            // overlay mientras se actualiza en Firestore; el <select> muestra
            // el nuevo valor vía `applying` hasta que termine.
            setPendingChange(null);
            setApplying(pc);
            onStatusChange(pc.incidentId, pc.newStatus)?.finally(() => setApplying(null));
          }
        }}
        onCancel={() => setPendingChange(null)}
      />
    </>
  );
};

export default memo(SchoolDetailIncidents);
