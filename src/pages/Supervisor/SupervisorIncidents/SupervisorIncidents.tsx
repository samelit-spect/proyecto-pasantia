import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllIncidents, getSchools, updateIncidentStatus } from '@/services/api/firestore';
import type { Incident, IncidentStatus, School } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import '../SupervisorAttendances/SupervisorSubPage.css';
import './SupervisorIncidents.css';

interface GroupedIncidents {
  [schoolId: string]: {
    school: School;
    records: Incident[];
  };
}

const INCIDENT_STATUSES: IncidentStatus[] = ['pendiente', 'en_analisis', 'en_gestion', 'resuelto'];

const SupervisorIncidents = () => {
  const [grouped, setGrouped] = useState<GroupedIncidents>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const initialized = useRef(false);

  const loadData = useCallback(async () => {
    try {
      const [incidents, schools] = await Promise.all([getAllIncidents(), getSchools()]);
      const schoolMap = new Map(schools.map((s) => [s.id, s]));
      const groups: GroupedIncidents = {};

      for (const inc of incidents) {
        if (!groups[inc.escuelaId]) {
          groups[inc.escuelaId] = {
            school: schoolMap.get(inc.escuelaId) || {
              id: inc.escuelaId,
              nombre: 'Escuela desconocida',
              turno: '',
              activa: true,
            },
            records: [],
          };
        }
        groups[inc.escuelaId].records.push(inc);
      }

      setGrouped(groups);
    } catch {
      // Error silenciado
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadData();
  }, [loadData]);

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    setUpdatingId(incidentId);
    try {
      await updateIncidentStatus(incidentId, newStatus);
      setGrouped((prev) => {
        const next = { ...prev };
        for (const schoolId of Object.keys(next)) {
          next[schoolId] = {
            ...next[schoolId],
            records: next[schoolId].records.map((r) =>
              r.id === incidentId ? { ...r, estado: newStatus } : r
            ),
          };
        }
        return next;
      });
    } catch {
      // Error silenciado
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <div className="supervisor-sub__loading">Cargando incidentes...</div>;
  }

  const schoolIds = Object.keys(grouped);

  if (schoolIds.length === 0) {
    return <div className="supervisor-sub__empty">No hay registros de incidentes.</div>;
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
                {records.map((inc) => (
                  <div key={inc.id} className="supervisor-sub__record supervisor-incidents__record">
                    <div className="supervisor-sub__record-header">
                      <span className="supervisor-sub__record-date">
                        {inc.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <StatusBadge status={inc.estado} />
                    </div>
                    <p className="supervisor-incidents__desc">{inc.descripcion}</p>
                    <div className="supervisor-incidents__footer">
                      <span className="supervisor-sub__record-author">
                        Cargado por: {inc.cargadoPorNombre}
                      </span>
                      <select
                        className="supervisor-incidents__status-select"
                        value={inc.estado}
                        disabled={updatingId === inc.id}
                        onChange={(e) =>
                          handleStatusChange(inc.id, e.target.value as IncidentStatus)
                        }
                      >
                        {INCIDENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
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

export default SupervisorIncidents;
