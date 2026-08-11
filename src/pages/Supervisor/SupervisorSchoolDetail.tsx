import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
  getSchoolById,
  getAllAttendancesBySchool,
  getAllNewsBySchool,
  getIncidentsBySchool,
  getUsersBySchool,
  updateIncidentStatus,
  getDocentesBySchool,
  addDocente,
  setDocenteActive,
  getDocenteAttendancesBySchool,
  getFotosBySchool,
  getAttendancesBySchool,
  getNewsBySchool,
  setAttendanceVerified,
  setDocenteAttendanceVerified,
} from '@/services/api/firestore';
import type {
  School,
  Attendance,
  News,
  Incident,
  IncidentStatus,
  UserProfile,
  Docente,
  DocenteAttendance,
  Foto,
} from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import FotoThumb from '@/components/common/FotoThumb/FotoThumb';
import { downloadCsv } from '@/utils/exportCsv';
import {
  novedadTipoLabel,
  incidentCategoriaLabel,
  incidentUrgenciaLabel,
  canTransitionIncidentStatus,
} from '@/utils/constants';
import './SupervisorSchoolDetail.css';

const DEFAULT_RANGE_START = new Date(2000, 0, 1);

const dateToLabel = (d: Date) => d.toLocaleDateString('es-AR');

type ExportType = 'asistencias' | 'docentes' | 'novedades' | 'incidentes';

const SupervisorSchoolDetail = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [school, setSchool] = useState<School | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [docenteAttendances, setDocenteAttendances] = useState<DocenteAttendance[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedSection, setExpandedSection] = useState<string | null>('asistencias');
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [verifyUpdatingId, setVerifyUpdatingId] = useState<string | null>(null);
  const [verifyFeedback, setVerifyFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportType | null>(null);

  const [docenteFormNombre, setDocenteFormNombre] = useState('');
  const [docenteFormMateria, setDocenteFormMateria] = useState('');
  const [docenteFormSubmitting, setDocenteFormSubmitting] = useState(false);
  const [docenteUpdatingId, setDocenteUpdatingId] = useState<string | null>(null);
  const [docenteFeedback, setDocenteFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!schoolId) return;

    const loadSchoolData = async () => {
      try {
        const [
          schoolData,
          attendancesData,
          newsData,
          incidentsData,
          usersData,
          docentesData,
          docenteAttendancesData,
          fotosData,
        ] = await Promise.all([
          getSchoolById(schoolId),
          getAllAttendancesBySchool(schoolId),
          getAllNewsBySchool(schoolId),
          getIncidentsBySchool(schoolId),
          getUsersBySchool(schoolId),
          getDocentesBySchool(schoolId),
          getDocenteAttendancesBySchool(schoolId),
          getFotosBySchool(schoolId),
        ]);

        setSchool(schoolData);
        setAttendances(attendancesData);
        setNews(newsData);
        setIncidents(incidentsData);
        setUsers(usersData);
        setDocentes(docentesData);
        setDocenteAttendances(docenteAttendancesData);
        setFotos(fotosData);
      } catch {
        setError('No se pudieron cargar los datos de la escuela.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchoolData();
  }, [schoolId]);

  if (isLoading) {
    return <div className="supervisor__loading">Cargando datos de la escuela...</div>;
  }

  if (error) {
    return <div className="supervisor__loading supervisor__loading--error">{error}</div>;
  }

  if (!school) {
    return <div className="supervisor__empty">Escuela no encontrada.</div>;
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const dateKey = (ts: { toDate: () => Date }) => {
    const d = ts.toDate();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().split('T')[0];
  };

  const inRange = (ts: { toDate: () => Date }) =>
    (!dateFrom || dateKey(ts) >= dateFrom) && (!dateTo || dateKey(ts) <= dateTo);

  const filteredAttendances = attendances.filter((a) => inRange(a.fecha));
  const filteredNews = news.filter((n) => inRange(n.fecha));
  const filteredIncidents = incidents.filter((i) => inRange(i.fecha));
  const filteredDocenteAttendances = docenteAttendances.filter((a) => inRange(a.fecha));

  const inDateRange = (fecha: string) =>
    (!dateFrom || fecha >= dateFrom) && (!dateTo || fecha <= dateTo);
  const filteredFotos = fotos.filter((f) => inDateRange(f.fecha));
  const schoolDocentes = docentes;

  const handleAddDocente = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocenteFeedback(null);

    if (!schoolId) return;

    if (!docenteFormNombre.trim()) {
      setDocenteFeedback({ type: 'error', message: 'Ingresá el nombre del docente.' });
      return;
    }

    setDocenteFormSubmitting(true);
    try {
      await addDocente({
        nombre: docenteFormNombre.trim(),
        materia: docenteFormMateria.trim() || undefined,
        escuelaId: schoolId,
      });
      const updated = await getDocentesBySchool(schoolId);
      setDocentes(updated);
      setDocenteFormNombre('');
      setDocenteFormMateria('');
      setDocenteFeedback({ type: 'success', message: 'Docente agregado correctamente.' });
      setTimeout(() => setDocenteFeedback(null), 3000);
    } catch {
      setDocenteFeedback({ type: 'error', message: 'No se pudo agregar el docente.' });
    } finally {
      setDocenteFormSubmitting(false);
    }
  };

  const handleToggleDocente = async (docenteId: string, activo: boolean) => {
    setDocenteFeedback(null);
    setDocenteUpdatingId(docenteId);

    try {
      await setDocenteActive(docenteId, activo);
      setDocentes((prev) => prev.map((d) => (d.id === docenteId ? { ...d, activo } : d)));
    } catch {
      setDocenteFeedback({ type: 'error', message: 'No se pudo actualizar el docente.' });
    } finally {
      setDocenteUpdatingId(null);
    }
  };

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    setStatusFeedback(null);
    setStatusUpdatingId(incidentId);

    try {
      await updateIncidentStatus(incidentId, newStatus);
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incidentId ? { ...inc, estado: newStatus } : inc))
      );
      setStatusFeedback({ type: 'success', message: 'Estado del incidente actualizado.' });
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch {
      setStatusFeedback({ type: 'error', message: 'No se pudo actualizar el estado.' });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleVerifyAttendance = async (attendanceId: string, verified: boolean) => {
    if (!profile) return;
    setVerifyFeedback(null);
    setVerifyUpdatingId(attendanceId);

    try {
      await setAttendanceVerified(attendanceId, verified, {
        uid: profile.uid,
        nombre: profile.nombre,
      });
      setAttendances((prev) =>
        prev.map((att) =>
          att.id === attendanceId
            ? {
                ...att,
                verificada: verified,
                verificadoPor: verified ? profile.uid : undefined,
                verificadoPorNombre: verified ? profile.nombre : undefined,
                verificadoEn: verified ? Timestamp.now() : undefined,
              }
            : att
        )
      );
      setVerifyFeedback({
        type: 'success',
        message: verified ? 'Asistencia verificada.' : 'Verificación removida.',
      });
      setTimeout(() => setVerifyFeedback(null), 3000);
    } catch {
      setVerifyFeedback({ type: 'error', message: 'No se pudo actualizar la verificación.' });
    } finally {
      setVerifyUpdatingId(null);
    }
  };

  const handleVerifyDocenteAttendance = async (attendanceId: string, verified: boolean) => {
    if (!profile) return;
    setVerifyFeedback(null);
    setVerifyUpdatingId(attendanceId);

    try {
      await setDocenteAttendanceVerified(attendanceId, verified, {
        uid: profile.uid,
        nombre: profile.nombre,
      });
      setDocenteAttendances((prev) =>
        prev.map((att) =>
          att.id === attendanceId
            ? {
                ...att,
                verificada: verified,
                verificadoPor: verified ? profile.uid : undefined,
                verificadoPorNombre: verified ? profile.nombre : undefined,
                verificadoEn: verified ? Timestamp.now() : undefined,
              }
            : att
        )
      );
      setVerifyFeedback({
        type: 'success',
        message: verified ? 'Asistencia verificada.' : 'Verificación removida.',
      });
      setTimeout(() => setVerifyFeedback(null), 3000);
    } catch {
      setVerifyFeedback({ type: 'error', message: 'No se pudo actualizar la verificación.' });
    } finally {
      setVerifyUpdatingId(null);
    }
  };

  const handleExport = async (type: ExportType) => {
    if (!schoolId || !school) return;
    setVerifyFeedback(null);
    setExporting(type);

    try {
      const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : DEFAULT_RANGE_START;
      const to = dateTo ? new Date(`${dateTo}T23:59:59`) : new Date();
      const schoolSlug = school.nombre.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const rangeLabel = `${dateFrom || 'inicio'}-${dateTo || 'hoy'}`;

      if (type === 'asistencias') {
        const rows = await getAttendancesBySchool(schoolId, from, to);
        downloadCsv(
          `asistencias-${schoolSlug}-${rangeLabel}.csv`,
          ['Fecha', 'Cargado por', 'Presentes', 'Ausentes', 'Verificada'],
          rows.map((a) => {
            const presentes = a.registros.filter((r) => r.presente).length;
            return [
              dateToLabel(a.fecha.toDate()),
              a.cargadoPorNombre,
              presentes,
              a.registros.length - presentes,
              a.verificada ? 'Sí' : 'No',
            ];
          })
        );
      } else if (type === 'docentes') {
        const rows = await getDocenteAttendancesBySchool(schoolId, from, to);
        downloadCsv(
          `asistencia-docentes-${schoolSlug}-${rangeLabel}.csv`,
          ['Fecha', 'Cargado por', 'Presentes', 'Ausentes', 'Verificada'],
          rows.map((a) => {
            const presentes = a.registros.filter((r) => r.presente).length;
            return [
              dateToLabel(a.fecha.toDate()),
              a.cargadoPorNombre,
              presentes,
              a.registros.length - presentes,
              a.verificada ? 'Sí' : 'No',
            ];
          })
        );
      } else if (type === 'novedades') {
        const rows = await getNewsBySchool(schoolId, from, to);
        downloadCsv(
          `novedades-${schoolSlug}-${rangeLabel}.csv`,
          ['Fecha', 'Tipo', 'Hora', 'Descripción', 'Cargado por'],
          rows.map((n) => [
            dateToLabel(n.fecha.toDate()),
            novedadTipoLabel(n.tipo),
            n.hora || '',
            n.descripcion,
            n.cargadoPorNombre,
          ])
        );
      } else {
        const rows = await getIncidentsBySchool(schoolId, from, to);
        downloadCsv(
          `incidentes-${schoolSlug}-${rangeLabel}.csv`,
          ['Fecha', 'Categoría', 'Urgencia', 'Ubicación', 'Estado', 'Descripción', 'Cargado por'],
          rows.map((i) => [
            dateToLabel(i.fecha.toDate()),
            incidentCategoriaLabel(i.categoria),
            i.urgencia ? incidentUrgenciaLabel(i.urgencia) : '',
            i.ubicacion || '',
            i.estado,
            i.descripcion,
            i.cargadoPorNombre,
          ])
        );
      }

      setVerifyFeedback({ type: 'success', message: 'Exportación generada correctamente.' });
      setTimeout(() => setVerifyFeedback(null), 3000);
    } catch {
      setVerifyFeedback({ type: 'error', message: 'No se pudo exportar. Intentá de nuevo.' });
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <div className="supervisor__header">
        <button className="supervisor__back" onClick={() => navigate('/supervisor')}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">{school.nombre}</h2>
      </div>
      <p className="supervisor__subtitle">
        Turno: {school.turno} · {users.length} usuarios · {schoolDocentes.length} docentes ·{' '}
        {attendances.length +
          news.length +
          incidents.length +
          docenteAttendances.length +
          fotos.length}{' '}
        registros
      </p>

      {statusFeedback && (
        <div
          className={`supervisor-detail__feedback supervisor-detail__feedback--${statusFeedback.type}`}
          role="status"
        >
          {statusFeedback.message}
        </div>
      )}

      {verifyFeedback && (
        <div
          className={`supervisor-detail__feedback supervisor-detail__feedback--${verifyFeedback.type}`}
          role="status"
        >
          {verifyFeedback.message}
        </div>
      )}

      <div className="supervisor-detail__filters">
        <DatePicker label="Desde" value={dateFrom} onChange={setDateFrom} />
        <DatePicker label="Hasta" value={dateTo} onChange={setDateTo} />
        {(dateFrom || dateTo) && (
          <button
            className="supervisor-detail__filters-clear"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="supervisor-detail__sections">
        <div className="supervisor-detail__section">
          <div className="supervisor-detail__section-header-row">
            <button
              className="supervisor-detail__section-header"
              onClick={() => toggleSection('asistencias')}
            >
              <div className="supervisor-detail__section-info">
                <span className="supervisor__section-title">Asistencias</span>
                <span className="supervisor__section-count">
                  {filteredAttendances.length} registros
                </span>
              </div>
              <span
                className={`supervisor-detail__arrow ${expandedSection === 'asistencias' ? 'supervisor-detail__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>
            <button
              className="supervisor-detail__export-btn"
              onClick={() => handleExport('asistencias')}
              disabled={exporting === 'asistencias'}
              title="Exportar asistencias a CSV"
            >
              <Download size={14} strokeWidth={1.5} />
              {exporting === 'asistencias' ? '...' : 'CSV'}
            </button>
          </div>
          {expandedSection === 'asistencias' && (
            <div className="supervisor-detail__section-body">
              {filteredAttendances.length === 0 ? (
                <div className="supervisor-sub__empty">No hay registros de asistencia.</div>
              ) : (
                filteredAttendances.map((att) => (
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
                        onClick={() => handleVerifyAttendance(att.id, !att.verificada)}
                      >
                        {att.verificada ? 'Quitar verificación' : 'Verificar'}
                      </button>
                    </div>
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
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
          <div className="supervisor-detail__section-header-row">
            <button
              className="supervisor-detail__section-header"
              onClick={() => toggleSection('asistencia-docentes')}
            >
              <div className="supervisor-detail__section-info">
                <span className="supervisor__section-title">Asistencia de Docentes</span>
                <span className="supervisor__section-count">
                  {filteredDocenteAttendances.length} registros
                </span>
              </div>
              <span
                className={`supervisor-detail__arrow ${expandedSection === 'asistencia-docentes' ? 'supervisor-detail__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>
            <button
              className="supervisor-detail__export-btn"
              onClick={() => handleExport('docentes')}
              disabled={exporting === 'docentes'}
              title="Exportar asistencia de docentes a CSV"
            >
              <Download size={14} strokeWidth={1.5} />
              {exporting === 'docentes' ? '...' : 'CSV'}
            </button>
          </div>
          {expandedSection === 'asistencia-docentes' && (
            <div className="supervisor-detail__section-body">
              {filteredDocenteAttendances.length === 0 ? (
                <div className="supervisor-sub__empty">No hay registros de asistencia docente.</div>
              ) : (
                filteredDocenteAttendances.map((att) => (
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
                        onClick={() => handleVerifyDocenteAttendance(att.id, !att.verificada)}
                      >
                        {att.verificada ? 'Quitar verificación' : 'Verificar'}
                      </button>
                    </div>
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
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
          <div className="supervisor-detail__section-header-row">
            <button
              className="supervisor-detail__section-header"
              onClick={() => toggleSection('novedades')}
            >
              <div className="supervisor-detail__section-info">
                <span className="supervisor__section-title">Novedades</span>
                <span className="supervisor__section-count">{filteredNews.length} registros</span>
              </div>
              <span
                className={`supervisor-detail__arrow ${expandedSection === 'novedades' ? 'supervisor-detail__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>
            <button
              className="supervisor-detail__export-btn"
              onClick={() => handleExport('novedades')}
              disabled={exporting === 'novedades'}
              title="Exportar novedades a CSV"
            >
              <Download size={14} strokeWidth={1.5} />
              {exporting === 'novedades' ? '...' : 'CSV'}
            </button>
          </div>
          {expandedSection === 'novedades' && (
            <div className="supervisor-detail__section-body">
              {filteredNews.length === 0 ? (
                <div className="supervisor-sub__empty">No hay registros de novedades.</div>
              ) : (
                filteredNews.map((n) => (
                  <div key={n.id} className="supervisor-sub__record">
                    <div className="supervisor-sub__record-header">
                      <span className="supervisor-sub__record-date">
                        {n.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <span className="supervisor-sub__record-author">
                        {novedadTipoLabel(n.tipo)}
                        {n.hora ? ` · ${n.hora}` : ''}
                      </span>
                    </div>
                    <p className="supervisor-detail__desc">{n.descripcion}</p>
                    <div className="supervisor-detail__meta">
                      <span className="supervisor-sub__record-author">
                        Cargado por: {n.cargadoPorNombre}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
          <div className="supervisor-detail__section-header-row">
            <button
              className="supervisor-detail__section-header"
              onClick={() => toggleSection('incidentes')}
            >
              <div className="supervisor-detail__section-info">
                <span className="supervisor__section-title">Incidentes</span>
                <span className="supervisor__section-count">
                  {filteredIncidents.length} registros
                </span>
              </div>
              <span
                className={`supervisor-detail__arrow ${expandedSection === 'incidentes' ? 'supervisor-detail__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>
            <button
              className="supervisor-detail__export-btn"
              onClick={() => handleExport('incidentes')}
              disabled={exporting === 'incidentes'}
              title="Exportar incidentes a CSV"
            >
              <Download size={14} strokeWidth={1.5} />
              {exporting === 'incidentes' ? '...' : 'CSV'}
            </button>
          </div>
          {expandedSection === 'incidentes' && (
            <div className="supervisor-detail__section-body">
              {filteredIncidents.length === 0 ? (
                <div className="supervisor-sub__empty">No hay registros de incidentes.</div>
              ) : (
                filteredIncidents.map((inc) => (
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
                        <span className="supervisor-detail__meta-tag">
                          Ubicación: {inc.ubicacion}
                        </span>
                      )}
                    </div>
                    <p className="supervisor-detail__desc">{inc.descripcion}</p>
                    {inc.fotoDataUrl && (
                      <div className="supervisor-detail__incident-photo">
                        <button
                          className="supervisor-detail__foto-btn"
                          onClick={() => setLightbox(inc.fotoDataUrl ?? null)}
                        >
                          <FotoThumb dataUrl={inc.fotoDataUrl} alt="Foto del incidente" />
                        </button>
                      </div>
                    )}
                    <div className="supervisor-detail__incident-footer">
                      <span className="supervisor-sub__record-author">
                        Cargado por: {inc.cargadoPorNombre}
                      </span>
                      <label className="supervisor-detail__status-control">
                        <span className="supervisor-detail__status-label">Estado</span>
                        <select
                          className="supervisor-detail__status-select"
                          value={inc.estado}
                          disabled={statusUpdatingId === inc.id}
                          onChange={(e) =>
                            handleStatusChange(inc.id, e.target.value as IncidentStatus)
                          }
                        >
                          <option
                            value="pendiente"
                            disabled={!canTransitionIncidentStatus(inc.estado, 'pendiente')}
                          >
                            Pendiente
                          </option>
                          <option
                            value="en_analisis"
                            disabled={!canTransitionIncidentStatus(inc.estado, 'en_analisis')}
                          >
                            En análisis
                          </option>
                          <option
                            value="en_gestion"
                            disabled={!canTransitionIncidentStatus(inc.estado, 'en_gestion')}
                          >
                            En gestión
                          </option>
                          <option
                            value="resuelto"
                            disabled={!canTransitionIncidentStatus(inc.estado, 'resuelto')}
                          >
                            Resuelto
                          </option>
                        </select>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
          <button
            className="supervisor-detail__section-header"
            onClick={() => toggleSection('usuarios')}
          >
            <div className="supervisor-detail__section-info">
              <span className="supervisor__section-title">Usuarios</span>
              <span className="supervisor__section-count">{users.length} usuarios</span>
            </div>
            <span
              className={`supervisor-detail__arrow ${expandedSection === 'usuarios' ? 'supervisor-detail__arrow--open' : ''}`}
            >
              ▾
            </span>
          </button>
          {expandedSection === 'usuarios' && (
            <div className="supervisor-detail__section-body">
              {users.length === 0 ? (
                <div className="supervisor-sub__empty">
                  No hay usuarios asignados a esta escuela.
                </div>
              ) : (
                users.map((u) => (
                  <div key={u.uid} className="supervisor-sub__record supervisor-detail__user">
                    <div className="supervisor-sub__record-header">
                      <span className="supervisor-sub__record-date">{u.nombre}</span>
                      <span className="supervisor-detail__user-role">{u.rol}</span>
                    </div>
                    <div className="supervisor-detail__user-meta">
                      <span>{u.email}</span>
                      <span>{u.cargo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
          <button
            className="supervisor-detail__section-header"
            onClick={() => toggleSection('docentes')}
          >
            <div className="supervisor-detail__section-info">
              <span className="supervisor__section-title">Docentes</span>
              <span className="supervisor__section-count">{schoolDocentes.length} docentes</span>
            </div>
            <span
              className={`supervisor-detail__arrow ${expandedSection === 'docentes' ? 'supervisor-detail__arrow--open' : ''}`}
            >
              ▾
            </span>
          </button>
          {expandedSection === 'docentes' && (
            <div className="supervisor-detail__section-body">
              {docenteFeedback && (
                <div
                  className={`supervisor-detail__feedback supervisor-detail__feedback--${docenteFeedback.type}`}
                  role="status"
                >
                  {docenteFeedback.message}
                </div>
              )}

              <form className="supervisor-detail__docente-form" onSubmit={handleAddDocente}>
                <label className="supervisor-detail__docente-field">
                  Nombre
                  <input
                    className="supervisor-detail__docente-input"
                    type="text"
                    placeholder="Nombre del docente"
                    value={docenteFormNombre}
                    onChange={(e) => setDocenteFormNombre(e.target.value)}
                  />
                </label>
                <label className="supervisor-detail__docente-field">
                  Materia (opcional)
                  <input
                    className="supervisor-detail__docente-input"
                    type="text"
                    placeholder="Ej: Matemática"
                    value={docenteFormMateria}
                    onChange={(e) => setDocenteFormMateria(e.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  className="supervisor-detail__docente-submit"
                  disabled={docenteFormSubmitting}
                >
                  {docenteFormSubmitting ? 'Agregando...' : 'Agregar Docente'}
                </button>
              </form>

              {schoolDocentes.length === 0 ? (
                <div className="supervisor-sub__empty">No hay docentes cargados.</div>
              ) : (
                <div className="supervisor-detail__docente-list">
                  {schoolDocentes.map((d) => (
                    <div
                      key={d.id}
                      className={`supervisor-detail__docente ${d.activo === false ? 'supervisor-detail__docente--inactive' : ''}`}
                    >
                      <div className="supervisor-detail__docente-info">
                        <span className="supervisor-detail__docente-name">{d.nombre}</span>
                        <span className="supervisor-detail__docente-materia">
                          {d.materia || 'Docente'}
                        </span>
                      </div>
                      <button
                        className="supervisor-detail__docente-toggle"
                        disabled={docenteUpdatingId === d.id}
                        onClick={() => handleToggleDocente(d.id, d.activo === false)}
                      >
                        {d.activo === false ? 'Activar' : 'Desactivar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
          <button
            className="supervisor-detail__section-header"
            onClick={() => toggleSection('fotos')}
          >
            <div className="supervisor-detail__section-info">
              <span className="supervisor__section-title">Fotos de Planillas</span>
              <span className="supervisor__section-count">{filteredFotos.length} fotos</span>
            </div>
            <span
              className={`supervisor-detail__arrow ${expandedSection === 'fotos' ? 'supervisor-detail__arrow--open' : ''}`}
            >
              ▾
            </span>
          </button>
          {expandedSection === 'fotos' && (
            <div className="supervisor-detail__section-body">
              {filteredFotos.length === 0 ? (
                <div className="supervisor-sub__empty">No hay fotos cargadas.</div>
              ) : (
                <div className="supervisor-detail__fotos-grid">
                  {filteredFotos.map((foto) => (
                    <div key={foto.id} className="supervisor-detail__foto">
                      <button
                        className="supervisor-detail__foto-btn"
                        onClick={() => setLightbox(foto.dataUrl)}
                      >
                        <FotoThumb dataUrl={foto.dataUrl} alt={foto.nombreArchivo} />
                      </button>
                      <div className="supervisor-detail__foto-meta">
                        <span className="supervisor-sub__record-date">
                          {foto.fecha.split('-').reverse().join('/')}
                        </span>
                        <span className="supervisor-sub__record-author">
                          {foto.subidoPorNombre}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          className="supervisor-detail__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          onClick={() => setLightbox(null)}
        >
          <button
            className="supervisor-detail__lightbox-close"
            onClick={() => setLightbox(null)}
            title="Cerrar"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
          <img className="supervisor-detail__lightbox-img" src={lightbox} alt="Foto ampliada" />
        </div>
      )}
    </>
  );
};

export default SupervisorSchoolDetail;
