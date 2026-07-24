import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
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
} from '@/types';

const COLLECTIONS = {
  schools: 'escuelas',
  users: 'usuarios',
  attendances: 'asistencias',
  news: 'novedades',
  incidents: 'incidentes',
} as const;

export async function getSchools(): Promise<School[]> {
  const q = query(
    collection(db, COLLECTIONS.schools),
    where('activa', '==', true),
    orderBy('nombre')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as School);
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
  const q = query(
    collection(db, COLLECTIONS.users),
    where('escuelaId', '==', schoolId),
    where('activo', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);
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
