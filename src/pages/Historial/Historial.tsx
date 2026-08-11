import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getAttendancesBySchool,
  getDocenteAttendancesBySchool,
  getNewsBySchool,
  getIncidentsBySchool,
} from '@/services/api/firestore';
import type { Attendance, DocenteAttendance, News, Incident } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { novedadTipoLabel, incidentCategoriaLabel, incidentUrgenciaLabel } from '@/utils/constants';
import './Historial.css';

type SectionKey = 'asistencias' | 'docentes' | 'novedades' | 'incidentes';

const dateKey = (ts: { toDate: () => Date }) => {
  const d = ts.toDate();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().split('T')[0];
};

const Historial = () => {
  const { profile, hasRole } = useAuth();
  const initialized = useRef(false);

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [docenteAttendances, setDocenteAttendances] = useState<DocenteAttendance[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expanded, setExpanded] = useState<SectionKey | null>('asistencias');

  useEffect(() => {
    if (!profile || !hasRole('director', 'vice', 'preceptor') || initialized.current) return;
    initialized.current = true;

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [atts, dAtts, newsData, incidentsData] = await Promise.all([
          getAttendancesBySchool(profile.escuelaId, new Date(2000, 0, 1), new Date()),
          getDocenteAttendancesBySchool(profile.escuelaId, new Date(2000, 0, 1), new Date()),
          getNewsBySchool(profile.escuelaId, new Date(2000, 0, 1), new Date()),
          getIncidentsBySchool(profile.escuelaId, new Date(2000, 0, 1), new Date()),
        ]);
        setAttendances(atts);
        setDocenteAttendances(dAtts);
        setNews(newsData);
        setIncidents(incidentsData);
      } catch {
        setError('No se pudieron cargar los datos. Intentá de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [profile, hasRole]);

  const inRange = (ts: { toDate: () => Date }) =>
    (!dateFrom || dateKey(ts) >= dateFrom) && (!dateTo || dateKey(ts) <= dateTo);

  const filteredAttendances = attendances.filter((a) => inRange(a.fecha));
  const filteredDocenteAttendances = docenteAttendances.filter((a) => inRange(a.fecha));
  const filteredNews = news.filter((n) => inRange(n.fecha));
  const filteredIncidents = incidents.filter((i) => inRange(i.fecha));

  const toggleSection = (section: SectionKey) => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <section className="historial">
      <h2 className="historial__title">Historial de Cargas</h2>
      <p className="historial__subtitle">
        Consultá las asistencias, novedades e incidentes cargados en tu escuela.
      </p>

      <div className="historial__filters">
        <DatePicker label="Desde" value={dateFrom} onChange={setDateFrom} />
        <DatePicker label="Hasta" value={dateTo} onChange={setDateTo} />
        {(dateFrom || dateTo) && (
          <button
            className="historial__filters-clear"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && (
        <div className="historial__error" role="alert">
          {error}
        </div>
      )}

      {isLoading && <div className="historial__loading">Cargando historial...</div>}

      {!isLoading && !error && (
        <div className="historial__sections">
          <div className="historial__section">
            <button
              className="historial__section-header"
              onClick={() => toggleSection('asistencias')}
            >
              <div className="historial__section-info">
                <span className="historial__section-title">Asistencia de Gestión</span>
                <span className="historial__section-count">
                  {filteredAttendances.length} registros
                </span>
              </div>
              <span
                className={`historial__arrow ${expanded === 'asistencias' ? 'historial__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>
            {expanded === 'asistencias' && (
              <div className="historial__section-body">
                {filteredAttendances.length === 0 ? (
                  <div className="historial__empty">No hay registros.</div>
                ) : (
                  filteredAttendances.map((att) => (
                    <div key={att.id} className="historial__record">
                      <div className="historial__record-header">
                        <span className="historial__record-date">
                          {att.fecha.toDate().toLocaleDateString('es-AR')}
                        </span>
                        <span className="historial__record-author">
                          Cargado por {att.cargadoPorNombre}
                        </span>
                      </div>
                      <div className="historial__members">
                        {att.registros.map((r, i) => (
                          <span
                            key={`${r.nombre}-${i}`}
                            className={`historial__member ${r.presente ? 'historial__member--present' : 'historial__member--absent'}`}
                          >
                            {r.nombre} ({r.presente ? 'P' : 'A'})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="historial__section">
            <button className="historial__section-header" onClick={() => toggleSection('docentes')}>
              <div className="historial__section-info">
                <span className="historial__section-title">Asistencia de Docentes</span>
                <span className="historial__section-count">
                  {filteredDocenteAttendances.length} registros
                </span>
              </div>
              <span
                className={`historial__arrow ${expanded === 'docentes' ? 'historial__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>
            {expanded === 'docentes' && (
              <div className="historial__section-body">
                {filteredDocenteAttendances.length === 0 ? (
                  <div className="historial__empty">No hay registros.</div>
                ) : (
                  filteredDocenteAttendances.map((att) => (
                    <div key={att.id} className="historial__record">
                      <div className="historial__record-header">
                        <span className="historial__record-date">
                          {att.fecha.toDate().toLocaleDateString('es-AR')}
                        </span>
                        <span className="historial__record-author">
                          Cargado por {att.cargadoPorNombre}
                        </span>
                      </div>
                      <div className="historial__members">
                        {att.registros.map((r, i) => (
                          <span
                            key={`${r.nombre}-${i}`}
                            className={`historial__member ${r.presente ? 'historial__member--present' : 'historial__member--absent'}`}
                          >
                            {r.nombre} ({r.presente ? 'P' : 'A'})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="historial__section">
            <button
              className="historial__section-header"
              onClick={() => toggleSection('novedades')}
            >
              <div className="historial__section-info">
                <span className="historial__section-title">Novedades</span>
                <span className="historial__section-count">{filteredNews.length} registros</span>
              </div>
              <span
                className={`historial__arrow ${expanded === 'novedades' ? 'historial__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>
            {expanded === 'novedades' && (
              <div className="historial__section-body">
                {filteredNews.length === 0 ? (
                  <div className="historial__empty">No hay registros.</div>
                ) : (
                  filteredNews.map((n) => (
                    <div key={n.id} className="historial__record">
                      <div className="historial__record-header">
                        <span className="historial__record-date">
                          {n.fecha.toDate().toLocaleDateString('es-AR')}
                        </span>
                        <span className="historial__record-author">
                          {novedadTipoLabel(n.tipo)}
                          {n.hora ? ` · ${n.hora}` : ''}
                        </span>
                      </div>
                      <p className="historial__desc">{n.descripcion}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="historial__section">
            <button
              className="historial__section-header"
              onClick={() => toggleSection('incidentes')}
            >
              <div className="historial__section-info">
                <span className="historial__section-title">Incidentes</span>
                <span className="historial__section-count">
                  {filteredIncidents.length} registros
                </span>
              </div>
              <span
                className={`historial__arrow ${expanded === 'incidentes' ? 'historial__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>
            {expanded === 'incidentes' && (
              <div className="historial__section-body">
                {filteredIncidents.length === 0 ? (
                  <div className="historial__empty">No hay registros.</div>
                ) : (
                  filteredIncidents.map((inc) => (
                    <div key={inc.id} className="historial__record">
                      <div className="historial__record-header">
                        <span className="historial__record-date">
                          {inc.fecha.toDate().toLocaleDateString('es-AR')}
                        </span>
                        <StatusBadge status={inc.estado} />
                      </div>
                      <div className="historial__meta">
                        <span className="historial__meta-tag">
                          {incidentCategoriaLabel(inc.categoria)}
                        </span>
                        {inc.urgencia && (
                          <span
                            className={`historial__meta-tag historial__meta-tag--urgencia-${inc.urgencia}`}
                          >
                            Urgencia {incidentUrgenciaLabel(inc.urgencia)}
                          </span>
                        )}
                        {inc.ubicacion && (
                          <span className="historial__meta-tag">Ubicación: {inc.ubicacion}</span>
                        )}
                      </div>
                      <p className="historial__desc">{inc.descripcion}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Historial;
