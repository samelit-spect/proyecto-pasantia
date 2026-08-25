import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeAttendancesBySchool,
  subscribeNewsBySchool,
  subscribeIncidentsBySchool,
  subscribeDocenteAttendancesBySchool,
} from '@/services/api/firestore';
import type { Attendance, DocenteAttendance, News, Incident } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import SwipeableRow from '@/components/common/SwipeableRow/SwipeableRow';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import Pagination from '@/components/common/Pagination/Pagination';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import IncidentHistory from '@/components/common/IncidentHistory/IncidentHistory';
import FilterBar, { type ActiveFilter } from '@/components/common/FilterBar/FilterBar';
import PullToRefresh from '@/components/common/PullToRefresh/PullToRefresh';
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
import { exportHistorialPDF } from '@/utils/pdfExport';
import { useToast } from '@/context/ToastContext';
import HistorialSkeleton from './HistorialSkeleton';
import './Historial.css';

type SectionKey = 'asistencias' | 'docentes' | 'novedades' | 'incidentes';

const Historial = () => {
  const { profile, hasRole } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [docenteAttendances, setDocenteAttendances] = useState<DocenteAttendance[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

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

  const [isLoading, setIsLoading] = useState(true);
  const initialLoadedRef = useRef(0);

  useEffect(() => {
    if (!profile || !hasRole('director', 'vice', 'preceptor')) return;
    if (!profile.escuelaId) return;

    let unmounted = false;

    const unsubAttendances = subscribeAttendancesBySchool(profile.escuelaId, (data) => {
      if (!unmounted) setAttendances(data);
      if (initialLoadedRef.current < 4) {
        initialLoadedRef.current++;
        if (initialLoadedRef.current >= 4) setIsLoading(false);
      }
    });
    const unsubDocenteAtt = subscribeDocenteAttendancesBySchool(profile.escuelaId, (data) => {
      if (!unmounted) setDocenteAttendances(data);
      if (initialLoadedRef.current < 4) {
        initialLoadedRef.current++;
        if (initialLoadedRef.current >= 4) setIsLoading(false);
      }
    });
    const unsubNews = subscribeNewsBySchool(profile.escuelaId, (data) => {
      if (!unmounted) setNews(data);
      if (initialLoadedRef.current < 4) {
        initialLoadedRef.current++;
        if (initialLoadedRef.current >= 4) setIsLoading(false);
      }
    });
    const unsubIncidents = subscribeIncidentsBySchool(profile.escuelaId, (data) => {
      if (!unmounted) setIncidents(data);
      if (initialLoadedRef.current < 4) {
        initialLoadedRef.current++;
        if (initialLoadedRef.current >= 4) setIsLoading(false);
      }
    });

    return () => {
      unmounted = true;
      unsubAttendances();
      unsubDocenteAtt();
      unsubNews();
      unsubIncidents();
    };
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

  const activeFilters: ActiveFilter[] = [];
  if (dateFrom) activeFilters.push({ key: 'dateFrom', label: 'Desde', value: dateFrom });
  if (dateTo) activeFilters.push({ key: 'dateTo', label: 'Hasta', value: dateTo });
  if (tipoFilter) activeFilters.push({ key: 'tipo', label: 'Tipo', value: tipoFilter });
  if (categoriaFilter)
    activeFilters.push({ key: 'categoria', label: 'Categoría', value: categoriaFilter });
  if (urgenciaFilter)
    activeFilters.push({ key: 'urgencia', label: 'Urgencia', value: urgenciaFilter });

  const removeFilter = (key: string) => {
    switch (key) {
      case 'dateFrom':
        setDateFrom('');
        break;
      case 'dateTo':
        setDateTo('');
        break;
      case 'tipo':
        setTipoFilter('');
        break;
      case 'categoria':
        setCategoriaFilter('');
        break;
      case 'urgencia':
        setUrgenciaFilter('');
        break;
    }
  };

  const clearAllFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTipoFilter('');
    setCategoriaFilter('');
    setUrgenciaFilter('');
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    if (value && dateTo && value > dateTo) {
      setDateTo('');
      addToast('info', "Se limpió el filtro 'Hasta' porque es anterior a 'Desde'.");
    }
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    if (value && dateFrom && value < dateFrom) {
      setDateFrom('');
      addToast('info', "Se limpió el filtro 'Desde' porque es posterior a 'Hasta'.");
    }
  };

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

  const handleExportPDF = () => {
    try {
      exportHistorialPDF({
        attendances: filteredAttendances,
        docenteAttendances: filteredDocenteAttendances,
        news: filteredNews,
        incidents: filteredIncidents,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      addToast('success', 'PDF descargado correctamente.');
    } catch {
      addToast('error', 'Error al generar el PDF.');
    }
  };

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 400));
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <section className="historial">
      <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Historial' }]} />
      <button className="supervisor__back" onClick={() => navigate('/', { viewTransition: true })}>
        <ArrowLeft size={18} strokeWidth={1.5} />
        Volver
      </button>
      <h2 className="historial__title">Historial de Cargas</h2>
      <div className="historial__header-row">
        <p className="historial__subtitle">
          Consultá las asistencias, novedades e incidentes cargados en tu escuela.
        </p>
        <button className="historial__export-btn" onClick={handleExportPDF}>
          <Download size={14} strokeWidth={2} />
          Exportar PDF
        </button>
      </div>

      <FilterBar
        activeFilters={activeFilters}
        onRemoveFilter={removeFilter}
        onClearAll={clearAllFilters}
      >
        <div className="historial__filters">
          <DatePicker
            label="Desde"
            value={dateFrom}
            onChange={handleDateFromChange}
            max={dateTo || undefined}
          />
          <DatePicker
            label="Hasta"
            value={dateTo}
            onChange={handleDateToChange}
            min={dateFrom || undefined}
          />

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
        </div>
      </FilterBar>

      {isLoading && <HistorialSkeleton />}

      {!isLoading && (
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
            {expanded === 'asistencias' &&
              (() => {
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
                    <Pagination
                      current={page}
                      total={totalPages}
                      onChange={(p) => setPages((prev) => ({ ...prev, asistencias: p }))}
                    />
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
            {expanded === 'docentes' &&
              (() => {
                const { items, totalPages, page } = paginate(
                  filteredDocenteAttendances,
                  'docentes'
                );
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
                          {att.fotoDataUrl ? (
                            <img
                              src={att.fotoDataUrl}
                              alt="Planilla de asistencia"
                              style={{
                                maxWidth: '100%',
                                maxHeight: 200,
                                objectFit: 'contain',
                                borderRadius: '0.375rem',
                                marginTop: '0.5rem',
                              }}
                            />
                          ) : (
                            <p className="historial__desc">Sin foto adjunta</p>
                          )}
                        </div>
                      ))
                    )}
                    <Pagination
                      current={page}
                      total={totalPages}
                      onChange={(p) => setPages((prev) => ({ ...prev, docentes: p }))}
                    />
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
            {expanded === 'novedades' &&
              (() => {
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
                    <Pagination
                      current={page}
                      total={totalPages}
                      onChange={(p) => setPages((prev) => ({ ...prev, novedades: p }))}
                    />
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
            {expanded === 'incidentes' &&
              (() => {
                const { items, totalPages, page } = paginate(filteredIncidents, 'incidentes');
                return (
                  <div className="historial__section-body">
                    {items.length === 0 ? (
                      <div className="historial__empty">No hay registros.</div>
                    ) : (
                      items.map((inc) => (
                        <SwipeableRow key={inc.id}>
                          <div className="historial__record">
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
                                <span className="historial__meta-tag">
                                  Ubicación: {inc.ubicacion}
                                </span>
                              )}
                            </div>
                            <p className="historial__desc">{inc.descripcion}</p>
                            <IncidentHistory events={inc.historialEstados} />
                          </div>
                        </SwipeableRow>
                      ))
                    )}
                    <Pagination
                      current={page}
                      total={totalPages}
                      onChange={(p) => setPages((prev) => ({ ...prev, incidentes: p }))}
                    />
                  </div>
                );
              })()}
          </div>
        </div>
      )}
    </section>
    </PullToRefresh>
  );
};

export default Historial;
