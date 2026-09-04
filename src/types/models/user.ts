import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'director' | 'vice' | 'preceptor' | 'secretario' | 'conserje' | 'supervisor';

export interface UserProfile {
  uid: string;
  nombre: string;
  email: string;
  rol: UserRole;
  escuelaId: string;
  cargo: string;
  activo: boolean;
  fechaCreacion: Date;
  fotoDataUrl?: string;
  creadoPor?: string;
  creadoPorNombre?: string;
  editadoPor?: string;
  editadoPorNombre?: string;
  editadoEn?: Timestamp;
}

export interface UserCreateDTO {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  escuelaId: string;
  cargo: string;
}

export interface UserUpdateDTO {
  nombre?: string;
  rol?: UserRole;
  escuelaId?: string;
  cargo?: string;
  activo?: boolean;
}
