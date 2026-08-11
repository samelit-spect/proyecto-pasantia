import type { Timestamp } from 'firebase/firestore';

export type IncidentStatus = 'pendiente' | 'en_analisis' | 'en_gestion' | 'resuelto';

export type IncidentCategoria =
  'rotura' | 'filtracion' | 'falla_servicio' | 'urgencia' | 'seguridad' | 'otro';

export type IncidentUrgencia = 'baja' | 'media' | 'alta';

export interface Incident {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  categoria?: IncidentCategoria;
  urgencia?: IncidentUrgencia;
  ubicacion?: string;
  fotoDataUrl?: string;
  descripcion: string;
  estado: IncidentStatus;
  cargadoPor: string;
  cargadoPorNombre: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface AddIncidentDTO {
  escuelaId: string;
  fecha: Date;
  categoria: IncidentCategoria;
  urgencia: IncidentUrgencia;
  ubicacion?: string;
  fotoDataUrl?: string;
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
}
