import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import type { QueryConstraint, Unsubscribe } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { notifySupervisorPush } from '@/services/pushSender';

/**
 * IMPORTANTE: Algunas queries en este archivo combinan where() + orderBy() en campos
 * diferentes, lo que requiere composite indexes creados manualmente en Firebase Console.
 * Consultas que requieren indexes:
 * - getSchools: activa + nombre
 * - getAttendancesBySchool: escuelaId + fecha (range) + fecha (orderBy)
 * - getNewsBySchool: escuelaId + fecha (range) + fecha (orderBy)
 * - getIncidentsBySchool: escuelaId + fecha (orderBy)
 * - getDocenteAttendancesBySchool: escuelaId + fecha (orderBy)
 * - getFotosBySchool: escuelaId + createdAt (orderBy)
 * Si una query falla, revisá la consola de Firestore para crear el index sugerido.
 */
import type {
  School,
  UserProfile,
  Attendance,
  AddAttendanceDTO,
  News,
  AddNewsDTO,
  Incident,
  AddIncidentDTO,
  IncidentStatus,
  Docente,
  AddDocenteDTO,
  DocenteAttendance,
  AddDocenteAttendanceDTO,
  Foto,
  AddFotoDTO,
  PushToken,
} from '@/types';

const COLLECTIONS = {
  schools: 'escuelas',
  users: 'usuarios',
  attendances: 'asistencias',
  news: 'novedades',
  incidents: 'incidentes',
  docentes: 'docentes',
  docenteAttendances: 'asistencia_docentes',
  fotos: 'fotos',
  pushTokens: 'push_tokens',
} as const;

/** Convierte un Timestamp de Firestore (o Date) a Date, tolerando ambos. */
const asDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  return new Date(value as string | number);
};

/**
 * Normaliza un documento de usuarios. Los usuarios creados antes del
 * guardado de fechaCreacion solo tienen createdAt, así que se usa como
 * respaldo para que perfil y orden por antigüedad funcionen con ambos.
 */
const toUserProfile = (uid: string, data: Record<string, unknown>): UserProfile =>
  ({
    uid,
    ...(data as object),
    fechaCreacion: asDate(data.fechaCreacion ?? data.createdAt),
  }) as UserProfile;

export async function upsertPushToken(token: PushToken): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.pushTokens, token.token), token, { merge: true });
}

export async function deletePushToken(token: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.pushTokens, token));
}

export async function getSchools(): Promise<School[]> {
  const q = query(collection(db, COLLECTIONS.schools), where('activa', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as School)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getSchoolById(schoolId: string): Promise<School | null> {
  const docRef = doc(db, COLLECTIONS.schools, schoolId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as School;
}

export async function addSchool(data: {
  nombre: string;
  turno: string;
  direccion?: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.schools), {
    nombre: data.nombre,
    turno: data.turno,
    direccion: data.direccion || '',
    activa: true,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateSchool(
  schoolId: string,
  data: { nombre: string; turno: string; direccion?: string }
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.schools, schoolId), {
    nombre: data.nombre,
    turno: data.turno,
    direccion: data.direccion || '',
  });
}

export async function deleteSchool(schoolId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.schools, schoolId));
}

export async function getUsersBySchool(schoolId: string): Promise<UserProfile[]> {
  const q = query(collection(db, COLLECTIONS.users), where('escuelaId', '==', schoolId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toUserProfile(d.id, d.data())).filter((u) => u.activo !== false);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, COLLECTIONS.users), orderBy('nombre'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toUserProfile(d.id, d.data()));
}

export async function addUserProfile(
  data: {
    uid: string;
    nombre: string;
    email: string;
    rol: UserProfile['rol'];
    escuelaId: string;
    cargo: string;
  },
  actor?: { uid: string; nombre: string }
): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.users, data.uid), {
    nombre: data.nombre,
    email: data.email,
    rol: data.rol,
    escuelaId: data.escuelaId,
    cargo: data.cargo,
    activo: true,
    createdAt: Timestamp.now(),
    fechaCreacion: Timestamp.now(),
    ...(actor ? { creadoPor: actor.uid, creadoPorNombre: actor.nombre } : {}),
  });
}

export async function setUserActive(
  uid: string,
  activo: boolean,
  actor?: { uid: string; nombre: string }
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, uid), {
    activo,
    ...(actor
      ? { editadoPor: actor.uid, editadoPorNombre: actor.nombre, editadoEn: Timestamp.now() }
      : {}),
  });
}

export async function updateUserProfile(
  uid: string,
  data: { nombre: string; email: string; rol: string; escuelaId: string },
  actor?: { uid: string; nombre: string }
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, uid), {
    nombre: data.nombre,
    email: data.email,
    rol: data.rol,
    escuelaId: data.escuelaId,
    ...(actor
      ? { editadoPor: actor.uid, editadoPorNombre: actor.nombre, editadoEn: Timestamp.now() }
      : {}),
  });
}

export async function updateOwnProfile(
  uid: string,
  data: { nombre: string; fotoDataUrl?: string },
  actor: { uid: string; nombre: string }
): Promise<void> {
  const payload: Record<string, unknown> = {
    nombre: data.nombre,
    editadoPor: actor.uid,
    editadoPorNombre: actor.nombre,
    editadoEn: Timestamp.now(),
  };
  if (data.fotoDataUrl !== undefined) payload.fotoDataUrl = data.fotoDataUrl;
  await updateDoc(doc(db, COLLECTIONS.users, uid), payload);
}

export async function addAttendance(data: AddAttendanceDTO): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.attendances), {
    escuelaId: data.escuelaId,
    fecha: Timestamp.fromDate(data.fecha),
    cargadoPor: data.cargadoPor,
    cargadoPorNombre: data.cargadoPorNombre,
    registros: data.registros,
    verificada: false,
    createdAt: Timestamp.now(),
  });
  void notifySupervisorPush('asistencias', docRef.id);
  return docRef.id;
}

export async function setAttendanceVerified(
  attendanceId: string,
  verified: boolean,
  verifier: { uid: string; nombre: string }
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.attendances, attendanceId);
  const update: Record<string, unknown> = { verificada: verified };
  if (verified) {
    update.verificadoPor = verifier.uid;
    update.verificadoPorNombre = verifier.nombre;
    update.verificadoEn = Timestamp.now();
  } else {
    update.verificadoPor = null;
    update.verificadoPorNombre = null;
    update.verificadoEn = null;
  }
  await updateDoc(docRef, update);
}

export async function getAttendanceByUserAndDate(
  schoolId: string,
  date: Date,
  userId: string
): Promise<Attendance[]> {
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('escuelaId', '==', schoolId),
    where('cargadoPor', '==', userId),
    where('fecha', '==', Timestamp.fromDate(date))
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
}

export async function getAttendancesBySchool(
  schoolId: string,
  startDate: Date,
  endDate: Date
): Promise<Attendance[]> {
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('escuelaId', '==', schoolId),
    where('fecha', '>=', Timestamp.fromDate(startDate)),
    where('fecha', '<=', Timestamp.fromDate(endDate)),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Attendance);
}

export async function addNews(data: AddNewsDTO): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.news), {
    escuelaId: data.escuelaId,
    fecha: Timestamp.fromDate(data.fecha),
    tipo: data.tipo,
    hora: data.hora || '',
    descripcion: data.descripcion,
    cargadoPor: data.cargadoPor,
    cargadoPorNombre: data.cargadoPorNombre,
    createdAt: Timestamp.now(),
  });
  void notifySupervisorPush('novedades', docRef.id);
  return docRef.id;
}

export async function getNewsBySchool(
  schoolId: string,
  startDate: Date,
  endDate: Date
): Promise<News[]> {
  const q = query(
    collection(db, COLLECTIONS.news),
    where('escuelaId', '==', schoolId),
    where('fecha', '>=', Timestamp.fromDate(startDate)),
    where('fecha', '<=', Timestamp.fromDate(endDate)),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as News);
}

export async function getTodayAttendances(): Promise<Attendance[]> {
  const start = startOfToday();
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('fecha', '>=', Timestamp.fromDate(start)),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
}

export async function getTodayAttendancesBySchool(schoolId: string): Promise<Attendance[]> {
  const start = startOfToday();
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('escuelaId', '==', schoolId),
    where('fecha', '>=', Timestamp.fromDate(start)),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
}

export async function getTodayNews(): Promise<News[]> {
  const start = startOfToday();
  const q = query(
    collection(db, COLLECTIONS.news),
    where('fecha', '>=', Timestamp.fromDate(start)),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
}

export async function getTodayNewsBySchool(schoolId: string): Promise<News[]> {
  const start = startOfToday();
  const q = query(
    collection(db, COLLECTIONS.news),
    where('escuelaId', '==', schoolId),
    where('fecha', '>=', Timestamp.fromDate(start)),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
}

export async function getTodayIncidents(): Promise<Incident[]> {
  const start = startOfToday();
  const q = query(
    collection(db, COLLECTIONS.incidents),
    where('fecha', '>=', Timestamp.fromDate(start)),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident);
}

export async function getTodayIncidentsBySchool(schoolId: string): Promise<Incident[]> {
  const start = startOfToday();
  const q = query(
    collection(db, COLLECTIONS.incidents),
    where('escuelaId', '==', schoolId),
    where('fecha', '>=', Timestamp.fromDate(start)),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident);
}

export async function getRecentIncidents(max = 20): Promise<Incident[]> {
  const q = query(collection(db, COLLECTIONS.incidents), orderBy('fecha', 'desc'), limit(max));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Incident);
}

export async function getAllAttendancesBySchool(schoolId: string): Promise<Attendance[]> {
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
}

export async function getAllNewsBySchool(schoolId: string): Promise<News[]> {
  const q = query(
    collection(db, COLLECTIONS.news),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
}

export async function addIncident(data: AddIncidentDTO): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.incidents), {
    escuelaId: data.escuelaId,
    fecha: Timestamp.fromDate(data.fecha),
    categoria: data.categoria,
    urgencia: data.urgencia,
    ubicacion: data.ubicacion || '',
    fotoDataUrl: data.fotoDataUrl || '',
    descripcion: data.descripcion,
    estado: 'pendiente' as IncidentStatus,
    historialEstados: [
      {
        estadoNuevo: 'pendiente' as IncidentStatus,
        cambiadoPor: data.cargadoPor,
        cambiadoPorNombre: data.cargadoPorNombre,
        fecha: now,
      },
    ],
    cargadoPor: data.cargadoPor,
    cargadoPorNombre: data.cargadoPorNombre,
    createdAt: now,
    updatedAt: now,
  });
  void notifySupervisorPush('incidentes', docRef.id);
  return docRef.id;
}

export async function getIncidentsBySchool(
  schoolId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Incident[]> {
  const base = collection(db, COLLECTIONS.incidents);
  const q =
    startDate && endDate
      ? query(
          base,
          where('escuelaId', '==', schoolId),
          where('fecha', '>=', Timestamp.fromDate(startDate)),
          where('fecha', '<=', Timestamp.fromDate(endDate)),
          orderBy('fecha', 'desc'),
          limit(100)
        )
      : query(base, where('escuelaId', '==', schoolId), orderBy('fecha', 'desc'), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Incident);
}

export async function updateIncidentStatus(
  incidentId: string,
  newStatus: IncidentStatus,
  actor: { uid: string; nombre: string },
  estadoAnterior?: IncidentStatus
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.incidents, incidentId);
  const entrada: Record<string, unknown> = {
    estadoNuevo: newStatus,
    cambiadoPor: actor.uid,
    cambiadoPorNombre: actor.nombre,
    fecha: Timestamp.now(),
  };
  if (estadoAnterior) entrada.estadoAnterior = estadoAnterior;

  await updateDoc(docRef, {
    estado: newStatus,
    updatedAt: Timestamp.now(),
    historialEstados: arrayUnion(entrada),
  });
}

export async function getDocentesBySchool(schoolId: string): Promise<Docente[]> {
  const q = query(collection(db, COLLECTIONS.docentes), where('escuelaId', '==', schoolId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Docente)
    .filter((d) => d.activo !== false)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getAllDocentes(): Promise<Docente[]> {
  const q = query(collection(db, COLLECTIONS.docentes), orderBy('nombre'), limit(300));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Docente);
}

export async function addDocente(
  data: AddDocenteDTO,
  actor?: { uid: string; nombre: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.docentes), {
    nombre: data.nombre,
    materia: data.materia || '',
    escuelaId: data.escuelaId,
    activo: true,
    createdAt: Timestamp.now(),
    ...(actor ? { creadoPor: actor.uid, creadoPorNombre: actor.nombre } : {}),
  });
  return docRef.id;
}

export async function setDocenteActive(
  docenteId: string,
  activo: boolean,
  actor?: { uid: string; nombre: string }
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.docentes, docenteId), {
    activo,
    ...(actor
      ? { editadoPor: actor.uid, editadoPorNombre: actor.nombre, editadoEn: Timestamp.now() }
      : {}),
  });
}

export async function updateDocente(
  docenteId: string,
  data: { nombre: string; materia?: string },
  actor?: { uid: string; nombre: string }
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.docentes, docenteId), {
    nombre: data.nombre,
    materia: data.materia || '',
    ...(actor
      ? { editadoPor: actor.uid, editadoPorNombre: actor.nombre, editadoEn: Timestamp.now() }
      : {}),
  });
}

export async function addDocenteAttendance(data: AddDocenteAttendanceDTO): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.docenteAttendances), {
    escuelaId: data.escuelaId,
    fecha: Timestamp.fromDate(data.fecha),
    cargadoPor: data.cargadoPor,
    cargadoPorNombre: data.cargadoPorNombre,
    fotoDataUrl: data.fotoDataUrl || '',
    verificada: false,
    createdAt: Timestamp.now(),
  });
  void notifySupervisorPush('asistencia_docentes', docRef.id);
  return docRef.id;
}

export async function setDocenteAttendanceVerified(
  attendanceId: string,
  verified: boolean,
  verifier: { uid: string; nombre: string }
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.docenteAttendances, attendanceId);
  const update: Record<string, unknown> = { verificada: verified };
  if (verified) {
    update.verificadoPor = verifier.uid;
    update.verificadoPorNombre = verifier.nombre;
    update.verificadoEn = Timestamp.now();
  } else {
    update.verificadoPor = null;
    update.verificadoPorNombre = null;
    update.verificadoEn = null;
  }
  await updateDoc(docRef, update);
}

export async function getDocenteAttendanceByUserAndDate(
  schoolId: string,
  date: Date,
  userId: string
): Promise<DocenteAttendance[]> {
  const q = query(
    collection(db, COLLECTIONS.docenteAttendances),
    where('escuelaId', '==', schoolId),
    where('cargadoPor', '==', userId),
    where('fecha', '==', Timestamp.fromDate(date))
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as DocenteAttendance);
}

export async function getDocenteAttendancesBySchool(
  schoolId: string,
  startDate?: Date,
  endDate?: Date
): Promise<DocenteAttendance[]> {
  const base = collection(db, COLLECTIONS.docenteAttendances);
  const q =
    startDate && endDate
      ? query(
          base,
          where('escuelaId', '==', schoolId),
          where('fecha', '>=', Timestamp.fromDate(startDate)),
          where('fecha', '<=', Timestamp.fromDate(endDate)),
          orderBy('fecha', 'desc'),
          limit(100)
        )
      : query(base, where('escuelaId', '==', schoolId), orderBy('fecha', 'desc'), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as DocenteAttendance);
}

export async function addFoto(data: AddFotoDTO): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.fotos), {
    escuelaId: data.escuelaId,
    fecha: data.fecha,
    dataUrl: data.dataUrl,
    nombreArchivo: data.nombreArchivo,
    subidoPor: data.subidoPor,
    subidoPorNombre: data.subidoPorNombre,
    createdAt: Timestamp.now(),
  });
  void notifySupervisorPush('fotos', docRef.id);
  return docRef.id;
}

export async function deleteFoto(fotoId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.fotos, fotoId));
}

export async function getFotosBySchoolAndDate(schoolId: string, fecha: string): Promise<Foto[]> {
  const q = query(
    collection(db, COLLECTIONS.fotos),
    where('escuelaId', '==', schoolId),
    where('fecha', '==', fecha),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Foto);
}

export async function getFotosBySchool(schoolId: string): Promise<Foto[]> {
  const q = query(
    collection(db, COLLECTIONS.fotos),
    where('escuelaId', '==', schoolId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Foto);
}

/**
 * Funciones de exportación global (respaldo anual).
 * A diferencia de las funciones por escuela, NO aplican limit(): traen
 * todos los documentos de la jurisdicción. Los filtros de rango usan el
 * mismo campo que el orderBy, por lo que no requieren composite indexes.
 */
function globalRangeClauses(field: 'fecha', startDate?: Date, endDate?: Date): QueryConstraint[] {
  const clauses: QueryConstraint[] = [];
  if (startDate) clauses.push(where(field, '>=', Timestamp.fromDate(startDate)));
  if (endDate) clauses.push(where(field, '<=', Timestamp.fromDate(endDate)));
  return clauses;
}

export async function getAllAttendances(startDate?: Date, endDate?: Date): Promise<Attendance[]> {
  const q = query(
    collection(db, COLLECTIONS.attendances),
    ...globalRangeClauses('fecha', startDate, endDate),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
}

export async function getAllDocenteAttendances(
  startDate?: Date,
  endDate?: Date
): Promise<DocenteAttendance[]> {
  const q = query(
    collection(db, COLLECTIONS.docenteAttendances),
    ...globalRangeClauses('fecha', startDate, endDate),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as DocenteAttendance);
}

export async function getAllNews(startDate?: Date, endDate?: Date): Promise<News[]> {
  const q = query(
    collection(db, COLLECTIONS.news),
    ...globalRangeClauses('fecha', startDate, endDate),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
}

export async function getAllIncidents(startDate?: Date, endDate?: Date): Promise<Incident[]> {
  const q = query(
    collection(db, COLLECTIONS.incidents),
    ...globalRangeClauses('fecha', startDate, endDate),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident);
}

function startOfToday(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

export function subscribeTodayAttendances(callback: (data: Attendance[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('fecha', '>=', Timestamp.fromDate(startOfToday())),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance));
  });
}

export function subscribeTodayAttendancesBySchool(
  schoolId: string,
  callback: (data: Attendance[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('escuelaId', '==', schoolId),
    where('fecha', '>=', Timestamp.fromDate(startOfToday())),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance));
  });
}

export function subscribeTodayNews(callback: (data: News[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.news),
    where('fecha', '>=', Timestamp.fromDate(startOfToday())),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as News));
  });
}

export function subscribeTodayNewsBySchool(
  schoolId: string,
  callback: (data: News[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.news),
    where('escuelaId', '==', schoolId),
    where('fecha', '>=', Timestamp.fromDate(startOfToday())),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as News));
  });
}

export function subscribeTodayIncidents(callback: (data: Incident[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.incidents),
    where('fecha', '>=', Timestamp.fromDate(startOfToday())),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident));
  });
}

export function subscribeTodayIncidentsBySchool(
  schoolId: string,
  callback: (data: Incident[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.incidents),
    where('escuelaId', '==', schoolId),
    where('fecha', '>=', Timestamp.fromDate(startOfToday())),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident));
  });
}

export function subscribeRecentIncidents(
  max: number,
  callback: (data: Incident[]) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.incidents), orderBy('fecha', 'desc'), limit(max));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident));
  });
}

export function subscribeAttendancesBySchool(
  schoolId: string,
  callback: (data: Attendance[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance));
  });
}

export function subscribeNewsBySchool(
  schoolId: string,
  callback: (data: News[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.news),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as News));
  });
}

export function subscribeIncidentsBySchool(
  schoolId: string,
  callback: (data: Incident[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.incidents),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident));
  });
}

export function subscribeDocenteAttendancesBySchool(
  schoolId: string,
  callback: (data: DocenteAttendance[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.docenteAttendances),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DocenteAttendance));
  });
}

export function subscribeFotosBySchool(
  schoolId: string,
  callback: (data: Foto[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.fotos),
    where('escuelaId', '==', schoolId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Foto));
  });
}

export interface DailyCounts {
  dates: string[];
  asistencias: number[];
  novedades: number[];
  incidentes: number[];
}

/** "YYYY-MM-DD" en zona horaria local (no UTC): evita corrimientos de día en gráficos. */
const localISODate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function subscribeLast7DaysCounts(
  callback: (data: DailyCounts) => void,
  schoolId?: string
): Unsubscribe {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(localISODate(d));
  }

  const buildCounts = (
    attendances: Attendance[],
    newsList: News[],
    incidentsList: Incident[]
  ): DailyCounts => {
    const asistencias = dates.map(() => 0);
    const novedades = dates.map(() => 0);
    const incidentes = dates.map(() => 0);

    attendances.forEach((a) => {
      const key = localISODate(a.fecha.toDate());
      const idx = dates.indexOf(key);
      if (idx >= 0) asistencias[idx]++;
    });
    newsList.forEach((n) => {
      const key = localISODate(n.fecha.toDate());
      const idx = dates.indexOf(key);
      if (idx >= 0) novedades[idx]++;
    });
    incidentsList.forEach((i) => {
      const key = localISODate(i.fecha.toDate());
      const idx = dates.indexOf(key);
      if (idx >= 0) incidentes[idx]++;
    });

    return { dates, asistencias, novedades, incidentes };
  };

  let attData: Attendance[] = [];
  let newsData: News[] = [];
  let incData: Incident[] = [];
  const emit = () => callback(buildCounts(attData, newsData, incData));

  const tsStart = Timestamp.fromDate(sevenDaysAgo);

  const attRef = collection(db, COLLECTIONS.attendances);
  const attQuery = schoolId
    ? query(
        attRef,
        where('escuelaId', '==', schoolId),
        where('fecha', '>=', tsStart),
        orderBy('fecha', 'asc')
      )
    : query(attRef, where('fecha', '>=', tsStart), orderBy('fecha', 'asc'));

  const newsRef = collection(db, COLLECTIONS.news);
  const newsQuery = schoolId
    ? query(
        newsRef,
        where('escuelaId', '==', schoolId),
        where('fecha', '>=', tsStart),
        orderBy('fecha', 'asc')
      )
    : query(newsRef, where('fecha', '>=', tsStart), orderBy('fecha', 'asc'));

  const incRef = collection(db, COLLECTIONS.incidents);
  const incQuery = schoolId
    ? query(
        incRef,
        where('escuelaId', '==', schoolId),
        where('fecha', '>=', tsStart),
        orderBy('fecha', 'asc')
      )
    : query(incRef, where('fecha', '>=', tsStart), orderBy('fecha', 'asc'));

  const unsubAtt = onSnapshot(attQuery, (snap) => {
    attData = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
    emit();
  });
  const unsubNews = onSnapshot(newsQuery, (snap) => {
    newsData = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
    emit();
  });
  const unsubInc = onSnapshot(incQuery, (snap) => {
    incData = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident);
    emit();
  });

  return () => {
    unsubAtt();
    unsubNews();
    unsubInc();
  };
}
