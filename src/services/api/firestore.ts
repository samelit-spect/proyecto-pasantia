import {
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
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * IMPORTANTE: Algunas queries en este archivo combinan where() + orderBy() en campos
 * diferentes, lo que requiere composite indexes creados manualmente en Firebase Console.
 * Consultas que requieren indexes:
 * - getSchools: activa + nombre
 * - getAttendancesBySchool: escuelaId + fecha (range) + fecha (orderBy)
 * - getNewsBySchool: escuelaId + fecha (range) + fecha (orderBy)
 * - getIncidentsBySchool: escuelaId + fecha (orderBy)
 * - getIncidentsByStatus: estado + fecha (orderBy)
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
} as const;

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

export async function getUsersBySchool(schoolId: string): Promise<UserProfile[]> {
  const q = query(collection(db, COLLECTIONS.users), where('escuelaId', '==', schoolId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ uid: d.id, ...d.data() }) as UserProfile)
    .filter((u) => u.activo !== false);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, COLLECTIONS.users), orderBy('nombre'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);
}

export async function addUserProfile(data: {
  uid: string;
  nombre: string;
  email: string;
  rol: UserProfile['rol'];
  escuelaId: string;
  cargo: string;
}): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.users, data.uid), {
    nombre: data.nombre,
    email: data.email,
    rol: data.rol,
    escuelaId: data.escuelaId,
    cargo: data.cargo,
    activo: true,
    createdAt: Timestamp.now(),
  });
}

export async function setUserActive(uid: string, activo: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, uid), { activo });
}

export async function addAttendance(data: AddAttendanceDTO): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.attendances), {
    escuelaId: data.escuelaId,
    fecha: Timestamp.fromDate(data.fecha),
    cargadoPor: data.cargadoPor,
    cargadoPorNombre: data.cargadoPorNombre,
    registros: data.registros,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
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
    descripcion: data.descripcion,
    cargadoPor: data.cargadoPor,
    cargadoPorNombre: data.cargadoPorNombre,
    createdAt: Timestamp.now(),
  });
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

export async function getAllAttendances(): Promise<Attendance[]> {
  const q = query(collection(db, COLLECTIONS.attendances), orderBy('fecha', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
}

export async function getAllAttendancesBySchool(schoolId: string): Promise<Attendance[]> {
  const q = query(
    collection(db, COLLECTIONS.attendances),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
}

export async function getAllNews(): Promise<News[]> {
  const q = query(collection(db, COLLECTIONS.news), orderBy('fecha', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
}

export async function getAllNewsBySchool(schoolId: string): Promise<News[]> {
  const q = query(
    collection(db, COLLECTIONS.news),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
}

export async function addIncident(data: AddIncidentDTO): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.incidents), {
    escuelaId: data.escuelaId,
    fecha: Timestamp.fromDate(data.fecha),
    descripcion: data.descripcion,
    estado: 'pendiente' as IncidentStatus,
    cargadoPor: data.cargadoPor,
    cargadoPorNombre: data.cargadoPorNombre,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function getIncidentsBySchool(schoolId: string): Promise<Incident[]> {
  const q = query(
    collection(db, COLLECTIONS.incidents),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Incident);
}

export async function getAllIncidents(): Promise<Incident[]> {
  const q = query(collection(db, COLLECTIONS.incidents), orderBy('fecha', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Incident);
}

export async function getIncidentsByStatus(status: IncidentStatus): Promise<Incident[]> {
  const q = query(
    collection(db, COLLECTIONS.incidents),
    where('estado', '==', status),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Incident);
}

export async function updateIncidentStatus(
  incidentId: string,
  newStatus: IncidentStatus
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.incidents, incidentId);
  await updateDoc(docRef, {
    estado: newStatus,
    updatedAt: Timestamp.now(),
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
  const q = query(collection(db, COLLECTIONS.docentes), orderBy('nombre'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Docente);
}

export async function addDocente(data: AddDocenteDTO): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.docentes), {
    nombre: data.nombre,
    materia: data.materia || '',
    escuelaId: data.escuelaId,
    activo: true,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function setDocenteActive(docenteId: string, activo: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.docentes, docenteId), { activo });
}

export async function addDocenteAttendance(data: AddDocenteAttendanceDTO): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.docenteAttendances), {
    escuelaId: data.escuelaId,
    fecha: Timestamp.fromDate(data.fecha),
    cargadoPor: data.cargadoPor,
    cargadoPorNombre: data.cargadoPorNombre,
    registros: data.registros,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
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
  schoolId: string
): Promise<DocenteAttendance[]> {
  const q = query(
    collection(db, COLLECTIONS.docenteAttendances),
    where('escuelaId', '==', schoolId),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as DocenteAttendance);
}

export async function getAllDocenteAttendances(): Promise<DocenteAttendance[]> {
  const q = query(collection(db, COLLECTIONS.docenteAttendances), orderBy('fecha', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as DocenteAttendance);
}

export async function addFoto(data: AddFotoDTO): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.fotos), {
    escuelaId: data.escuelaId,
    fecha: data.fecha,
    storagePath: data.storagePath,
    nombreArchivo: data.nombreArchivo,
    subidoPor: data.subidoPor,
    subidoPorNombre: data.subidoPorNombre,
    createdAt: Timestamp.now(),
  });
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
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Foto);
}
