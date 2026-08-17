import type { NovedadTipo, IncidentCategoria, IncidentUrgencia, IncidentStatus } from '@/types';

export const FEEDBACK_AUTO_CLEAR_MS = 5000;

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
