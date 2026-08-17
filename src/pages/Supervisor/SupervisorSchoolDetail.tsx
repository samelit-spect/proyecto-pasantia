import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
  getIncidentsBySchool as getIncidentsBySchoolRange,
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
import DatePicker from '@/components/common/DatePicker/DatePicker';
import SchoolDetailAttendances from '@/components/supervisor/SchoolDetailAttendances/SchoolDetailAttendances';
import SchoolDetailNews from '@/components/supervisor/SchoolDetailNews/SchoolDetailNews';
import SchoolDetailIncidents from '@/components/supervisor/SchoolDetailIncidents/SchoolDetailIncidents';
import SchoolDetailUsers from '@/components/supervisor/SchoolDetailUsers/SchoolDetailUsers';
import SchoolDetailDocentes from '@/components/supervisor/SchoolDetailDocentes/SchoolDetailDocentes';
import SchoolDetailFotos from '@/components/supervisor/SchoolDetailFotos/SchoolDetailFotos';
import Lightbox from '@/components/supervisor/Lightbox/Lightbox';
import useFeedback from '@/hooks/useFeedback';
import { downloadCsv } from '@/utils/exportCsv';
import { dateKey } from '@/utils/dateKey';
import {
  novedadTipoLabel,
  incidentCategoriaLabel,
  incidentUrgenciaLabel,
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportType | null>(null);

  const statusOp = useFeedback();
  const verifyOp = useFeedback();
  const docenteOp = useFeedback();

  const [docenteFormNombre, setDocenteFormNombre] = useState('');
  const [docenteFormMateria, setDocenteFormMateria] = useState('');
  const [docenteFormSubmitting, setDocenteFormSubmitting] = useState(false);

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

  const inRange = (ts: { toDate: () => Date }) =>
    (!dateFrom || dateKey(ts) >= dateFrom) && (!dateTo || dateKey(ts) <= dateTo);

  const filteredAttendances = attendances.filter((a) => inRange(a.fecha));
  const filteredNews = news.filter((n) => inRange(n.fecha));
  const filteredIncidents = incidents.filter((i) => inRange(i.fecha));
  const filteredDocenteAttendances = docenteAttendances.filter((a) => inRange(a.fecha));

  const inDateRange = (fecha: string) =>
    (!dateFrom || fecha >= dateFrom) && (!dateTo || fecha <= dateTo);
  const filteredFotos = fotos.filter((f) => inDateRange(f.fecha));

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
      await addDocente({
        nombre: docenteFormNombre.trim(),
        materia: docenteFormMateria.trim() || undefined,
        escuelaId: schoolId,
      });
      const updated = await getDocentesBySchool(schoolId);
      setDocentes(updated);
      setDocenteFormNombre('');
      setDocenteFormMateria('');
      docenteOp.end({ type: 'success', message: 'Docente agregado correctamente.' });
    } catch {
      docenteOp.end({ type: 'error', message: 'No se pudo agregar el docente.' });
    } finally {
      setDocenteFormSubmitting(false);
    }
  };

  const handleToggleDocente = async (docenteId: string, activo: boolean) => {
    docenteOp.start(docenteId);

    try {
      await setDocenteActive(docenteId, activo);
      setDocentes((prev) => prev.map((d) => (d.id === docenteId ? { ...d, activo } : d)));
      docenteOp.end(null);
    } catch {
      docenteOp.end({ type: 'error', message: 'No se pudo actualizar el docente.' });
    }
  };

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    statusOp.start(incidentId);

    try {
      await updateIncidentStatus(incidentId, newStatus);
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incidentId ? { ...inc, estado: newStatus } : inc))
      );
      statusOp.end({ type: 'success', message: 'Estado del incidente actualizado.' });
    } catch {
      statusOp.end({ type: 'error', message: 'No se pudo actualizar el estado.' });
    }
  };

  const makeVerifyHandler = <T extends { id: string }>(
    apiCall: (id: string, v: boolean, p: { uid: string; nombre: string }) => Promise<void>,
    setState: React.Dispatch<React.SetStateAction<T[]>>,
    updater: (att: T, verified: boolean) => T,
  ) => async (attendanceId: string, verified: boolean) => {
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

  const handleVerifyAttendance = makeVerifyHandler(setAttendanceVerified, setAttendances, verifyAttendanceUpdater);
  const handleVerifyDocenteAttendance = makeVerifyHandler(setDocenteAttendanceVerified, setDocenteAttendances, verifyDocenteUpdater);

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

  return (
    <>
      <div className="supervisor__header">
        <button className="supervisor__back" onClick={() => navigate('/supervisor')}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">{school.nombre}</h2>
      </div>
      <p className="supervisor__subtitle">
        Turno: {school.turno} · {users.length} usuarios · {docentes.length} docentes ·{' '}
        {attendances.length +
          news.length +
          incidents.length +
          docenteAttendances.length +
          fotos.length}{' '}
        registros
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
          title="Asistencias"
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
          title="Asistencia de Docentes"
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
        />

        <SchoolDetailFotos
          fotos={filteredFotos}
          expandedSection={expandedSection ?? ''}
          onToggle={() => toggleSection('fotos')}
          onLightbox={setLightbox}
        />
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
};

export default SupervisorSchoolDetail;
