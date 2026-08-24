# 08 - Tareas Pendientes

> Última actualización: 22/08/2026
> Commits totales: 98

---

## Completado en sesiones anteriores (47 commits iniciales)

### Testing y calidad
- ✅ Tests de componentes (52 tests, `@testing-library/user-event`)
- ✅ React.memo en 10 componentes
- ✅ ErrorBoundary global
- ✅ Suspense fallback + HydrateFallback

### Arquitectura
- ✅ Descomponer SupervisorSchoolDetail (8 subcomponentes)
- ✅ Custom hook `useFeedback` para estados
- ✅ Paginación client-side en Historial
- ✅ dateKey centralizado + makeVerifyHandler
- ✅ Lazy load de rutas (ya existía)

### UX/UI
- ✅ Confirmaciones antes de eliminar
- ✅ Feedback 5 segundos
- ✅ Tooltips CSS
- ✅ Botón volver en Panel de Supervisión
- ✅ Vista Hoy/Histórico en detalle de escuela
- ✅ Theme settings con dark/light toggle
- ✅ Estética de cards de escuelas (stats, colores)

### Funcionalidad
- ✅ Home para directores/preceptores (Mi escuela + actividad)
- ✅ Eliminar SchoolSelect de formularios (usa `profile.escuelaId`)
- ✅ Editar usuarios + restablecer contraseña
- ✅ Tiempo real con onSnapshot en paneles
- ✅ Offline persistence modernizado

### Fix
- ✅ EntrySeq global
- ✅ SchoolSelect para directores (`getSchoolById`)

---

## Completado en sesión de bugfixing (10 commits: f841179..7ed6829)

### Bugs críticos
- ✅ Infinite re-render en AttendanceForm (refs para sections/loadEntries)
- ✅ Firestore undefined error (motivo condicional)
- ✅ Timezone bug (startOfToday en UTC midnight)
- ✅ Login race condition (await profile load)
- ✅ dateKey mismatch (UTC-based para consistencia)
- ✅ Strict Mode: eliminados initialized.current de 4 páginas

### Funcionalidad
- ✅ Asistencia docentes simplificada a foto upload
- ✅ Home supervisor migrado de polling 30s a onSnapshot (tiempo real real)
- ✅ Panel /supervisor con suscripciones subscribeToday* (indicadores del día en vivo)
- ✅ Galería de fotos del detalle de escuela con subscribeFotosBySchool (en vivo)
- ✅ Home no-supervisor mantiene polling 30s + visibilitychange (única vista sin tiempo real)
- ✅ Edit/delete schools desde supervisor UI
- ✅ Edit docentes desde supervisor UI
- ✅ Confirmación cambio estado incidentes
- ✅ Botón eliminar fotos
- ✅ Botones "Volver" en 5 páginas

---

## Completado en sesión de UX crítica (18/08/2026)

### UX crítica - 6 mejoras
- ✅ Feedback fuera de forms (SupervisorSchools, SupervisorUsers)
- ✅ Estados de carga en Home e Historial
- ✅ Modal keyboard support (Escape + auto-focus) en AttendanceForm
- ✅ Desktop navbar con links horizontales (≥768px)
- ✅ ConfirmDialog componente reemplaza window.confirm() en 4 lugares
- ✅ Feedback mejorado: timer 8s + botón × en todas las páginas

### Archivos nuevos
- `src/components/common/ConfirmDialog/ConfirmDialog.tsx`
- `src/components/common/ConfirmDialog/ConfirmDialog.css`

---

## Completado — Respaldo anual (21/08/2026)

### Export global (Parte 1)
- ✅ Queries jurisdiccionales sin límite: `getAllAttendances`, `getAllDocenteAttendances`, `getAllNews`, `getAllIncidents` (`firestore.ts`)
- ✅ Util `exportAll.ts`: descarga 4 CSV (gestión, docentes, novedades, incidentes) con columna Escuela + detalle de motivos
- ✅ Tarjeta "Respaldo de datos" en Panel de Supervisión con rango de fechas opcional, ConfirmDialog y progreso

### Banner de borrado anual (Parte 2)
- ✅ Constantes de retención en `constants.ts`: `RETENTION_WARNING_DAYS_BEFORE` (60 días), `getYearEndPurgeDate()`, `daysUntilYearEndPurge()`, `shouldShowRetentionWarning()`
- ✅ Componente `RetentionBanner`: aviso amarillo persistente en Home para el supervisor desde 60 días antes del 31/12, con CTA "Exportar respaldo" → /supervisor
- ✅ Cierre diario (localStorage `sipnam-retention-dismissed`), reaparece al día siguiente
- ✅ Tests con fechas simuladas (`RetentionBanner.test.tsx`, 4 casos)

### Trazabilidad de incidentes — servicio (Parte 3a)
- ✅ Tipo `IncidentStatusEvent` + campo `historialEstados[]` en el modelo Incident
- ✅ `addIncident` siembra el evento inicial ("pendiente" creado por la escuela)
- ✅ `updateIncidentStatus(incidentId, newStatus, actor, estadoAnterior)` agrega cada cambio con `arrayUnion`: quién, cuándo y desde qué estado
- ✅ Caller en SupervisorSchoolDetail pasa el perfil del supervisor como actor

### Trazabilidad de incidentes — UI (Parte 3b)
- ✅ Componente `IncidentHistory` (common): historial compacto con dots por estado y colores consistentes con StatusBadge
- ✅ Panel supervisor: historial visible dentro de cada incidente (`SchoolDetailIncidents`)
- ✅ Escuelas: las escuelas ven el avance del incidente en `/historial` (quién cambió el estado y cuándo)
- ✅ Reemplazado `window.confirm` nativo por `ConfirmDialog` en cambio de estado de incidentes
- ✅ Refactor: `incidentStatusLabel` centralizado en constants.ts (usado por StatusBadge data, export CSV y confirmación)
- ✅ Tests de IncidentHistory (2 casos)

---

## Completado — Tiempo real supervisor (21/08/2026, `e04683c`)

- ✅ `/supervisor`: indicadores del día con `subscribeToday*` (onSnapshot en vez de fetch one-time)
- ✅ Home supervisor: polling 30s reemplazado por 4 suscripciones onSnapshot + contador de settle para el skeleton
- ✅ Detalle escuela: fotos en vivo con nueva `subscribeFotosBySchool` (índice ya existía)
- Única excepción: Home no-supervisor mantiene fetch + intervalo 30s

---

## Completado — Animaciones y colores (22/08/2026)

Plan de 12 mejoras con detalle técnico por ítem en `documentation/18_animaciones.md`. Resumen de commits:

- ✅ `d4399f2` Listas de actividad con auto-animate (Home, Timeline, /supervisor)
- ✅ `af80f33` Grilla de escuelas animada (entradas/salidas)
- ✅ `c8c89d8` Acordeones con useAutoAnimate (AccordiónSection genérico)
- ✅ `d2c8b3c` Toasts con entrada/salida animada
- ✅ `b359aa9` IncidentHistory animado
- ✅ `c55d764` View Transitions en toda la navegación (prop viewTransition)
- ✅ `4bfbd05` Morph card escuela → detalle (view-transition-name school-hero)
- ✅ `56e9929` ConfirmDialog con Motion (LazyMotion domAnimation strict instalado en main.tsx)
- ✅ `ebceadc` RetentionBanner slide down/up + test adaptado
- ✅ `c4bedf1` Lightbox zoom centrado (morph shared-element descartado: +48kb gzip)
- ✅ `9afcded` Crossfade skeleton → contenido (reutiliza .animate-fade-in)
- ✅ `29af763` Paleta derivada con color-mix(in oklch) + aurora ambiental animada + gradiente en botones primarios/saludo (0kb JS)

Dependencias nuevas justificadas: `@formkit/auto-animate` (~3kb), `motion` (~35kb gzip efectivo).

### Fix UI
- ✅ `4be4996` Botones editar/eliminar del SchoolCard siempre al fondo (fila propia full-width en móvil; link flex:1 en desktop)

---

## Completado — Auditoría de gestión (24/08/2026)

- ✅ Campos de auditoría en usuarios y docentes: `creadoPor`, `creadoPorNombre`, `editadoPor`, `editadoPorNombre`, `editadoEn` (types + services con parámetro opcional `actor`)
- ✅ SupervisorUsers: pasa su perfil como actor al crear, editar y activar/desactivar usuarios; lista muestra "Creado por X" y "Editado por X · fecha"
- ✅ SupervisorSchoolDetail / SchoolDetailDocentes: actor al crear, editar y activar/desactivar docentes; línea de auditoría bajo cada docente

---

## Pendiente

### Bugs (prioritario)
- [ ] **Firestore: permission-denied al iniciar sesión** (`AuthContext.tsx:45`). La regla `usuarios.read` en `firestore.rules` evalúa `isSupervisor()` (con `get()`) antes del check de uid propio; si el perfil no existe aún, deniega. Fix: reordenar regla (uid propio primero), blindar `userProfile()` con `exists()`, y `firebase deploy --only firestore:rules`.

### Firebase Console
- [ ] Crear 17 escuelas en Firestore `escuelas`
- [ ] Crear usuarios iniciales (1 director por escuela)

### Testing (prioritario)
- [ ] Tests de AuthContext
- [ ] Tests de Firestore services (CRUD schools, docentes, attendance)
- [ ] Tests de formularios de novedades/incidentes
- [ ] Fix test pre-existente roto: Login "muestra texto de carga en el botón durante el envío"
- [ ] Evaluar errores eslint react-compiler pre-existentes (setState síncrono en effects, 11 errores)

### Respaldo anual
- [ ] Las fotos (base64) no se incluyen en el export CSV — evaluar ZIP de fotos o backup manual documentado

### Mejoras futuras
- [ ] Evaluar reducir bundle de Firebase (~930KB monolítico)
- [ ] Evaluar índices compuestos adicionales
- [ ] Offline: sync automático de incidentes creados sin conexión

### UX media (priorizado por impacto)
- [ ] Incidentes: `object-fit: contain` en fotos (actualmente `cover` recorta)
- [ ] Incidentes: validación de tamaño de archivo (acepta 50MB+)
- [ ] Novedades/Incidentes: feedback cuando user context falta (silencioso `return`)
- [ ] Historial: validación dateFrom > dateTo
- [ ] Navbar: active page indicator en drawer
- [ ] SupervisorSchoolDetail: descomponer componente (634 líneas)
- [ ] SupervisorSchoolDetail: hooks de feedback separados (statusOp reutilizado para 3 cosas)
- [ ] SupervisorUsers: sort controls en lista
- [ ] Login: password visibility toggle
- [ ] Login: focus management después de error

### Tareas futuras (post-MVP)
- [ ] Crear composite indexes para queries adicionales
- [ ] Ampliar cobertura de tests
- [ ] Evaluar migración a Firebase v12.x si hay nuevas features
