import type { Timestamp } from 'firebase/firestore';

export interface Foto {
  id: string;
  escuelaId: string;
  fecha: string;
  storagePath: string;
  nombreArchivo: string;
  subidoPor: string;
  subidoPorNombre: string;
  createdAt: Timestamp;
}

export interface AddFotoDTO {
  escuelaId: string;
  fecha: string;
  storagePath: string;
  nombreArchivo: string;
  subidoPor: string;
  subidoPorNombre: string;
}
