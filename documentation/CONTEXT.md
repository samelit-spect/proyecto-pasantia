# CONTEXT — SIPNAM Proyecto Pasantía

> Última actualización: 17/08/2026
> Commits totales: 47

---

## Qué es el proyecto

**SIPNAM** (Sistema Integrado de Partes de Novedades y Asistencias Móvil) + **SAI-Móvil** (Alertas de Incidentes Institucionales). Es una app web para gestión escolar en una jurisdicción educativa.

**Stack:** React 19 + TypeScript + Vite 8 + Firebase (Firestore + Auth) + react-hook-form + Zod + Vitest

**Presupuesto: NO hay.** Firebase Storage fue descartado. Las fotos se guardan como base64 comprimido en Firestore.

---

## Roles del sistema

| Rol | Qué hace | Escuela |
|---|---|---|
| **Supervisor** | Ve TODAS las escuelas, verifica asistencias, gestiona incidentes, administra usuarios | Todas |
| **Director** | Carga asistencia (1/día), novedades, incidentes | Su escuela |
| **Vice-director** | Igual que Director | Su escuela |
| **Preceptor** | Carga asistencia, sube fotos de planillas, ve registros | Su escuela |
| **Secretario/a** | Solo es registrado en asistencia (no carga) | — |
| **Conserje** | Solo es registrado en asistencia (no carga) | — |

---

## Lo que ya está hecho (commit por commit)

### ✅ 1.2 — Tests de componentes (`0258180`)
- 52 tests totales (33 nuevos). Instalado `@testing-library/user-event`.

### ✅ 1.3 — Outlet sincronizado (`e56573f`)
- `key={location.pathname}` en `<Outlet>` de MainLayout.tsx

### ✅ 1.4 — Manejo de errores Login (`f26554d`)
- `src/utils/authErrors.ts` con `getAuthErrorMessage()`

### ✅ 2.1 — Descomponer SupervisorSchoolDetail (`cd28bc4`)
- 8 subcomponentes bajo `src/components/supervisor/`

### ✅ 2.2 — Custom hook useFeedback (`47fbb34`)
- `src/hooks/useFeedback.ts` para estados de operación

### ✅ 2.3 — ErrorBoundary global (`f0fe421`)
- `src/components/common/ErrorBoundary/ErrorBoundary.tsx`

### ✅ 2.5 — Fix entrySeq global (`0b9f422`)
- `entrySeq` movido a `useRef` en AttendanceForm

### ✅ 3.1 — Confirmaciones de borrado (`07f15f8`)
- `window.confirm()` en Fotos y SupervisorUsers

### ✅ 3.2 — Feedback 5 segundos (`c776ac6`)
- `FEEDBACK_AUTO_CLEAR_MS = 5000` en constants.ts

### ✅ 3.3 — Paginación client-side (`b59a140`)
- Componente `Pagination`, 15 registros por página en Historial

### ✅ 3.4 — Filtros en Historial (`9b1ebe3`)
- Tipo novedad, categoría incidente, urgencia

### ✅ 3.5 — Form de escuela con Zod (`7347512`)
- react-hook-form + Zod para formulario de SupervisorSchools

### ✅ 4.1 — Offline persistence modernizado (`5f9994d`)
- `initializeFirestore` + `persistentLocalCache` (reemplaza `enableIndexedDbPersistence` deprecado)

### ✅ 4.2 — Debounce en submits (`completed`)
- Todos los formularios tienen `disabled={isSubmitting}`

### ✅ 5.2 — dateKey centralizado (`9b83b81`)
- `src/utils/dateKey.ts` con función `dateKey()`

### ✅ 5.3 — makeVerifyHandler (`9b83b81`)
- Factory para lógica de verificación duplicada

### ✅ 5.4 — Directorios vacíos (`9b83b81`)
- Eliminados `components/ui/` y `types/interfaces/`

### ✅ 6.1 — Lazy load de rutas (`completed`)
- Ya existía con `React.lazy()` + dynamic `import()`

### ✅ 6.2 — React.memo (`75cb86a`)
- 10 componentes envueltos

### ✅ 6.3 — Suspense fallback (`11bf89f`)
- `LoadingScreen` component, `HydrateFallback` en root routes

### ✅ Editar usuarios (`75b1175`)
- Formulario de edición + restablecimiento de contraseña

### ✅ Tooltips CSS (`7774e8f`)
- CSS-only via `data-tooltip`

### ✅ Vista Hoy/Histórico (`368f5d2`)
- Tabs "Hoy" (4 cards de resumen) y "Histórico" en detalle de escuela

### ✅ Botón volver (`75ac4a5`)
- Flecha ← en Panel de Supervisión

### ✅ Theme settings (`f7bd64c`)
- Página `/tema` con color picker, dark/light toggle, localStorage

### ✅ Estética de escuelas (`bfc09ff`)
- Cards con stats por escuela (asistencias/novedades/incidentes)

### ✅ Home directores/preceptores (`a03a195`, `6df21da`)
- Card "Mi escuela" con stats + timeline de actividad

### ✅ Fix SchoolSelect directores (`7724cea`)
- Usa `getSchoolById()` para directores (no collection query)

### ✅ Eliminar SchoolSelect de formularios (`f431f14`)
- Todas las forms usan `profile.escuelaId` automáticamente

### ✅ Firestore onSnapshot (`fd1c364`)
- 12 funciones `subscribe*` en firestore.ts
- Home supervisor: tiempo real en stats, actividad y alertas
- Home director: tiempo real en actividad de hoy
- Detalle escuela supervisor: tiempo real en vista Hoy
- Historial: tiempo real sin loading manual

---

## Arquitectura de componentes clave

### Pages principales
| Ruta | Componente | Rol |
|---|---|---|
| `/` | `Home.tsx` | Home universal (supervisor ve jurisdicción, director ve su escuela) |
| `/escuelas` | `SupervisorSchools.tsx` | Supervisor — listado de escuelas |
| `/escuelas/:id` | `SupervisorSchoolDetail.tsx` | Supervisor — detalle de escuela (Hoy/Histórico) |
| `/asistencia` | `Asistencia.tsx` | Director/Vice/Preceptor — carga asistencia gestión |
| `/asistencia-docentes` | `DocenteAttendance.tsx` | Director/Vice/Preceptor — carga asistencia docentes |
| `/novedades` | `Novedades.tsx` | Director/Vice — carga novedades |
| `/incidentes` | `Incidentes.tsx` | Director/Vice — carga incidentes |
| `/fotos` | `Fotos.tsx` | Preceptor — sube fotos de planillas |
| `/historial` | `Historial.tsx` | Director/Vice/Preceptor — consulta histórica |
| `/usuarios` | `SupervisorUsers.tsx` | Supervisor — gestión de usuarios |
| `/tema` | `ThemeSettings.tsx` | Todos — configuración de apariencia |

### Components clave
- `src/components/forms/AttendanceForm/` — Formulario compartido (gestión + docentes)
- `src/components/supervisor/` — 8 subcomponentes de SupervisorSchoolDetail
- `src/components/common/SchoolSelect/` — Selector de escuelas (usa `getSchoolById` para no-supervisores)
- `src/components/common/Pagination/` — Paginación client-side
- `src/components/common/ErrorBoundary/` — Error boundary global

### Servicios y utilidades
- `src/services/api/firestore.ts` — Todas las queries + 12 suscripciones onSnapshot
- `src/context/AuthContext.tsx` — Auth state, `hasRole()`, `profile.escuelaId`
- `src/utils/validation.ts` — Schemas Zod para formularios
- `src/utils/constants.ts` — Labels, tipos, `FEEDBACK_AUTO_CLEAR_MS`
- `src/utils/dateKey.ts` — Función `dateKey()` para normalizar fechas
- `src/utils/authErrors.ts` — Mensajes de error de Firebase Auth
- `src/utils/image.ts` — `fileToCompressedDataUrl()` para fotos

---

## Firestore — Colecciones y reglas

### Colecciones
| Colección | Descripción | Campos clave |
|---|---|---|
| `escuelas` | Escuelas de la jurisdicción | `nombre`, `activa`, `numero` |
| `usuarios` | Perfiles de usuario | `uid`, `email`, `nombre`, `rol`, `escuelaId`, `activo` |
| `asistencias` | Asistencia de gestión (masiva) | `escuelaId`, `fecha`, `entries[]`, `cargadoPor` |
| `asistencia_docentes` | Asistencia de docentes | `escuelaId`, `fecha`, `entries[]`, `cargadoPor`, `materia` |
| `docentes` | Catálogo de docentes por escuela | `nombre`, `materia`, `escuelaId`, `activo` |
| `fotos` | Fotos de planillas firmadas | `escuelaId`, `fecha`, `dataUrl`, `autorId` |
| `novedades` | Novedades institucionales | `escuelaId`, `fecha`, `tipo`, `hora`, `texto` |
| `incidentes` | Incidentes/informes | `escuelaId`, `fecha`, `categoria`, `urgencia`, `texto`, `ubicacion`, `fotoDataUrl`, `estado` |

### Índices compuestos (`firestore.indexes.json`)
- `asistencias`: `escuelaId + fecha`
- `docentes`: `escuelaId + activo`
- `asistencia_docentes`: `escuelaId + fecha`
- `fotos`: `escuelaId + fecha`
- `novedades`: `escuelaId + fecha`
- `incidentes`: `escuelaId + fecha`

### Reglas de seguridad
- No-supervisores solo leen documentos de su `escuelaId`
- `getSchools()` (collection query) FALLA para directores — usar `getSchoolById()` en su lugar
- Supervisor tiene acceso completo a todas las escuelas

---

## Detalles importantes para retomar

### 1. Users-association model
Los formularios NO tienen dropdown de SchoolSelect. La escuela se toma automáticamente de `profile.escuelaId`. Esto es intencional — el director/preceptor siempre carga para su propia escuela.

### 2. Query de escuelas para directores
Cuando un director llama `getSchools()` (lectura de colección), Firestore bloquea documentos de otras escuelas → la query falla. Solución: usar `getSchoolById(escuelaId)` para leer un documento individual.

### 3. Tiempo real (onSnapshot)
Todos los paneles principales se actualizan en tiempo real:
- `subscribeTodayAttendances` / `subscribeTodayAttendancesBySchool`
- `subscribeTodayNews` / `subscribeTodayNewsBySchool`
- `subscribeTodayIncidents` / `subscribeTodayIncidentsBySchool`
- `subscribeAttendancesBySchool` / `subscribeNewsBySchool` / `subscribeIncidentsBySchool`
- `subscribeDocenteAttendancesBySchool`

### 4. CSV export
La exportación CSV en SupervisorSchoolDetail todavía usa queries one-time (no onSnapshot) para no interferir con la vista.

### 5. Tests
51 tests pasando. Ejecutar con `npx vitest run` o `npm run test`.

### 6. Lint
`npm run lint` debe retornar 0 errores, 0 warnings antes de cada commit.

### 7. Build
`npx tsc -b --noEmit` debe pasar sin errores de tipos.

### 8. Tema/colores
CSS variables: `--primary-color`, `--primary-light`, `--background-color`, `--surface-color`, `--text-color`, `--text-secondary`, `--border-color`. Persistencia en `localStorage` key `sipnam-theme`.

### 9. Fotos
Base64 comprimido (~1024px, JPEG ~0.6 calidad). Límite ~1MiB por documento Firestore. Sin Firebase Storage.

### 10. Horarios de sesión
La sesión de usuario se mantiene mientras Firebase Auth esté activo. No hay timeout custom.

---

## Tareas pendientes conocidas

- [ ] Crear 17 escuelas en Firestore y usuarios iniciales
- [ ] Evaluar reducir bundle de Firebase (SDK monolítico ~930KB)
- [ ] Tests de AuthContext, Firestore services, formularios de novedades/incidentes
- [ ] La paginación del Historial para directores está funcionando con onSnapshot + dateFrom/dateTo
- [ ] Considerar agregar índices compuestos adicionales si se necesitan más queries
