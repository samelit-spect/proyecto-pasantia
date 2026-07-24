import type { Timestamp } from 'firebase/firestore';

export type IncidentStatus = 'pendiente' | 'en_analisis' | 'en_gestion' | 'resuelto';

export interface Incident {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
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
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
}
