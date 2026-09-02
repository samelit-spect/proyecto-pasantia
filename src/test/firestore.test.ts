import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Timestamp as TimestampType } from 'firebase/firestore';

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  arrayUnion: vi.fn((...args: unknown[]) => args),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1, nanoseconds: 2, toDate: () => new Date() })),
    fromDate: vi.fn((d: Date) => ({ _firestoreDate: d, toDate: () => d })),
  },
  onSnapshot: vi.fn(),
  notifySupervisorPush: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  collection: mocks.collection,
  doc: mocks.doc,
  getDocs: mocks.getDocs,
  getDoc: mocks.getDoc,
  addDoc: mocks.addDoc,
  setDoc: mocks.setDoc,
  updateDoc: mocks.updateDoc,
  deleteDoc: mocks.deleteDoc,
  query: mocks.query,
  where: mocks.where,
  orderBy: mocks.orderBy,
  limit: mocks.limit,
  arrayUnion: mocks.arrayUnion,
  Timestamp: mocks.Timestamp,
  onSnapshot: mocks.onSnapshot,
}));

vi.mock('@/services/firebase', () => ({
  db: {},
}));

vi.mock('@/services/pushSender', () => ({
  notifySupervisorPush: mocks.notifySupervisorPush,
}));

import {
  getSchools,
  addSchool,
  updateSchool,
  deleteSchool,
  getUsersBySchool,
  getAllUsers,
  addUserProfile,
  setUserActive,
  updateUserProfile,
  addAttendance,
  setAttendanceVerified,
  addIncident,
  updateIncidentStatus,
  getDocentesBySchool,
  addDocente,
  setDocenteActive,
  updateDocente,
  addDocenteAttendance,
  setDocenteAttendanceVerified,
  addFoto,
  deleteFoto,
  subscribeTodayAttendances,
  subscribeLast7DaysCounts,
} from '@/services/api/firestore';

const makeDocsSnap = (docs: Array<Record<string, unknown>>) => ({
  docs: docs.map((d, i) => ({ id: `id-${i}`, exists: () => true, data: () => d })),
});

describe('firestore services — escuelas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.Timestamp.now.mockReturnValue({
      seconds: 1,
      nanoseconds: 2,
      toDate: () => new Date(),
    } as unknown as TimestampType);
    mocks.query.mockImplementation((...args: unknown[]) => args);
    mocks.where.mockImplementation((f: string, op: string, v: unknown) => ({ f, op, v }));
    mocks.orderBy.mockImplementation((f: string, dir?: string) => ({ f, dir }));
    mocks.limit.mockImplementation((n: number) => ({ n }));
    mocks.collection.mockImplementation((_db: unknown, name: string) => ({ name }));
    mocks.doc.mockImplementation((_db: unknown, name: string, id?: string) => ({ name, id }));
    mocks.notifySupervisorPush.mockResolvedValue(undefined);
  });

  it('getSchools filtra activas y ordena por nombre', async () => {
    mocks.getDocs.mockResolvedValue(
      makeDocsSnap([
        { nombre: 'Beta', activa: true },
        { nombre: 'Alfa', activa: true },
      ])
    );
    const schools = await getSchools();
    expect(schools.map((s) => s.nombre)).toEqual(['Alfa', 'Beta']);
  });

  it('addSchool escribe createdAt y activa: true', async () => {
    mocks.addDoc.mockResolvedValue({ id: 'esc-nueva' });
    const id = await addSchool({ nombre: 'Nueva', turno: 'Mañana' });
    expect(id).toBe('esc-nueva');
    const [collectionArg] = mocks.collection.mock.calls[0];
    expect(collectionArg).toBeDefined();
    const payload = mocks.addDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.activa).toBe(true);
    expect(payload.createdAt).toBeDefined();
    expect(mocks.Timestamp.now).toHaveBeenCalled();
  });

  it('updateSchool y deleteSchool delegan a updateDoc/deleteDoc', async () => {
    await updateSchool('esc-1', { nombre: 'Renombrada', turno: 'Tarde' });
    expect(mocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'escuelas', id: 'esc-1' }),
      expect.objectContaining({ nombre: 'Renombrada' })
    );

    await deleteSchool('esc-1');
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'escuelas', id: 'esc-1' })
    );
  });
});

describe('firestore services — usuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addDoc.mockResolvedValue({ id: 'x' });
  });

  it('getUsersBySchool filtra usuarios inactivos', async () => {
    mocks.getDocs.mockResolvedValue(
      makeDocsSnap([{ nombre: 'A', activo: true }, { nombre: 'B', activo: false }, { nombre: 'C' }])
    );
    const users = await getUsersBySchool('esc-1');
    expect(users.map((u) => u.nombre)).toEqual(['A', 'C']);
  });

  it('getAllUsers devuelve todos los usuarios', async () => {
    mocks.getDocs.mockResolvedValue(makeDocsSnap([{ nombre: 'X' }]));
    const users = await getAllUsers();
    expect(users).toHaveLength(1);
    expect(mocks.orderBy).toHaveBeenCalledWith('nombre');
  });

  it('addUserProfile incluye actor cuando se pasa', async () => {
    await addUserProfile(
      {
        uid: 'u-1',
        nombre: 'Ana',
        email: 'a@t.com',
        rol: 'preceptor',
        escuelaId: 'esc-1',
        cargo: 'preceptor',
      },
      { uid: 'sup-1', nombre: 'Supervisor' }
    );
    const payload = mocks.setDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.creadoPor).toBe('sup-1');
    expect(payload.creadoPorNombre).toBe('Supervisor');
    expect(payload.activo).toBe(true);
    expect(payload.fechaCreacion).toBeDefined();
  });

  it('addUserProfile sin actor no incluye creadoPor', async () => {
    await addUserProfile({
      uid: 'u-2',
      nombre: 'Ana',
      email: 'a@t.com',
      rol: 'director',
      escuelaId: 'esc-1',
      cargo: 'directora',
    });
    const payload = mocks.setDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.creadoPor).toBeUndefined();
  });

  it('getAllUsers expone fechaCreacion desde createdAt para usuarios creados antes', async () => {
    const fecha = new Date('2026-01-05T10:00:00');
    mocks.getDocs.mockResolvedValue(
      makeDocsSnap([{ nombre: 'X', createdAt: { toDate: () => fecha } }])
    );
    const users = await getAllUsers();
    expect(users[0].fechaCreacion).toEqual(fecha);
  });

  it('setUserActive registra editor cuando se pasa', async () => {
    await setUserActive('u-1', false, { uid: 'sup-1', nombre: 'Supervisor' });
    const payload = mocks.updateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.activo).toBe(false);
    expect(payload.editadoPor).toBe('sup-1');
    expect(payload.editadoEn).toBeDefined();
  });

  it('updateUserProfile actualiza los campos provistos', async () => {
    await updateUserProfile('u-1', {
      nombre: 'Nuevo',
      email: 'n@t.com',
      rol: 'vice',
      escuelaId: 'esc-2',
    });
    const payload = mocks.updateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.rol).toBe('vice');
    expect(payload.escuelaId).toBe('esc-2');
  });
});

describe('firestore services — asistencias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addDoc.mockResolvedValue({ id: 'att-1' });
    mocks.Timestamp.fromDate.mockImplementation((d: Date) => ({ toDate: () => d }) as never);
  });

  it('addAttendance crea registro no verificado y avisa al supervisor', async () => {
    const fecha = new Date('2026-09-01T10:00:00');
    const id = await addAttendance({
      escuelaId: 'esc-1',
      fecha,
      cargadoPor: 'u-1',
      cargadoPorNombre: 'Ana',
      registros: [{ nombre: 'Estudiante', cargo: 'alumno', presente: true }],
    });
    expect(id).toBe('att-1');
    const payload = mocks.addDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.verificada).toBe(false);
    expect(payload.registros).toHaveLength(1);
    expect(mocks.Timestamp.fromDate).toHaveBeenCalledWith(fecha);
    expect(mocks.notifySupervisorPush).toHaveBeenCalledWith('asistencias', 'att-1');
  });

  it('setAttendanceVerified al verificar incluye verificadoPor', async () => {
    await setAttendanceVerified('att-1', true, { uid: 'sup-1', nombre: 'Supervisor' });
    const payload = mocks.updateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.verificada).toBe(true);
    expect(payload.verificadoPor).toBe('sup-1');
    expect(payload.verificadoEn).toBeDefined();
  });

  it('setAttendanceVerified al desmarcar limpia verificadoPor', async () => {
    await setAttendanceVerified('att-1', false, { uid: 'sup-1', nombre: 'Supervisor' });
    const payload = mocks.updateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.verificadoPor).toBeNull();
    expect(payload.verificadoEn).toBeNull();
  });
});

describe('firestore services — incidentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addDoc.mockResolvedValue({ id: 'inc-1' });
    mocks.arrayUnion.mockImplementation((...args: unknown[]) => args);
  });

  it('addIncident arranca en estado pendiente con historialEstados', async () => {
    const id = await addIncident({
      escuelaId: 'esc-1',
      fecha: new Date(),
      categoria: 'rotura',
      urgencia: 'media',
      descripcion: 'Cortina rota',
      cargadoPor: 'u-1',
      cargadoPorNombre: 'Ana',
    });
    expect(id).toBe('inc-1');
    const payload = mocks.addDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.estado).toBe('pendiente');
    expect(payload.historialEstados).toHaveLength(1);
    expect((payload.historialEstados as Array<Record<string, unknown>>)[0].estadoNuevo).toBe(
      'pendiente'
    );
    expect(mocks.notifySupervisorPush).toHaveBeenCalledWith('incidentes', 'inc-1');
  });

  it('updateIncidentStatus usa arrayUnion para el historial', async () => {
    await updateIncidentStatus(
      'inc-1',
      'resuelto',
      { uid: 'sup-1', nombre: 'Supervisor' },
      'en_analisis'
    );
    const payload = mocks.updateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.estado).toBe('resuelto');
    expect(mocks.arrayUnion).toHaveBeenCalledTimes(1);
    const entry = mocks.arrayUnion.mock.calls[0][0] as Record<string, unknown>;
    expect(entry.estadoAnterior).toBe('en_analisis');
    expect(entry.cambiadoPor).toBe('sup-1');
  });
});

describe('firestore services — docentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addDoc.mockResolvedValue({ id: 'docente-1' });
  });

  it('getDocentesBySchool filtra inactivos y ordena por nombre', async () => {
    mocks.getDocs.mockResolvedValue(
      makeDocsSnap([
        { nombre: 'Zulema', activa: true },
        { nombre: 'Alicia', activo: false },
        { nombre: 'Beatriz' },
      ])
    );
    const docentes = await getDocentesBySchool('esc-1');
    expect(docentes.map((d) => d.nombre)).toEqual(['Beatriz', 'Zulema']);
  });

  it('addDocente incluye creadoPor cuando se pasa actor', async () => {
    await addDocente(
      { nombre: 'Nuevo Docente', materia: 'Matemática', escuelaId: 'esc-1' },
      { uid: 'u-1', nombre: 'Ana' }
    );
    const payload = mocks.addDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.creadoPor).toBe('u-1');
    expect(payload.activo).toBe(true);
  });

  it('setDocenteActive guarda el nuevo estado', async () => {
    await setDocenteActive('doc-1', false);
    const payload = mocks.updateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.activo).toBe(false);
  });

  it('updateDocente guarda materia con fallback a cadena vacía', async () => {
    await updateDocente('doc-1', { nombre: 'Solo Nombre' });
    const payload = mocks.updateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.materia).toBe('');
  });

  it('addDocenteAttendance avisa al supervisor', async () => {
    mocks.addDoc.mockResolvedValue({ id: 'attd-1' });
    const id = await addDocenteAttendance({
      escuelaId: 'esc-1',
      fecha: new Date(),
      cargadoPor: 'u-1',
      cargadoPorNombre: 'Ana',
    });
    expect(id).toBe('attd-1');
    expect(mocks.notifySupervisorPush).toHaveBeenCalledWith('asistencia_docentes', 'attd-1');
  });

  it('setDocenteAttendanceVerified verifica el registro', async () => {
    await setDocenteAttendanceVerified('attd-1', true, { uid: 'sup-1', nombre: 'Supervisor' });
    const payload = mocks.updateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.verificada).toBe(true);
    expect(payload.verificadoPor).toBe('sup-1');
  });
});

describe('firestore services — fotos y suscripciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addDoc.mockResolvedValue({ id: 'foto-1' });
    mocks.onSnapshot.mockImplementation(() => vi.fn());
  });

  it('addFoto guarda los datos y notifica', async () => {
    const id = await addFoto({
      escuelaId: 'esc-1',
      fecha: '2026-09-01',
      dataUrl: 'data:image/png;base64,...',
      nombreArchivo: 'a.png',
      subidoPor: 'u-1',
      subidoPorNombre: 'Ana',
    });
    expect(id).toBe('foto-1');
    expect(mocks.notifySupervisorPush).toHaveBeenCalledWith('fotos', 'foto-1');
  });

  it('deleteFoto llama a deleteDoc', async () => {
    await deleteFoto('foto-1');
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'fotos', id: 'foto-1' })
    );
  });

  it('getSchools no usado en suscripción: subscribeTodayAttendances llama onSnapshot', () => {
    const unsub = subscribeTodayAttendances(() => {});
    expect(mocks.onSnapshot).toHaveBeenCalled();
    expect(typeof unsub).toBe('function');
  });

  it('subscribeLast7DaysCounts cuenta por día', () => {
    const counts: unknown[] = [];
    const unsub = subscribeLast7DaysCounts((data) => counts.push(data));
    const snap = {
      docs: mocks.onSnapshot.mock.calls.map(() => ({ id: 'a', data: () => ({}) })),
    };
    void snap;
    expect(mocks.onSnapshot).toHaveBeenCalledTimes(3);
    expect(typeof unsub).toBe('function');
    expect(counts).toHaveLength(0);
  });

  it('subscribeLast7DaysCounts emite counts cuando los snapshots llegan', () => {
    const today = new Date();
    const tsToday = mocks.Timestamp.fromDate(today);
    const buildSnap = () => ({
      docs: [{ id: 'a', data: () => ({ fecha: tsToday }) }],
    });
    let unsubscribe: (() => void) | undefined;
    mocks.onSnapshot.mockImplementation(() => {
      const unsub = () => {};
      unsubscribe = unsub;
      return unsub;
    });

    const callback = vi.fn();
    subscribeLast7DaysCounts(callback);

    // Primera llamada = asistencias: entregar snapshot con 1 registro de hoy
    const firstCallArgs = mocks.onSnapshot.mock.calls[0][1];
    (firstCallArgs as (s: unknown) => void)(buildSnap());

    expect(callback).toHaveBeenCalledTimes(1);
    const data = callback.mock.calls[0][0] as { dates: string[]; asistencias: number[] };
    expect(data.dates).toHaveLength(7);
    const todayIdx = data.dates.indexOf(today.toISOString().split('T')[0]);
    expect(data.asistencias[todayIdx]).toBe(1);
    expect(typeof unsubscribe).toBe('function');
  });
});
