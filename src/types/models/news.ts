import type { Timestamp } from 'firebase/firestore';

export type NovedadTipo = 'acto' | 'actividad' | 'suspension' | 'evento' | 'otro';

export interface News {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  tipo?: NovedadTipo;
  hora?: string;
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
  createdAt: Timestamp;
}

export interface AddNewsDTO {
  escuelaId: string;
  fecha: Date;
  tipo: NovedadTipo;
  hora?: string;
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
}
