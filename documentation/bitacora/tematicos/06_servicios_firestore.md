# 06 - Servicios y Consultas de Datos (Firestore)

> Este documento de la bitácora recopila la **capa de servicios de datos** del sistema: todas las funciones que leen y escriben en Firestore y las suscripciones en **tiempo real**. Todo vive en `src/services/api/firestore.ts`.

---

## 1. Por qué una capa de servicios centralizada

- **Un solo punto de acceso a los datos:** todos los componentes llaman a funciones de `firestore.ts` en lugar de escribir consultas Firestore dispersas.
- **Tipado:** cada función devuelve el tipo correspondiente (`School`, `Attendance`, `Incident`, etc.), lo que evita errores.
- **Consistencia:** query constraints (fechas de "hoy", límites, orden) se definen una sola vez y se reutilizan.
- **Mantener índices en orden:** los índices compuestos requeridos por las combinaciones `where` + `orderBy` están documentados en el encabezado del archivo.

---

## 2. Estructura del servicio

### Colecciones mapeadas

| Constante | Colección Firestore |
|---|---|
| `schools` | `escuelas` |
| `users` | `usuarios` |
| `attendances` | `asistencias` |
| `news` | `novedades` |
| `incidents` | `incidentes` |
| `docentes` | `docentes` |
| `docenteAttendances` | `asistencia_docentes` |
| `fotos` | `fotos` |

### Dos modos de acceso

1. **Consultas de una sola lectura / escritura** (funciones `async` con `getDocs`/`getDoc`/`addDoc`/`updateDoc`/`deleteDoc`).
2. **Suscripciones en tiempo real** (funciones `subscribe*` con `onSnapshot`): cada vez que cambia un documento de la consulta, se notifica al callback y la interfaz se actualiza al instante.

---

## 3. Servicios por dominio

### 3.1 Escuelas

| Función | Descripción |
|---|---|
| `getSchools()` | Lista todas las escuelas |
| `getSchoolById(id)` | Obtiene una escuela por id |
| `addSchool(data)` | Crea una escuela (Supervisor) |
| `updateSchool(id, data)` | Edita una escuela (Supervisor) |
| `deleteSchool(id)` | Elimina una escuela (Supervisor) |

### 3.2 Usuarios

| Función | Descripción |
|---|---|
| `getUsersBySchool(schoolId)` | Usuarios de una escuela |
| `getAllUsers()` | Todos los usuarios (Supervisor) |
| `addUserProfile(...)` | Crea perfil de usuario (Supervisor) |
| `setUserActive(id, active)` | Activa/desactiva un usuario |
| `updateUserProfile(id, data)` | Edita un usuario |

### 3.3 Asistencia de gestión

| Función | Descripción |
|---|---|
| `addAttendance(dto)` | Guarda una asistencia |
| `setAttendanceVerified(id, verified, ...)` | Verificación por el Supervisor |
| `getAttendanceByUserAndDate(...)` | Asistencia de un usuario en una fecha (duplicados) |
| `getAttendancesBySchool(schoolId, start, end)` | Asistencias de una escuela en un rango |
| `getTodayAttendances()` | Asistencias de hoy (todas) |
| `getTodayAttendancesBySchool(id)` | Asistencias de hoy de una escuela |
| `getAllAttendancesBySchool(id)` | Todas las asistencias de una escuela |
| `getAllAttendances(start?, end?)` | Asistencias en rango (jurisdicción, Supervisor) |

### 3.4 Asistencia de docentes

| Función | Descripción |
|---|---|
| `addDocenteAttendance(dto)` | Guarda asistencia de docentes |
| `setDocenteAttendanceVerified(...)` | Verificación por el Supervisor |
| `getDocenteAttendanceByUserAndDate(...)` | Duplicados |
| `getDocenteAttendancesBySchool(...)` | Asistencias docentes de una escuela |
| `getAllDocenteAttendances(start?, end?)` | Asistencias docentes en rango (Supervisor) |

### 3.5 Docentes

| Función | Descripción |
|---|---|
| `getDocentesBySchool(id)` | Docentes de una escuela |
| `getAllDocentes()` | Todos los docentes (Supervisor) |
| `addDocente(dto)` | Crea docente (Supervisor) |
| `setDocenteActive(id, active)` | Activa/desactiva docente |
| `updateDocente(id, data)` | Edita docente (Supervisor) |

### 3.6 Novedades

| Función | Descripción |
|---|---|
| `addNews(dto)` | Registra una novedad |
| `getNewsBySchool(id, start, end)` | Novedades de una escuela en rango |
| `getTodayNews()` | Novedades de hoy |
| `getTodayNewsBySchool(id)` | Novedades de hoy de una escuela |
| `getAllNewsBySchool(id)` | Todas las novedades de una escuela |
| `getAllNews(start?, end?)` | Novedades en rango (Supervisor) |

### 3.7 Incidentes

| Función | Descripción |
|---|---|
| `addIncident(dto)` | Registra un incidente |
| `getIncidentsBySchool(id, start, end)` | Incidentes de una escuela en rango |
| `getTodayIncidents()` | Incidentes de hoy |
| `getTodayIncidentsBySchool(id)` | Incidentes de hoy de una escuela |
| `getRecentIncidents(max)` | Incidentes recientes |
| `getAllIncidents(start?, end?)` | Incidentes en rango (Supervisor) |
| `updateIncidentStatus(id, estado, ...)` | Cambia el estado (Solo Supervisor) + traza el historial |

### 3.8 Fotos

| Función | Descripción |
|---|---|
| `addFoto(dto)` | Sube una foto de planilla |
| `deleteFoto(id)` | Elimina una foto |
| `getFotosBySchoolAndDate(id, fecha)` | Fotos de una escuela en una fecha |
| `getFotosBySchool(id)` | Fotos de una escuela |

---

## 4. Suscripciones en tiempo real (`subscribe*`)

Cada una recibe un callback y devuelve una función `Unsubscribe` para cancelar la suscripción al desmontar el componente.

| Función | Descripción |
|---|---|
| `subscribeTodayAttendances(cb)` | Asistencias de hoy en vivo |
| `subscribeTodayAttendancesBySchool(id, cb)` | Asistencias de hoy de una escuela en vivo |
| `subscribeTodayNews(cb)` | Novedades de hoy en vivo |
| `subscribeTodayNewsBySchool(id, cb)` | Novedades de hoy de una escuela en vivo |
| `subscribeTodayIncidents(cb)` | Incidentes de hoy en vivo |
| `subscribeTodayIncidentsBySchool(id, cb)` | Incidentes de hoy de una escuela en vivo |
| `subscribeRecentIncidents(max, cb)` | Incidentes recientes en vivo |
| `subscribeAttendancesBySchool(id, cb)` | Asistencias de una escuela en vivo |
| `subscribeNewsBySchool(id, cb)` | Novedades de una escuela en vivo |
| `subscribeIncidentsBySchool(id, cb)` | Incidentes de una escuela en vivo |
| `subscribeDocenteAttendancesBySchool(id, cb)` | Asistencias docentes de una escuela en vivo |
| `subscribeFotosBySchool(id, cb)` | Fotos de una escuela en vivo |
| `subscribeLast7DaysCounts(cb)` | Conteos diarios de los últimos 7 días (gráficos) |
| `subscribeLast30DaysAttendance(cb)` | Densidad de asistencia de los últimos 30 días (mapa de calor) |

### Patrón de una suscripción

```ts
export function subscribeTodayAttendances(callback) {
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
```

- Se filtra por `fecha >= hoy`, se ordena descendente y se limita a 100 registros.
- `onSnapshot` notifica cada vez que hay cambios (insert, update, delete).
- El id de cada documento se agrega al objeto devuelto (`{ id, ...data }`).

---

## 5. Consultas que requieren índices compuestos

Combinar `where` + `orderBy` en campos distintos exige **índices compuestos** creados en Firebase Console (documentados en `documentation/05_base_datos.md`):

| Consulta | Índice |
|---|---|
| `getSchools` | `activa` + `nombre` |
| `getAttendancesBySchool` | `escuelaId` + `fecha` (range + orderBy) |
| `getNewsBySchool` | `escuelaId` + `fecha` |
| `getIncidentsBySchool` | `escuelaId` + `fecha` |
| `getDocenteAttendancesBySchool` | `escuelaId` + `fecha` |
| `getFotosBySchool` | `escuelaId` + `createdAt` |

> Si una consulta falla, la consola de Firestore sugiere el índice a crear.

---

## 6. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Definir colecciones y constante de mapeo | Semana 1 | ~1 h |
| Servicios de escuelas y usuarios (CRUD) | Semana 1 | ~4 h |
| Servicios de asistencias y asistencia docentes | Semana 1-2 | ~1 día |
| Servicios de novedades, incidentes y fotos | Semana 1-2 | ~1 día |
| Función `updateIncidentStatus` con historial/trazabilidad | Semana 4 | ~3 h |
| Queries jurisdiccionales (Supervisor, rango de fechas) | Semana 4 | ~4 h |
| Suscripciones en tiempo real (`onSnapshot`) | Semana 3 | ~1-2 días |
| Suscripciones de conteos (gráficos y mapa de calor) | Semana 5 | ~4 h |
| Índices compuestos y resolución de fallas | Semanas 1-3 | ~3 h |
| **Total aproximado** | - | **~6-7 días** |

---

## 7. Pendientes y observaciones

- Revisar el límite de 100 registros por consulta y agregar paginación para vistas muy cargadas.
- Centralizar aún más la construcción de queries para evitar duplicación entre funciones `get*` y `subscribe*`.
