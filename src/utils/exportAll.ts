import { downloadCsv } from '@/utils/exportCsv';
import {
  getSchools,
  getAllAttendances,
  getAllDocenteAttendances,
  getAllNews,
  getAllIncidents,
} from '@/services/api/firestore';
import { novedadTipoLabel, incidentCategoriaLabel, incidentUrgenciaLabel } from '@/utils/constants';
import type { Attendance, DocenteAttendance, News, Incident, IncidentStatus } from '@/types';

const ESTADO_LABELS: Record<IncidentStatus, string> = {
  pendiente: 'Pendiente',
  en_analisis: 'En análisis',
  en_gestion: 'En gestión',
  resuelto: 'Resuelto',
};

const toDateLabel = (d: Date) => d.toLocaleDateString('es-AR');

export interface ExportAllProgress {
  current: number;
  total: number;
  label: string;
}

export interface ExportAllOptions {
  dateFrom?: string;
  dateTo?: string;
  onProgress?: (progress: ExportAllProgress) => void;
}

const parseDate = (key?: string, endOfDay?: boolean): Date | undefined => {
  if (!key) return undefined;
  return new Date(`${key}${endOfDay ? 'T23:59:59' : 'T00:00:00'}`);
};

const attendanceDetail = (att: Attendance) =>
  att.registros
    .map((r) =>
      r.presente ? `${r.nombre} (P)` : `${r.nombre} (A${r.motivo ? `: ${r.motivo}` : ''})`
    )
    .join('; ');

export async function exportAllData({
  dateFrom,
  dateTo,
  onProgress,
}: ExportAllOptions = {}): Promise<number> {
  const rangeLabel = `${dateFrom || 'inicio'}-${dateTo || 'hoy'}`;
  const filenameBase = `sipnam-completo-${rangeLabel}`;

  const TOTAL_STEPS = 5;

  let step = 0;
  const report = async (label: string) => {
    step += 1;
    onProgress?.({ current: step, total: TOTAL_STEPS, label });
    // Cede el hilo para que la UI pinte el progreso antes de cada consulta.
    await new Promise((resolve) => setTimeout(resolve, 30));
  };

  await report('Escuelas');
  const schools = await getSchools();
  const schoolNames = new Map(schools.map((s) => [s.id, s.nombre]));
  const schoolNameOf = (escuelaId: string) => schoolNames.get(escuelaId) ?? 'Escuela desconocida';

  await report('Asistencias de gestión');
  const attendances = await getAllAttendances(parseDate(dateFrom), parseDate(dateTo, true));
  downloadCsv(
    `${filenameBase}-asistencias-gestion.csv`,
    ['Escuela', 'Fecha', 'Cargado por', 'Presentes', 'Ausentes', 'Detalle', 'Verificada'],
    attendances.map((a) => {
      const presentes = a.registros.filter((r) => r.presente).length;
      return [
        schoolNameOf(a.escuelaId),
        toDateLabel(a.fecha.toDate()),
        a.cargadoPorNombre,
        presentes,
        a.registros.length - presentes,
        attendanceDetail(a),
        a.verificada ? 'Sí' : 'No',
      ];
    })
  );

  await report('Asistencias de docentes');
  const docenteAttendances = await getAllDocenteAttendances(
    parseDate(dateFrom),
    parseDate(dateTo, true)
  );
  downloadCsv(
    `${filenameBase}-asistencia-docentes.csv`,
    ['Escuela', 'Fecha', 'Cargado por', 'Con foto', 'Verificada'],
    docenteAttendances.map((a: DocenteAttendance) => [
      schoolNameOf(a.escuelaId),
      toDateLabel(a.fecha.toDate()),
      a.cargadoPorNombre,
      a.fotoDataUrl ? 'Sí' : 'No',
      a.verificada ? 'Sí' : 'No',
    ])
  );

  await report('Novedades');
  const news = await getAllNews(parseDate(dateFrom), parseDate(dateTo, true));
  downloadCsv(
    `${filenameBase}-novedades.csv`,
    ['Escuela', 'Fecha', 'Tipo', 'Hora', 'Descripción', 'Cargado por'],
    news.map((n: News) => [
      schoolNameOf(n.escuelaId),
      toDateLabel(n.fecha.toDate()),
      novedadTipoLabel(n.tipo),
      n.hora || '',
      n.descripcion,
      n.cargadoPorNombre,
    ])
  );

  await report('Incidentes');
  const incidents = await getAllIncidents(parseDate(dateFrom), parseDate(dateTo, true));
  downloadCsv(
    `${filenameBase}-incidentes.csv`,
    [
      'Escuela',
      'Fecha',
      'Categoría',
      'Urgencia',
      'Ubicación',
      'Estado',
      'Descripción',
      'Cargado por',
    ],
    incidents.map((i: Incident) => [
      schoolNameOf(i.escuelaId),
      toDateLabel(i.fecha.toDate()),
      incidentCategoriaLabel(i.categoria),
      i.urgencia ? incidentUrgenciaLabel(i.urgencia) : '',
      i.ubicacion || '',
      ESTADO_LABELS[i.estado],
      i.descripcion,
      i.cargadoPorNombre,
    ])
  );

  return TOTAL_STEPS;
}
