# 08 - Tareas Pendientes

> Última actualización: 18/08/2026
> Commits totales: 57

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
- ✅ Home optimizado (fetch + intervalo 30s + visibilitychange)
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
