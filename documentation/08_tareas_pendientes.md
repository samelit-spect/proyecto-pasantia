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

## Completado — Reglas blindadas (24/08/2026)

- ✅ Fix bug prioritario "permission-denied al iniciar sesión": nueva función `hasProfile()` con `exists()` en `firestore.rules`; todas las funciones que leen `userProfile()` (`isSupervisor`, `userHasAnyRole`, `userBelongsToSchool`, `canSeeSchoolData`, reglas de `usuarios` y delete de `fotos`) la evalúan primero, evitando el error de `get()` cuando el perfil no existe
- ✅ Reglas desplegadas a Firebase (`firebase deploy --only firestore:rules --project sipnam-proyecto`)

---

## Completado — UX menor (24/08/2026)

- ✅ Incidentes: `object-fit: contain` en foto del formulario y del detalle supervisor (ya no recorta)
- ✅ Historial: validación de rango — DatePicker acepta `min`/`max`, 'Desde' limita 'Hasta' y viceversa; si el rango queda invertido se limpia el filtro contradictorio con toast informativo
- ✅ Navbar: indicador de página activa en drawer (resaltado azul según ruta actual)
- ✅ Login: password visibility toggle (mostrar/ocultar contraseña)

---

## Completado — Sync offline de incidentes (24/08/2026)

- ✅ Sync automático con feedback UX: Firestore ya sincroniza solo (persistent cache); se agregó `utils/offlineQueue.ts` (marcador en localStorage de escrituras hechas sin conexión)
- ✅ Incidentes: al guardar sin conexión muestra feedback específico ("guardado en el dispositivo, se sincronizará automáticamente")
- ✅ ConnectionBanner: al volver la conexión y confirmar `waitForPendingWrites(db)`, muestra banner verde "Registros pendientes sincronizados correctamente" por 4s; también cubre el caso de app cerrada offline y reabierta online

---

## Completado — Extras de ayuda 1/5: página /ayuda (24/08/2026)

- ✅ Nueva página `/ayuda` (todos los roles) con acordeón propio y 4 secciones: FAQ filtrada por rol (`details` nativos), uso sin conexión, guía de instalación manual (Android/iOS) y glosario de términos escolares
- ✅ Links de navegación: drawer (con estado activo) + navbar desktop
- Restante del plan elegido: prompt de instalación inteligente, tour de bienvenida, hints contextuales, empty states con acción

---

## Completado — Extras de ayuda 2/5: prompt de instalación (24/08/2026)

- ✅ Componente `InstallPrompt` en MainLayout: captura `beforeinstallprompt` a nivel módulo (evita race con el montaje de React), botón "Instalar" nativo
- ✅ Fallback iOS: detecta iPhone/iPad (incluye iPadOS que se hace pasar por Mac con touch) y muestra instrucciones Compartir → Agregar a inicio + link a /ayuda
- ✅ No molesta: no aparece si ya está instalada (`display-mode: standalone` / `navigator.standalone`), cierre persistente en localStorage, escucha `appinstalled`, delay 2.5s tras cargar
- ✅ Posición: card flotante sobre el BottomNav en móvil (safe-area aware), esquina inferior derecha en desktop

---

## Completado — Extras de ayuda 3/5: tour de bienvenida (24/08/2026)

- ✅ Componente `WelcomeTour` en MainLayout: modal multi-paso con AnimatePresence/motion (respeta reduced motion), dots de progreso, Escape/Saltar/Empezar
- ✅ Pasos según rol: director/vice → Asistencia + Novedades/incidentes + Seguimiento + Ayuda; preceptor → Asistencia + Foto diaria + Ayuda; supervisor → Panel + Verificación + Administración + Ayuda
- ✅ Se muestra una sola vez por usuario (localStorage `sipnam-welcome-seen-v1-{uid}`, delay 600ms tras cargar); saludo personalizado con el nombre
- ✅ Bloquea scroll del body mientras está abierto; link "Saltar" lleva a /ayuda y cierra

---

## Completado — Extras de ayuda 4/5: hints contextuales (24/08/2026)

- ✅ Componente reutilizable `ContextHint` (banner info con botón "no volver a mostrar", persistencia por id en localStorage, estado inicial con initializer perezoso para evitar setState en effect)
- ✅ Hints agregados: Asistencia de gestión (una vez por día), Foto diaria (respaldo + se puede borrar/repetir), Novedades (cuándo usar vs incidente), Incidentes (supervisor lo recibe al instante, foto acelera solución)

---

## Completado — Extras de ayuda 5/5: empty states con acción (24/08/2026)

- ✅ `EmptyState` ahora acepta prop opcional `action` ({ label, to?, onClick? }) que renderiza Link o botón
- ✅ Home "Sin actividad hoy" → botón "Registrar asistencia"
- ✅ Supervisor escuelas vacío → botón "Crear la primera escuela" (abre el formulario)
- ✅ Supervisor usuarios vacío → botón "Crear usuario" (abre el formulario)

## Lote completo: extras de ayuda/onboarding (24/08/2026)

Los 6 extras pedidos están implementados: /ayuda con glosario, prompt PWA inteligente con fallback iOS, tour de bienvenida por rol, hints contextuales y empty states con acción. Ver commits 6db98d3, cb4337c, 17a9d40, a3eb3f4 y el actual.

---

## Completado — Animaciones en tiempo real con gate de red (24/08/2026)

- ✅ Hook `useAmbientMotion`: devuelve si pueden correr animaciones continuas. Respeta `prefers-reduced-motion`, exige online, y usa Network Information API: WiFi/Ethernet → sí; cellular/none/saveData/effectiveType ≤3g → no. Sin API (iOS Safari/Firefox) → activo por defecto (decisión del usuario). Reactivo: escucha `online`/`offline` y el evento `change` de la conexión
- ✅ `AnimatedBackground` (Login + Home): 3 orbes con radial-gradient (sin filter:blur, más barato en GPU), solo transform/scale, keyframes 19–28s alternados; si el gate está apagado no se renderiza nada (costo cero); pausa también con reduced-motion
- ✅ Count-up "gateado": `useCountUp(target, duration, enabled)` — si está deshabilitado salta directo al valor sin animar
- ✅ Badge pulsante "En vivo" en "Resumen del día" del supervisor (solo cuando el gate lo permite)
- ✅ Stats "Mi escuela" (no-supervisor) ahora también cuentan animado, respetando el mismo gate
- ⚠️ Limitación documentada: Safari/iOS no expone Network Information API → ahí las animaciones quedan siempre activas

---

## Completado — Mejoras del benchmark competitivo (24/08/2026)

**Manifest shortcuts (`vite.config.ts`):**
- Mantener presionado el ícono de la app instalada → "Cargar asistencia" (/asistencia), "Ver historial" (/historial), "Centro de ayuda" (/ayuda)
- Solo Android/Chrome (iOS no soporta shortcuts); los roles sin acceso a una ruta son redirigidos por MainLayout

**Feriados argentinos (`utils/holidays.ts` + tests):**
- Feriados nacionales CALCULADOS para cualquier año: fijos + Carnaval/Viernes Santo vía algoritmo de Pascua + traslado al lunes de Güemes/San Martín/Cultural/Soberanía según Ley 27.399 (mar/mié→lunes anterior; jue/vie→lunes siguiente)
- Verificado contra calendario oficial 2026 (Güemes→15/6, Soberanía→23/11) y reglas 2027; 19 tests unitarios nuevos
- NO incluye puentes turísticos ni feriados provinciales (se decretan año a año) — documentado en el JSDoc
- `HolidayNotice` (aviso ámbar no bloqueante, compatible ambos temas vía rgba): integrado en AttendanceForm (gestión y docentes) y Fotos cuando la fecha elegida es feriado

**Recordatorio "falta cargar asistencia" (Home):**
- Banner ámbar con CTA "Cargar" → /asistencia, visible para director/vice/preceptor con escuela asignada cuando pasaron las 10hs, hoy no es fin de semana NI feriado, y myAttendances.length === 0
- Cierre por día: localStorage `sipnam-attendance-reminder-dismissed` guarda el ISO del día; reaparece mañana si sigue sin cargarse

⚠️ Lint pre-existente descubierto: `react-hooks/set-state-in-effect` en AttendanceForm.tsx:92 (efecto de reset con setErrors({}), código original sin tocar)

---

## Pendiente

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
- [ ] Extender marcador offline-sync a novedades y asistencias (hoy solo incidentes)

### UX media (priorizado por impacto)
- [ ] Incidentes: validación de tamaño de archivo (acepta 50MB+)
- [ ] Novedades/Incidentes: feedback cuando user context falta (silencioso `return`)
- [ ] SupervisorSchoolDetail: descomponer componente (634 líneas)
- [ ] SupervisorSchoolDetail: hooks de feedback separados (statusOp reutilizado para 3 cosas)
- [ ] SupervisorUsers: sort controls en lista
- [ ] Login: focus management después de error

### Tareas futuras (post-MVP)
- [ ] Crear composite indexes para queries adicionales
- [ ] Ampliar cobertura de tests
- [ ] Evaluar migración a Firebase v12.x si hay nuevas features
