import type { Timestamp } from 'firebase/firestore';

export interface News {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
  createdAt: Timestamp;
}

export interface AddNewsDTO {
  escuelaId: string;
  fecha: Date;
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
}
