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
