import type { Timestamp } from 'firebase/firestore';

export interface AttendanceRecord {
  nombre: string;
  cargo: string;
  presente: boolean;
  motivo?: string;
  existe?: boolean;
}

export interface Attendance {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  cargadoPor: string;
  cargadoPorNombre: string;
  registros: AttendanceRecord[];
  createdAt: Timestamp;
  verificada?: boolean;
  verificadoPor?: string;
  verificadoPorNombre?: string;
  verificadoEn?: Timestamp;
}

export interface AddAttendanceDTO {
  escuelaId: string;
  fecha: Date;
  cargadoPor: string;
  cargadoPorNombre: string;
  registros: AttendanceRecord[];
}
