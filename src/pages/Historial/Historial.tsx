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
import Pagination from '@/components/common/Pagination/Pagination';
import {
  novedadTipoLabel,
  incidentCategoriaLabel,
  incidentUrgenciaLabel,
  NOVEDAD_TIPOS,
  INCIDENT_CATEGORIAS,
  INCIDENT_URGENCIAS,
} from '@/utils/constants';
import type { NovedadTipo, IncidentCategoria, IncidentUrgencia } from '@/types';
import { dateKey } from '@/utils/dateKey';
import './Historial.css';

type SectionKey = 'asistencias' | 'docentes' | 'novedades' | 'incidentes';

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
  const [tipoFilter, setTipoFilter] = useState<NovedadTipo | ''>('');
  const [categoriaFilter, setCategoriaFilter] = useState<IncidentCategoria | ''>('');
  const [urgenciaFilter, setUrgenciaFilter] = useState<IncidentUrgencia | ''>('');
  const [expanded, setExpanded] = useState<SectionKey | null>('asistencias');
  const [pages, setPages] = useState<Record<SectionKey, number>>({
    asistencias: 1,
    docentes: 1,
    novedades: 1,
    incidentes: 1,
  });

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
  const filteredNews = news.filter(
    (n) => inRange(n.fecha) && (!tipoFilter || n.tipo === tipoFilter)
  );
  const filteredIncidents = incidents.filter(
    (i) =>
      inRange(i.fecha) &&
      (!categoriaFilter || i.categoria === categoriaFilter) &&
      (!urgenciaFilter || i.urgencia === urgenciaFilter)
  );

  const hasActiveFilters =
    dateFrom || dateTo || tipoFilter || categoriaFilter || urgenciaFilter;

  const toggleSection = (section: SectionKey) => {
    setExpanded(expanded === section ? null : section);
  };

  const PAGE_SIZE = 15;

  const paginate = <T,>(items: T[], section: SectionKey) => {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const page = Math.min(pages[section], totalPages);
    const start = (page - 1) * PAGE_SIZE;
    return { items: items.slice(start, start + PAGE_SIZE), totalPages, page };
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

        <label className="historial__filter-label">
          Tipo novedad
          <select
            className="historial__filter-select"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value as NovedadTipo | '')}
          >
            <option value="">Todas</option>
            {NOVEDAD_TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="historial__filter-label">
          Categoría
          <select
            className="historial__filter-select"
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value as IncidentCategoria | '')}
          >
            <option value="">Todas</option>
            {INCIDENT_CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="historial__filter-label">
          Urgencia
          <select
            className="historial__filter-select"
            value={urgenciaFilter}
            onChange={(e) => setUrgenciaFilter(e.target.value as IncidentUrgencia | '')}
          >
            <option value="">Todas</option>
            {INCIDENT_URGENCIAS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button
            className="historial__filters-clear"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setTipoFilter('');
              setCategoriaFilter('');
              setUrgenciaFilter('');
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
            {expanded === 'asistencias' && (() => {
              const { items, totalPages, page } = paginate(filteredAttendances, 'asistencias');
              return (
                <div className="historial__section-body">
                  {items.length === 0 ? (
                    <div className="historial__empty">No hay registros.</div>
                  ) : (
                    items.map((att) => (
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
                  <Pagination current={page} total={totalPages} onChange={(p) => setPages((prev) => ({ ...prev, asistencias: p }))} />
                </div>
              );
            })()}
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
            {expanded === 'docentes' && (() => {
              const { items, totalPages, page } = paginate(filteredDocenteAttendances, 'docentes');
              return (
                <div className="historial__section-body">
                  {items.length === 0 ? (
                    <div className="historial__empty">No hay registros.</div>
                  ) : (
                    items.map((att) => (
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
                  <Pagination current={page} total={totalPages} onChange={(p) => setPages((prev) => ({ ...prev, docentes: p }))} />
                </div>
              );
            })()}
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
            {expanded === 'novedades' && (() => {
              const { items, totalPages, page } = paginate(filteredNews, 'novedades');
              return (
                <div className="historial__section-body">
                  {items.length === 0 ? (
                    <div className="historial__empty">No hay registros.</div>
                  ) : (
                    items.map((n) => (
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
                  <Pagination current={page} total={totalPages} onChange={(p) => setPages((prev) => ({ ...prev, novedades: p }))} />
                </div>
              );
            })()}
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
            {expanded === 'incidentes' && (() => {
              const { items, totalPages, page } = paginate(filteredIncidents, 'incidentes');
              return (
                <div className="historial__section-body">
                  {items.length === 0 ? (
                    <div className="historial__empty">No hay registros.</div>
                  ) : (
                    items.map((inc) => (
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
                  <Pagination current={page} total={totalPages} onChange={(p) => setPages((prev) => ({ ...prev, incidentes: p }))} />
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

export default Historial;
