import type { Timestamp } from 'firebase/firestore';

export interface DocenteAttendance {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  cargadoPor: string;
  cargadoPorNombre: string;
  fotoDataUrl?: string;
  createdAt: Timestamp;
  verificada?: boolean;
  verificadoPor?: string;
  verificadoPorNombre?: string;
  verificadoEn?: Timestamp;
}

export interface AddDocenteAttendanceDTO {
  escuelaId: string;
  fecha: Date;
  cargadoPor: string;
  cargadoPorNombre: string;
  fotoDataUrl?: string;
}
