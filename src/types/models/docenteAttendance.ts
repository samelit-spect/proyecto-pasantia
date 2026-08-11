import type { Timestamp } from 'firebase/firestore';

export interface DocenteAttendanceRecord {
  nombre: string;
  materia?: string;
  presente: boolean;
  motivo?: string;
}

export interface DocenteAttendance {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  cargadoPor: string;
  cargadoPorNombre: string;
  registros: DocenteAttendanceRecord[];
  createdAt: Timestamp;
}

export interface AddDocenteAttendanceDTO {
  escuelaId: string;
  fecha: Date;
  cargadoPor: string;
  cargadoPorNombre: string;
  registros: DocenteAttendanceRecord[];
}
