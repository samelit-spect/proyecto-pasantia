import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useParams, useNavigate, useViewTransitionState } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  History,
  ClipboardCheck,
  Users,
  Newspaper,
  AlertTriangle,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
  getSchoolById,
  subscribeAttendancesBySchool,
  subscribeNewsBySchool,
  subscribeIncidentsBySchool,
  subscribeDocenteAttendancesBySchool,
  getUsersBySchool,
  updateIncidentStatus,
  getDocentesBySchool,
  addDocente,
  updateDocente,
  setDocenteActive,
  subscribeFotosBySchool,
  deleteFoto,
  setAttendanceVerified,
  setDocenteAttendanceVerified,
  getAttendancesBySchool,
  getDocenteAttendancesBySchool,
  getNewsBySchool,
  getIncidentsBySchool as getIncidentsBySchoolRange,
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
import DatePicker from '@/components/common/DatePicker/DatePicker';
import SchoolDetailAttendances from '@/components/supervisor/SchoolDetailAttendances/SchoolDetailAttendances';
import SchoolDetailNews from '@/components/supervisor/SchoolDetailNews/SchoolDetailNews';
import SchoolDetailIncidents from '@/components/supervisor/SchoolDetailIncidents/SchoolDetailIncidents';
import SchoolDetailUsers from '@/components/supervisor/SchoolDetailUsers/SchoolDetailUsers';
import SchoolDetailDocentes from '@/components/supervisor/SchoolDetailDocentes/SchoolDetailDocentes';
import SchoolDetailFotos from '@/components/supervisor/SchoolDetailFotos/SchoolDetailFotos';
import Lightbox from '@/components/supervisor/Lightbox/Lightbox';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import useFeedback from '@/hooks/useFeedback';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SupervisorDetailSkeleton } from './SupervisorSkeleton';
import { downloadCsv } from '@/utils/exportCsv';
import { dateKey } from '@/utils/dateKey';
import { novedadTipoLabel, incidentCategoriaLabel, incidentUrgenciaLabel } from '@/utils/constants';
import './SupervisorSchoolDetail.css';

const DEFAULT_RANGE_START = new Date(2000, 0, 1);
type ViewMode = 'hoy' | 'historico';
type ExportType = 'asistencias' | 'docentes' | 'novedades' | 'incidentes';

const dateToLabel = (d: Date) => d.toLocaleDateString('es-AR');

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
  const [viewMode, setViewMode] = useState<ViewMode>('hoy');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [confirmDeleteFoto, setConfirmDeleteFoto] = useState<string | null>(null);

  const statusOp = useFeedback();
  const verifyOp = useFeedback();
  const docenteOp = useFeedback();

  const [docenteFormNombre, setDocenteFormNombre] = useState('');
  const [docenteFormMateria, setDocenteFormMateria] = useState('');
  const [docenteFormSubmitting, setDocenteFormSubmitting] = useState(false);
  const [editingDocente, setEditingDocente] = useState<Docente | null>(null);

  // True mientras la navegación entrante proviene del click en una card de escuela.
  const isEnteringViaCard = useViewTransitionState(`/supervisor/escuela/${schoolId}`);

  useEffect(() => {
    if (!schoolId) return;
    let unmounted = false;

    const loadStatic = async () => {
      try {
        const [schoolData, usersData, docentesData] = await Promise.all([
          getSchoolById(schoolId),
          getUsersBySchool(schoolId),
          getDocentesBySchool(schoolId),
        ]);

        if (unmounted) return;
        setSchool(schoolData);
        setUsers(usersData);
        setDocentes(docentesData);
      } catch {
        if (!unmounted) setError('No se pudieron cargar los datos de la escuela.');
      } finally {
        if (!unmounted) setIsLoading(false);
      }
    };

    loadStatic();

    const unsubAttendances = subscribeAttendancesBySchool(schoolId, (data) => {
      if (!unmounted) setAttendances(data);
    });
    const unsubNews = subscribeNewsBySchool(schoolId, (data) => {
      if (!unmounted) setNews(data);
    });
    const unsubIncidents = subscribeIncidentsBySchool(schoolId, (data) => {
      if (!unmounted) setIncidents(data);
    });

    const unsubDocenteAttendances = subscribeDocenteAttendancesBySchool(schoolId, (data) => {
      if (!unmounted) setDocenteAttendances(data);
    });

    const unsubFotos = subscribeFotosBySchool(schoolId, (data) => {
      if (!unmounted) setFotos(data);
    });

    return () => {
      unmounted = true;
      unsubAttendances();
      unsubNews();
      unsubIncidents();
      unsubDocenteAttendances();
      unsubFotos();
    };
  }, [schoolId]);

  if (isLoading) {
    return <SupervisorDetailSkeleton />;
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

  const inRange = (ts: { toDate: () => Date }) =>
    (!dateFrom || dateKey(ts) >= dateFrom) && (!dateTo || dateKey(ts) <= dateTo);

  const filteredAttendances = attendances.filter((a) => inRange(a.fecha));
  const filteredNews = news.filter((n) => inRange(n.fecha));
  const filteredIncidents = incidents.filter((i) => inRange(i.fecha));
  const filteredDocenteAttendances = docenteAttendances.filter((a) => inRange(a.fecha));

  const inDateRange = (fecha: string) =>
    (!dateFrom || fecha >= dateFrom) && (!dateTo || fecha <= dateTo);
  const filteredFotos = fotos.filter((f) => inDateRange(f.fecha));

  const todayKey = dateKey({ toDate: () => new Date() });
  const todayAttendances = attendances.filter((a) => dateKey(a.fecha) === todayKey);
  const todayNews = news.filter((n) => dateKey(n.fecha) === todayKey);
  const todayIncidents = incidents.filter((i) => dateKey(i.fecha) === todayKey);
  const todayDocenteAttendances = docenteAttendances.filter((a) => dateKey(a.fecha) === todayKey);

  const handleAddDocente = async (e: React.FormEvent) => {
    e.preventDefault();
    docenteOp.clear();

    if (!schoolId) return;

    if (!docenteFormNombre.trim()) {
      docenteOp.end({ type: 'error', message: 'Ingresá el nombre del docente.' });
      return;
    }

    setDocenteFormSubmitting(true);
    try {
      if (editingDocente) {
        await updateDocente(
          editingDocente.id,
          {
            nombre: docenteFormNombre.trim(),
            materia: docenteFormMateria.trim(),
          },
          profile ? { uid: profile.uid, nombre: profile.nombre } : undefined
        );
        docenteOp.end({ type: 'success', message: 'Docente actualizado correctamente.' });
      } else {
        await addDocente(
          {
            nombre: docenteFormNombre.trim(),
            materia: docenteFormMateria.trim() || undefined,
            escuelaId: schoolId,
          },
          profile ? { uid: profile.uid, nombre: profile.nombre } : undefined
        );
        docenteOp.end({ type: 'success', message: 'Docente agregado correctamente.' });
      }
      const updated = await getDocentesBySchool(schoolId);
      setDocentes(updated);
      setDocenteFormNombre('');
      setDocenteFormMateria('');
      setEditingDocente(null);
    } catch {
      docenteOp.end({
        type: 'error',
        message: editingDocente
          ? 'No se pudo actualizar el docente.'
          : 'No se pudo agregar el docente.',
      });
    } finally {
      setDocenteFormSubmitting(false);
    }
  };

  const handleEditDocente = (docente: Docente) => {
    setEditingDocente(docente);
    setDocenteFormNombre(docente.nombre);
    setDocenteFormMateria(docente.materia || '');
    docenteOp.clear();
  };

  const handleToggleDocente = async (docenteId: string, activo: boolean) => {
    docenteOp.start(docenteId);

    try {
      await setDocenteActive(
        docenteId,
        activo,
        profile ? { uid: profile.uid, nombre: profile.nombre } : undefined
      );
      setDocentes((prev) => prev.map((d) => (d.id === docenteId ? { ...d, activo } : d)));
      docenteOp.end(null);
    } catch {
      docenteOp.end({ type: 'error', message: 'No se pudo actualizar el docente.' });
    }
  };

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    if (!profile) return;
    const estadoAnterior = incidents.find((inc) => inc.id === incidentId)?.estado;
    statusOp.start(incidentId);

    try {
      await updateIncidentStatus(
        incidentId,
        newStatus,
        { uid: profile.uid, nombre: profile.nombre },
        estadoAnterior
      );
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incidentId ? { ...inc, estado: newStatus } : inc))
      );
      statusOp.end({ type: 'success', message: 'Estado del incidente actualizado.' });
    } catch {
      statusOp.end({ type: 'error', message: 'No se pudo actualizar el estado.' });
    }
  };

  const makeVerifyHandler =
    <T extends { id: string }>(
      apiCall: (id: string, v: boolean, p: { uid: string; nombre: string }) => Promise<void>,
      setState: React.Dispatch<React.SetStateAction<T[]>>,
      updater: (att: T, verified: boolean) => T
    ) =>
    async (attendanceId: string, verified: boolean) => {
      if (!profile) return;
      verifyOp.start(attendanceId);

      try {
        await apiCall(attendanceId, verified, {
          uid: profile.uid,
          nombre: profile.nombre,
        });
        setState((prev: T[]) =>
          prev.map((att) => (att.id === attendanceId ? updater(att, verified) : att))
        );
        verifyOp.end({
          type: 'success',
          message: verified ? 'Asistencia verificada.' : 'Verificación removida.',
        });
      } catch {
        verifyOp.end({ type: 'error', message: 'No se pudo actualizar la verificación.' });
      }
    };

  const verifyAttendanceUpdater = (att: Attendance, verified: boolean): Attendance => ({
    ...att,
    verificada: verified,
    verificadoPor: verified ? profile!.uid : undefined,
    verificadoPorNombre: verified ? profile!.nombre : undefined,
    verificadoEn: verified ? Timestamp.now() : undefined,
  });

  const verifyDocenteUpdater = (att: DocenteAttendance, verified: boolean): DocenteAttendance => ({
    ...att,
    verificada: verified,
    verificadoPor: verified ? profile!.uid : undefined,
    verificadoPorNombre: verified ? profile!.nombre : undefined,
    verificadoEn: verified ? Timestamp.now() : undefined,
  });

  const handleVerifyAttendance = makeVerifyHandler(
    setAttendanceVerified,
    setAttendances,
    verifyAttendanceUpdater
  );
  const handleVerifyDocenteAttendance = makeVerifyHandler(
    setDocenteAttendanceVerified,
    setDocenteAttendances,
    verifyDocenteUpdater
  );

  const handleExport = async (type: ExportType) => {
    if (!schoolId || !school) return;
    verifyOp.clear();
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
          ['Fecha', 'Cargado por', 'Foto', 'Verificada'],
          rows.map((a) => [
            dateToLabel(a.fecha.toDate()),
            a.cargadoPorNombre,
            a.fotoDataUrl ? 'Sí' : 'No',
            a.verificada ? 'Sí' : 'No',
          ])
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
        const rows = await getIncidentsBySchoolRange(schoolId, from, to);
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

      verifyOp.end({ type: 'success', message: 'Exportación generada correctamente.' });
    } catch {
      verifyOp.end({ type: 'error', message: 'No se pudo exportar. Intentá de nuevo.' });
    } finally {
      setExporting(null);
    }
  };

  const handleDeleteFotoConfirm = async () => {
    if (!confirmDeleteFoto) return;
    const fotoId = confirmDeleteFoto;
    setConfirmDeleteFoto(null);
    try {
      await deleteFoto(fotoId);
      setFotos((prev) => prev.filter((f) => f.id !== fotoId));
      statusOp.end({ type: 'success', message: 'Foto eliminada.' });
    } catch {
      statusOp.end({ type: 'error', message: 'No se pudo eliminar la foto.' });
    }
  };

  return (
    <div className="animate-fade-in">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Escuelas', to: '/supervisor' },
          { label: school.nombre },
        ]}
      />
      <div className={`supervisor__header ${isEnteringViaCard ? 'supervisor__header--hero' : ''}`}>
        <button
          className="supervisor__header-back"
          onClick={() => navigate('/supervisor', { viewTransition: true })}
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">{school.nombre}</h2>
      </div>
      <p className="supervisor__subtitle">
        Turno: {school.turno} · {users.length} usuarios · {docentes.length} docentes
      </p>

      {statusOp.feedback && (
        <div
          className={`supervisor-detail__feedback supervisor-detail__feedback--${statusOp.feedback.type}`}
          role="status"
        >
          {statusOp.feedback.message}
        </div>
      )}

      {verifyOp.feedback && (
        <div
          className={`supervisor-detail__feedback supervisor-detail__feedback--${verifyOp.feedback.type}`}
          role="status"
        >
          {verifyOp.feedback.message}
        </div>
      )}

      <div className="supervisor-detail__tabs">
        <button
          className={`supervisor-detail__tab ${viewMode === 'hoy' ? 'supervisor-detail__tab--active' : ''}`}
          onClick={() => setViewMode('hoy')}
        >
          <CalendarDays size={15} strokeWidth={1.5} />
          Hoy
        </button>
        <button
          className={`supervisor-detail__tab ${viewMode === 'historico' ? 'supervisor-detail__tab--active' : ''}`}
          onClick={() => setViewMode('historico')}
        >
          <History size={15} strokeWidth={1.5} />
          Histórico
        </button>
      </div>

      {viewMode === 'hoy' && (
        <div className="supervisor-detail__today">
          <p className="supervisor-detail__today-date">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div className="supervisor-detail__today-grid">
            <div className="supervisor-detail__today-card supervisor-detail__today-card--asistencia">
              <div className="supervisor-detail__today-card-icon">
                <ClipboardCheck size={20} strokeWidth={1.5} />
              </div>
              <div className="supervisor-detail__today-card-header">
                <span className="supervisor-detail__today-card-count">
                  {todayAttendances.length}
                </span>
                <span className="supervisor-detail__today-card-label">Asistencia de gestión</span>
              </div>
              {todayAttendances.length === 0 ? (
                <span className="supervisor-detail__today-empty">Sin registros hoy</span>
              ) : (
                <div className="supervisor-detail__today-list">
                  {todayAttendances.map((a) => (
                    <div key={a.id} className="supervisor-detail__today-item">
                      <span>{a.cargadoPorNombre}</span>
                      <span className="supervisor-detail__today-item-detail">
                        {a.registros.filter((r) => r.presente).length}/{a.registros.length}{' '}
                        presentes
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="supervisor-detail__today-card supervisor-detail__today-card--docentes">
              <div className="supervisor-detail__today-card-icon">
                <Users size={20} strokeWidth={1.5} />
              </div>
              <div className="supervisor-detail__today-card-header">
                <span className="supervisor-detail__today-card-count">
                  {todayDocenteAttendances.length}
                </span>
                <span className="supervisor-detail__today-card-label">
                  Asistencia del profesorado
                </span>
              </div>
              {todayDocenteAttendances.length === 0 ? (
                <span className="supervisor-detail__today-empty">Sin registros hoy</span>
              ) : (
                <div className="supervisor-detail__today-list">
                  {todayDocenteAttendances.map((a) => (
                    <div key={a.id} className="supervisor-detail__today-item">
                      <span>{a.cargadoPorNombre}</span>
                      <span className="supervisor-detail__today-item-detail">
                        {a.fotoDataUrl ? '📷 Con foto' : 'Sin foto'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="supervisor-detail__today-card supervisor-detail__today-card--novedades">
              <div className="supervisor-detail__today-card-icon">
                <Newspaper size={20} strokeWidth={1.5} />
              </div>
              <div className="supervisor-detail__today-card-header">
                <span className="supervisor-detail__today-card-count">{todayNews.length}</span>
                <span className="supervisor-detail__today-card-label">Novedades</span>
              </div>
              {todayNews.length === 0 ? (
                <span className="supervisor-detail__today-empty">Sin registros hoy</span>
              ) : (
                <div className="supervisor-detail__today-list">
                  {todayNews.map((n) => (
                    <div key={n.id} className="supervisor-detail__today-item">
                      <span className="supervisor-detail__today-item-desc">{n.descripcion}</span>
                      <span className="supervisor-detail__today-item-detail">
                        {novedadTipoLabel(n.tipo)}
                        {n.hora ? ` · ${n.hora}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="supervisor-detail__today-card supervisor-detail__today-card--incidentes">
              <div className="supervisor-detail__today-card-icon">
                <AlertTriangle size={20} strokeWidth={1.5} />
              </div>
              <div className="supervisor-detail__today-card-header">
                <span className="supervisor-detail__today-card-count">{todayIncidents.length}</span>
                <span className="supervisor-detail__today-card-label">Accidentes edilicios</span>
              </div>
              {todayIncidents.length === 0 ? (
                <span className="supervisor-detail__today-empty">Sin registros hoy</span>
              ) : (
                <div className="supervisor-detail__today-list">
                  {todayIncidents.map((inc) => (
                    <div key={inc.id} className="supervisor-detail__today-item">
                      <span className="supervisor-detail__today-item-desc">{inc.descripcion}</span>
                      <span className="supervisor-detail__today-item-detail">
                        {incidentCategoriaLabel(inc.categoria)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'historico' && (
        <>
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
            <SchoolDetailAttendances
              sectionId="asistencias"
              title="Asistencia de gestión"
              records={filteredAttendances}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('asistencias')}
              onVerify={handleVerifyAttendance}
              verifyUpdatingId={verifyOp.updatingId}
              onExport={() => handleExport('asistencias')}
              exporting={exporting === 'asistencias'}
            />

            <SchoolDetailAttendances
              sectionId="asistencia-docentes"
              title="Asistencia del profesorado"
              records={filteredDocenteAttendances}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('asistencia-docentes')}
              onVerify={handleVerifyDocenteAttendance}
              verifyUpdatingId={verifyOp.updatingId}
              onExport={() => handleExport('docentes')}
              exporting={exporting === 'docentes'}
            />

            <SchoolDetailNews
              news={filteredNews}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('novedades')}
              onExport={() => handleExport('novedades')}
              exporting={exporting === 'novedades'}
            />

            <SchoolDetailIncidents
              incidents={filteredIncidents}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('incidentes')}
              onStatusChange={handleStatusChange}
              statusUpdatingId={statusOp.updatingId}
              onLightbox={setLightbox}
              onExport={() => handleExport('incidentes')}
              exporting={exporting === 'incidentes'}
            />

            <SchoolDetailUsers
              users={users}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('usuarios')}
            />

            <SchoolDetailDocentes
              docentes={docentes}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('docentes')}
              formNombre={docenteFormNombre}
              formMateria={docenteFormMateria}
              formSubmitting={docenteFormSubmitting}
              feedback={docenteOp.feedback}
              updatingId={docenteOp.updatingId}
              onNombreChange={setDocenteFormNombre}
              onMateriaChange={setDocenteFormMateria}
              onSubmit={handleAddDocente}
              onToggleDocente={handleToggleDocente}
              onEditDocente={handleEditDocente}
              isEditing={!!editingDocente}
            />

            <SchoolDetailFotos
              fotos={filteredFotos}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('fotos')}
              onLightbox={setLightbox}
              onDelete={(fotoId) => setConfirmDeleteFoto(fotoId)}
            />
          </div>
        </>
      )}

      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDeleteFoto}
        title="Eliminar foto"
        message="¿Seguro que querés eliminar esta foto?"
        confirmLabel="Eliminar"
        onConfirm={handleDeleteFotoConfirm}
        onCancel={() => setConfirmDeleteFoto(null)}
      />
    </div>
  );
};

export default SupervisorSchoolDetail;
