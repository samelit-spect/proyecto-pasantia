import { useState, useEffect } from 'react';
import { getAllAttendances, getSchools } from '@/services/api/firestore';
import type { Attendance, School } from '@/types';
import './SupervisorSubPage.css';

interface GroupedAttendances {
  [schoolId: string]: {
    school: School;
    records: Attendance[];
  };
}

const SupervisorAttendances = () => {
  const [grouped, setGrouped] = useState<GroupedAttendances>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [attendances, schools] = await Promise.all([getAllAttendances(), getSchools()]);

        const schoolMap = new Map(schools.map((s) => [s.id, s]));
        const groups: GroupedAttendances = {};

        for (const att of attendances) {
          if (!groups[att.escuelaId]) {
            groups[att.escuelaId] = {
              school: schoolMap.get(att.escuelaId) || {
                id: att.escuelaId,
                nombre: 'Escuela desconocida',
                turno: '',
                activa: true,
              },
              records: [],
            };
          }
          groups[att.escuelaId].records.push(att);
        }

        setGrouped(groups);
      } catch {
        setError('No se pudieron cargar las asistencias. Intentá de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div className="supervisor-sub__loading">Cargando asistencias...</div>;
  }

  if (error) {
    return <div className="supervisor-sub__loading supervisor-sub__loading--error">{error}</div>;
  }

  const schoolIds = Object.keys(grouped);

  if (schoolIds.length === 0) {
    return <div className="supervisor-sub__empty">No hay registros de asistencia.</div>;
  }

  return (
    <div className="supervisor-sub">
      {schoolIds.map((schoolId) => {
        const { school, records } = grouped[schoolId];
        const isExpanded = expandedSchool === schoolId;

        return (
          <div key={schoolId} className="supervisor-sub__group">
            <button
              className="supervisor-sub__group-header"
              onClick={() => setExpandedSchool(isExpanded ? null : schoolId)}
            >
              <div className="supervisor-sub__group-info">
                <span className="supervisor-sub__group-name">{school.nombre}</span>
                <span className="supervisor-sub__group-count">{records.length} registros</span>
              </div>
              <span
                className={`supervisor-sub__arrow ${isExpanded ? 'supervisor-sub__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>

            {isExpanded && (
              <div className="supervisor-sub__group-body">
                {records.map((att) => (
                  <div key={att.id} className="supervisor-sub__record">
                    <div className="supervisor-sub__record-header">
                      <span className="supervisor-sub__record-date">
                        {att.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <span className="supervisor-sub__record-author">
                        Cargado por: {att.cargadoPorNombre}
                      </span>
                    </div>
                    <div className="supervisor-sub__record-list">
                      {att.registros.map((r, i) => (
                        <span
                          key={i}
                          className={`supervisor-sub__member ${r.presente ? 'supervisor-sub__member--present' : 'supervisor-sub__member--absent'}`}
                        >
                          {r.nombre} ({r.presente ? 'P' : 'A'})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SupervisorAttendances;
