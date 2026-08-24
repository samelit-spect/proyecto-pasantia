import type { Timestamp } from 'firebase/firestore';

export interface Docente {
  id: string;
  nombre: string;
  materia?: string;
  escuelaId: string;
  activo: boolean;
  createdAt: Timestamp;
  creadoPor?: string;
  creadoPorNombre?: string;
  editadoPor?: string;
  editadoPorNombre?: string;
  editadoEn?: Timestamp;
}

export interface AddDocenteDTO {
  nombre: string;
  materia?: string;
  escuelaId: string;
}
