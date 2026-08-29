export interface PushToken {
  userId: string;
  userNombre: string;
  role: string;
  token: string;
  platform: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
