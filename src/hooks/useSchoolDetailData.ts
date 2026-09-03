import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import useFeedback from '@/hooks/useFeedback';
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
import { downloadCsv } from '@/utils/exportCsv';
import { dateKey } from '@/utils/dateKey';
import { novedadTipoLabel, incidentCategoriaLabel, incidentUrgenciaLabel } from '@/utils/constants';

const DEFAULT_RANGE_START = new Date(2000, 0, 1);

// El cambio de estado de un incidente no puede quedar esperando a la red para
// siempre: si Firestore no responde, el <select> quedaría deshabilitado y la
// UI "trabada". Se acota el tiempo de espera y se reabre el control.
const INCIDENT_STATUS_CHANGE_TIMEOUT_MS = 15000;

const withStatusChangeTimeout = (op: Promise<void>, ms: number): Promise<void> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    op.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });

export type ViewMode = 'hoy' | 'historico';
export type ExportType = 'asistencias' | 'docentes' | 'novedades' | 'incidentes';

const dateToLabel = (d: Date) => d.toLocaleDateString('es-AR');

interface UseSchoolDetailDataOptions {
  schoolId?: string;
  profile?: UserProfile | null;
}

export const useSchoolDetailData = ({ schoolId, profile }: UseSchoolDetailDataOptions) => {
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

  // Hooks de feedback separados por operación: no comparten estado de carga.
  const statusOp = useFeedback();
  const verifyOp = useFeedback();
  const fotoOp = useFeedback();
  const exportOp = useFeedback();
  const docenteOp = useFeedback();

  const [docenteFormNombre, setDocenteFormNombre] = useState('');
  const [docenteFormMateria, setDocenteFormMateria] = useState('');
  const [docenteFormSubmitting, setDocenteFormSubmitting] = useState(false);
  const [editingDocente, setEditingDocente] = useState<Docente | null>(null);

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
      await withStatusChangeTimeout(
        updateIncidentStatus(
          incidentId,
          newStatus,
          { uid: profile.uid, nombre: profile.nombre },
          estadoAnterior
        ),
        INCIDENT_STATUS_CHANGE_TIMEOUT_MS
      );
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incidentId ? { ...inc, estado: newStatus } : inc))
      );
      statusOp.end({ type: 'success', message: 'Estado del incidente actualizado.' });
    } catch (err) {
      statusOp.end({
        type: 'error',
        message:
          err instanceof Error && err.message === 'timeout'
            ? 'La actualización está tardando demasiado. Si el estado no cambió, probá de nuevo.'
            : 'No se pudo actualizar el estado.',
      });
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
    exportOp.clear();
    setExporting(type);

    try {
      const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : DEFAULT_RANGE_START;
      const to = dateTo ? new Date(`${dateTo}T23:59:59`) : new Date();
      const schoolSlug = school.nombre.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const rangeLabel = `${dateFrom || 'inicio'}-${dateTo || 'hoy'}`;

      if (type === 'asistencias') {
        const rows = await getAttendancesBySchool(schoolId, from, to);
        await downloadCsv(
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
        await downloadCsv(
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
        await downloadCsv(
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
        await downloadCsv(
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

      exportOp.end({ type: 'success', message: 'Exportación generada correctamente.' });
    } catch {
      exportOp.end({ type: 'error', message: 'No se pudo exportar. Intentá de nuevo.' });
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
      fotoOp.end({ type: 'success', message: 'Foto eliminada.' });
    } catch {
      fotoOp.end({ type: 'error', message: 'No se pudo eliminar la foto.' });
    }
  };

  return {
    isLoading,
    error,
    school,
    users,
    docentes,
    filteredAttendances,
    filteredNews,
    filteredIncidents,
    filteredDocenteAttendances,
    filteredFotos,
    todayAttendances,
    todayNews,
    todayIncidents,
    todayDocenteAttendances,
    expandedSection,
    viewMode,
    setViewMode,
    toggleSection,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    lightbox,
    setLightbox,
    exporting,
    confirmDeleteFoto,
    setConfirmDeleteFoto,
    statusOp,
    verifyOp,
    fotoOp,
    exportOp,
    docenteOp,
    docenteFormNombre,
    setDocenteFormNombre,
    docenteFormMateria,
    setDocenteFormMateria,
    docenteFormSubmitting,
    editingDocente,
    handleAddDocente,
    handleEditDocente,
    handleToggleDocente,
    handleStatusChange,
    handleVerifyAttendance,
    handleVerifyDocenteAttendance,
    handleExport,
    handleDeleteFotoConfirm,
  };
};
