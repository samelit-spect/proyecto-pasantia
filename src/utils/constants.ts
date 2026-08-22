import type { NovedadTipo, IncidentCategoria, IncidentUrgencia, IncidentStatus } from '@/types';

export const FEEDBACK_AUTO_CLEAR_MS = 8000;

export const NOVEDAD_TIPOS: { value: NovedadTipo; label: string }[] = [
  { value: 'acto', label: 'Acto' },
  { value: 'actividad', label: 'Actividad' },
  { value: 'suspension', label: 'Suspensión de clases' },
  { value: 'evento', label: 'Evento' },
  { value: 'otro', label: 'Otro' },
];

export const INCIDENT_CATEGORIAS: { value: IncidentCategoria; label: string }[] = [
  { value: 'rotura', label: 'Rotura edilicia' },
  { value: 'filtracion', label: 'Filtración' },
  { value: 'falla_servicio', label: 'Falla de servicio' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'otro', label: 'Otro' },
];

export const INCIDENT_URGENCIAS: { value: IncidentUrgencia; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

export function novedadTipoLabel(tipo?: NovedadTipo): string {
  return NOVEDAD_TIPOS.find((t) => t.value === tipo)?.label ?? 'Novedad';
}

export function incidentCategoriaLabel(categoria?: IncidentCategoria): string {
  return INCIDENT_CATEGORIAS.find((c) => c.value === categoria)?.label ?? 'Incidente';
}

export function incidentUrgenciaLabel(urgencia?: IncidentUrgencia): string {
  return INCIDENT_URGENCIAS.find((u) => u.value === urgencia)?.label ?? '';
}

export const INCIDENT_STATUS_ORDER: IncidentStatus[] = [
  'pendiente',
  'en_analisis',
  'en_gestion',
  'resuelto',
];

export function canTransitionIncidentStatus(
  current: IncidentStatus,
  next: IncidentStatus
): boolean {
  return INCIDENT_STATUS_ORDER.indexOf(next) > INCIDENT_STATUS_ORDER.indexOf(current);
}

/**
 * Política de retención anual: la base de datos gratuita se vacía al cierre
 * del año. El aviso se muestra al supervisor durante los días previos.
 */
export const RETENTION_WARNING_DAYS_BEFORE = 60;

export function getYearEndPurgeDate(now = new Date()): Date {
  return new Date(now.getFullYear(), 11, 31);
}

export function daysUntilYearEndPurge(now = new Date()): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const purge = startOfDay(getYearEndPurgeDate(now));
  const today = startOfDay(now);
  return Math.round((purge.getTime() - today.getTime()) / 86_400_000);
}

export function shouldShowRetentionWarning(now = new Date()): boolean {
  const days = daysUntilYearEndPurge(now);
  return days >= 0 && days <= RETENTION_WARNING_DAYS_BEFORE;
}
