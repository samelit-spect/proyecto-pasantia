import { memo } from 'react';
import type { Attendance, DocenteAttendance } from '@/types';
import AccordionSection from '../AccordionSection/AccordionSection';

type AttendanceRecord = Attendance | DocenteAttendance;

function hasRegistros(record: AttendanceRecord): record is Attendance {
  return 'registros' in record;
}

interface SchoolDetailAttendancesProps {
  sectionId: string;
  title: string;
  records: AttendanceRecord[];
  expandedSection: string;
  onToggle: () => void;
  onVerify: (id: string, verified: boolean) => void;
  verifyUpdatingId: string | null;
  onExport?: () => void;
  exporting?: boolean;
}

const SchoolDetailAttendances = ({
  sectionId,
  title,
  records,
  expandedSection,
  onToggle,
  onVerify,
  verifyUpdatingId,
  onExport,
  exporting,
}: SchoolDetailAttendancesProps) => (
  <AccordionSection
    title={title}
    count={`${records.length} registros`}
    isExpanded={expandedSection === sectionId}
    onToggle={onToggle}
    onExport={onExport}
    exporting={exporting}
  >
    {records.length === 0 ? (
      <div className="supervisor-sub__empty">No hay registros de asistencia.</div>
    ) : (
      records.map((att) => (
        <div key={att.id} className="supervisor-sub__record">
          <div className="supervisor-sub__record-header">
            <span className="supervisor-sub__record-date">
              {att.fecha.toDate().toLocaleDateString('es-AR')}
            </span>
            <span className="supervisor-sub__record-author">
              Cargado por: {att.cargadoPorNombre}
            </span>
          </div>
          <div className="supervisor-detail__verify">
            {att.verificada ? (
              <span className="supervisor-detail__verify-badge">
                ✓ Verificada
                {att.verificadoPorNombre ? ` por ${att.verificadoPorNombre}` : ''}
              </span>
            ) : (
              <span className="supervisor-detail__verify-pending">Sin verificar</span>
            )}
            <button
              className="supervisor-detail__verify-btn"
              disabled={verifyUpdatingId === att.id}
              onClick={() => onVerify(att.id, !att.verificada)}
            >
              {att.verificada ? 'Quitar verificación' : 'Verificar'}
            </button>
          </div>
          {hasRegistros(att) ? (
            <div className="supervisor-sub__record-list">
              {att.registros.map((r, i) => (
                <span
                  key={`${r.nombre}-${i}`}
                  className={`supervisor-sub__member ${r.presente ? 'supervisor-sub__member--present' : 'supervisor-sub__member--absent'}`}
                >
                  {r.nombre} ({r.presente ? 'P' : 'A'})
                </span>
              ))}
            </div>
          ) : (att as DocenteAttendance).fotoDataUrl ? (
            <img
              src={(att as DocenteAttendance).fotoDataUrl}
              alt="Planilla de asistencia"
              className="supervisor-sub__photo"
              style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: '0.375rem', marginTop: '0.5rem' }}
            />
          ) : null}
        </div>
      ))
    )}
  </AccordionSection>
);

export default memo(SchoolDetailAttendances);
