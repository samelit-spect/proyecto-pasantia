import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getSchoolById,
  getAllAttendancesBySchool,
  getAllNewsBySchool,
  getIncidentsBySchool,
  getUsersBySchool,
  updateIncidentStatus,
  getAllDocentes,
  addDocente,
  setDocenteActive,
  getDocenteAttendancesBySchool,
  getFotosBySchool,
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
import './SupervisorSchoolDetail.css';

const SupervisorSchoolDetail = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();

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
          getAllDocentes(),
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
  const schoolDocentes = docentes.filter((d) => d.escuelaId === schoolId);

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
      const updated = await getAllDocentes();
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
                        Cargado por: {n.cargadoPorNombre}
                      </span>
                    </div>
                    <p className="supervisor-detail__desc">{n.descripcion}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
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
                    <p className="supervisor-detail__desc">{inc.descripcion}</p>
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
                          <option value="pendiente">Pendiente</option>
                          <option value="en_analisis">En análisis</option>
                          <option value="en_gestion">En gestión</option>
                          <option value="resuelto">Resuelto</option>
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
                      <FotoThumb storagePath={foto.storagePath} alt={foto.nombreArchivo} />
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
    </>
  );
};

export default SupervisorSchoolDetail;
