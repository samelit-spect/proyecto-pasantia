# 07 - Tiempo Real y Modo Offline

> Este documento de la bitácora recopila dos capacidades clave del sistema: los **datos en tiempo real** (las pantallas se actualizan al instante cuando cambia la base de datos) y el **modo offline** (la app funciona sin conexión y sincroniza al volver el internet).

---

## 1. Tiempo real

### 1.1 Por qué

- El Supervisor debe ver las asistencias, novedades e incidentes de todas las escuelas **en el momento** en que se cargan, sin recargar la página.
- Los directores/preceptores deben ver reflejados al instante los registros de su escuela.

### 1.2 Cómo funciona

Se usan **suscripciones en tiempo real** de Firestore mediante `onSnapshot`. En lugar de consultar una vez, la app se "suscribe" a una consulta y Firebase notifica cada vez que cambia un documento que cumple los criterios.

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

- Cada función `subscribe*` devuelve una **`Unsubscribe`**, que se llama al desmontar el componente para no dejar suscripciones abiertas (evita fugas de memoria y renders innecesarios).

### 1.3 Dónde se aplica

- **Home del Supervisor:** asistencias, novedades e incidentes del día en vivo.
- **Detalle de escuela (Supervisor):** datos de la escuela y sus registros.
- **Historial / listados:** asistencias, novedades, incidentes de una escuela en vivo.
- **Gráficos:** conteos de los últimos 7 días y densidad de asistencia de los últimos 30 días (mapa de calor).

### 1.4 Consideración de rendimiento

- En el **Home** se reemplazaron algunas suscripciones en tiempo real por **fetch periódico** para evitar renders excesivos y consumo de recursos al navegar entre pantallas. Es un equilibrio entre actualidad de los datos y rendimiento.

---

## 2. Modo offline

### 2.1 Por qué

- Las escuelas pueden quedarse **sin internet**. El sistema debe seguir permitiendo cargar asistencias, novedades e incidentes y sincronizarlos después.
- Es un requerimiento funcional y no funcional clave (RF-IN-03 y RNF-03 del módulo de incidentes).

### 2.2 Estrategia de Firestore offline

Firestore tiene **soporte offline nativo** en el SDK web:

1. Los datos leídos se **cachean** automáticamente.
2. Las **escrituras se hacen localmente** y se sincronizan cuando vuelve la conexión.
3. No hace falta implementar la sincronización manual.

### 2.3 Configuración actual (`src/services/firebase.ts`)

Se usa **caché local persistente** con soporte multi-pestaña:

```ts
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
```

> **Nota:** inicialmente se usaba `enableIndexedDbPersistence`, pero esta API está **deprecada**; se migró a `initializeFirestore` con `persistentLocalCache`.

### 2.4 Detección de conexión (`useOnlineStatus`)

Hook que expone si hay conexión escuchando los eventos `online`/`offline` del navegador a partir de `navigator.onLine`.

### 2.5 Marcador de escrituras offline (`src/utils/offlineQueue.ts`)

- `markOfflineWrite()`: se llama antes de guardar un registro sin conexión; guarda una marca en `localStorage`.
- `hasOfflineWrites()`: indica si hay escrituras guardadas localmente pendientes.
- `clearOfflineWrites()`: limpia la marca tras la sincronización.

### 2.6 Banner de conexión (`ConnectionBanner`)

- Si no hay conexión: muestra *"Sin conexión — Los cambios se guardarán y sincronizarán cuando haya internet."* con conteo de pendientes.
- Al volver la conexión: usa `waitForPendingWrites(db)` para esperar la sincronización y luego muestra *"Sincronizado correctamente"* durante unos segundos y limpia el marcador.

### 2.7 Feedback en los formularios

- **Asistencia, novedades e incidentes:** si el envío se hace sin conexión, muestran *"Sin conexión: guardado en el dispositivo. Se sincronizará automáticamente al volver internet."* y llaman a `markOfflineWrite()`.

---

## 3. Comportamiento esperado

### Con conexión

```
Usuario carga un registro
        │
        ▼
Firestore guarda localmente + envía al servidor
        │
        ▼
Datos disponibles en tiempo real (onSnapshot)
```

### Sin conexión

```
Usuario carga un registro
        │
        ▼
Firestore guarda localmente (IndexedDB)
        │
        ▼
App muestra "Guardado localmente" + marca offline
        │
        │   (al restablecerse la conexión)
        ▼
Firestore sincroniza automáticamente (waitForPendingWrites)
        │
        ▼
App muestra "Sincronizado correctamente"
```

---

## 4. Limitaciones del modo offline

| Funcionalidad | Offline | Online |
|---|---|---|
| Crear asistencia | Sí | Sí |
| Crear novedad | Sí | Sí |
| Crear incidente | Sí | Sí |
| Ver registros propios | Sí (cacheados) | Sí |
| Cambiar estado de incidente | No | Sí (Solo Supervisor) |
| Ver todos los registros (Supervisor) | Cacheado | Sí en tiempo real |

---

## 5. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Configuración de persistencia offline (localCache) | Semana 1 | ~1 h |
| Migración de `enableIndexedDbPersistence` deprecado | Semana 3 | ~1-2 h |
| Hook `useOnlineStatus` (detección de conexión) | Semana 3-4 | ~1 h |
| Suscripciones `onSnapshot` en paneles del Supervisor | Semana 3 | ~1-2 días |
| Suscripciones por escuela (Home de directores/preceptores) | Semana 3 | ~1 día |
| Banner de conexión + `waitForPendingWrites` | Semana 4-5 | ~3 h |
| Marcador de escrituras offline y feedback en formularios | Semana 4-5 | ~3 h |
| Indicador de cola offline con contador | Semana 5 | ~2 h |
| Optimización: fetch periódico en Home | Semana 3 | ~2 h |
| **Total aproximado** | - | **~5-6 días** |

---

## 6. Pendientes y observaciones

- Revisar el comportamiento de sincronización en escenarios de conflicto (dos dispositivos editando lo mismo).
- Considerar un límite mayor que 100 registros o paginación para vistas muy cargadas en tiempo real.
