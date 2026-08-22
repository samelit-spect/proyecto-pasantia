# CONTEXT — SIPNAM Proyecto Pasantía

> Última actualización: 19/08/2026
> Commits totales: 72

---

## Qué es el proyecto

**SIPNAM** (Sistema Integrado de Partes de Novedades y Asistencias Móvil) + **SAI-Móvil** (Alertas de Incidentes Institucionales). Es una app web para gestión escolar en una jurisdicción educativa.

**Stack:** React 19 + TypeScript + Vite 8 + Firebase (Firestore + Auth) + react-hook-form + Zod + Vitest + PWA

**Presupuesto: NO hay.** Firebase Storage fue descartado. Las fotos se guardan como base64 comprimido en Firestore.

**Mobile-first:** La app se usa mayormente en celular. Hay bottom nav bar, safe areas, touch targets de 44px. Se puede instalar como PWA.

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

### ✅ Respaldo anual + trazabilidad de incidentes (ago 2026)
- **Export global:** queries jurisdiccionales sin límite (`getAll*` en firestore.ts) + util `exportAll.ts` (4 CSV con columna Escuela, incluye motivos de ausencia). Tarjeta "Respaldo de datos" en Panel de Supervisión con rango de fechas, ConfirmDialog y progreso. Las fotos NO se incluyen (base64 pesado; Firebase 12 quitó `select()`).
- **Banner borrado anual:** `RetentionBanner` en Home del supervisor, activo desde 60 días antes del 31/12 (`constants.ts`), cierre diario vía localStorage, CTA → /supervisor. Se auto-reinicia cada año.
- **Trazabilidad incidentes:** modelo `IncidentStatusEvent[]` en `historialEstados`; `addIncident` siembra evento inicial; `updateIncidentStatus(id, nuevo, actor, anterior)` usa `arrayUnion`. Componente `IncidentHistory` visible para supervisor Y escuelas (/historial). `incidentStatusLabel` centralizado. `window.confirm` reemplazado por `ConfirmDialog`.

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

### ✅ Fix infinite re-render + Firestore undefined error + timezone (`f841179`)
- AttendanceForm: `sections` y `loadEntries` en refs
- Firestore: `motivo` se agrega condicionalmente (no `undefined`)
- `startOfToday()` en UTC midnight para consistencia
- Botones "Volver" en 5 páginas

### ✅ Login race condition fix (`42077ee`)
- `login()` espera carga de profile antes de resolver

### ✅ Asistencia docentes simplificada (`7fa8dcb`)
- Reescrita como carga de foto (sin registros individuales)
- Tipo `DocenteAttendance` actualizado: `fotoDataUrl` en lugar de `registros`
- CSS propio en `AsistenciaDocentes.css`

### ✅ Home optimizado (`cccb8a0`, `1ca80bc`)
- Reemplazadas suscripciones onSnapshot con fetch one-time + intervalo 30s
- Optimización `visibilitychange`: pausa intervalo cuando tab inactivo

### ✅ Fix dateKey + supervisor "Hoy" (`7b11b5b`)
- `dateKey()` cambiado a UTC (`toISOString().split('T')[0]`)
- Corregido bug donde la pestaña "Hoy" mostraba vacía

### ✅ Strict Mode fixes (`7186fcb`)
- Eliminados `initialized.current` refs en Home, Historial, SupervisorSchools, SupervisorUsers

### ✅ Incident confirmation + foto delete (`9b4209d`)
- `window.confirm` en cambio de estado de incidentes
- Botón de eliminar foto en `SchoolDetailFotos`

### ✅ Edit/delete schools + edit docentes (`7ed6829`)
- `updateSchool` y `deleteSchool` en firestore.ts
- UI de edición/eliminación en SupervisorSchools
- `updateDocente` en firestore.ts
- UI de edición de docentes en SupervisorSchoolDetail

### ✅ UX crítica - 6 mejoras (`commit previo`)
- Feedback fuera de forms, estados de carga, modal keyboard support
- Desktop navbar, ConfirmDialog, feedback mejorado 8s

---

## UI/UX Mejoras — 12 features implementados

### Par 1: Skeletons + CSS tokens (`f6cfa1d`)
- Componente `Skeleton` reutilizable con shimmer animation
- Skeletons en Home (stats + activity), Supervisor (schools list), Historial (table)
- Tokens unificados: `--shadow-*`, `--radius-*`, `--space-*` en `global.css`

### Par 2: Dark mode + Empty states (`01727e3`)
- Variables CSS semánticas `--accent-*` (green, blue, red, yellow)
- Dark mode integrado en ThemeSettings
- Componente `EmptyState` con 7 ilustraciones SVG (sin escuelas, sin datos, etc.)

### Par 3: Animaciones entry + Button spinner/success (`510c377`)
- Keyframes globales: `fadeInUp`, `fadeIn`, `scaleIn`
- Animaciones escalonadas en Home, Supervisor, Historial
- Componente `Button` (4 variantes, spinner, checkmark de éxito)
- Integrado en Login, SupervisorSchools, SupervisorUsers

### Par 4: Contadores animados + Breadcrumbs (`cc1a065`)
- Hook `useCountUp` con easing cúbico
- Componente `AnimatedStat` para stats del Home
- Componente `Breadcrumb` integrado en Home, SupervisorSchools, SupervisorUsers, SupervisorSchoolDetail, Historial

### Par 5: Timeline visual + Filtros animados (`e7e6b99`)
- Componente `Timeline` con línea vertical, dots coloreados, staggered animation
- Componente `FilterBar` con expand/collapse animado (`grid-template-rows`), pills removibles
- Integrado en Historial

### Par 6: Focus rings + Backdrop blur (`74487a8`)
- `:focus-visible` global con rings
- `backdrop-filter: blur(4-6px)` en ConfirmDialog, AttendanceForm, Lightbox, Navbar
- Slide-up en ConfirmDialog, scale-in en AttendanceForm
- Colores hardcodeados → CSS variables

### Extra 1: Splash screen (`b3197f1`)
- Full-screen gradient, logo pulse, título slide-up, progress bar indeterminada
- Componente `LoadingScreen` animado

### Extra 2: Toasts animados (`f41460c`)
- `ToastContext` + `useToast()` hook
- 4 variantes: success, error, warning, info
- Slide-in, auto-dismiss 4s
- Reemplaza banners inline en SupervisorSchools y SupervisorUsers

### Extra 3: Gráficos dashboard (`3c62843`)
- `DashboardCharts` con recharts
- Bar chart (actividad de hoy), donut (estado incidentes), horizontal bar (por categoría)
- Responsive grid, integrado en Home supervisor

### Extra 4: Exportar PDF (`88922ad`)
- `pdfExport.ts` con jsPDF + jspdf-autotable
- PDF branded SIPNAM con tablas multi-página
- Respeta filtros de historial
- Botón de exportación en Historial

### Extra 5: Búsqueda global (`3d5ab0d`)
- `GlobalSearch` con Ctrl+K
- Modal con búsqueda en tiempo real (escuelas, usuarios, docentes)
- Navegación por teclado (↑↓ Enter Escape)
- Backdrop blur, responsive

### Extra 6: Notificaciones in-app (`292ad43`)
- `NotificationBell` con badge counter + dropdown panel
- Firestore subscriptions en tiempo real (incidentes para supervisor, asistencia+novedades para otros)
- Iconos coloreados por tipo
- Auto-dismiss unread al abrir panel
- Pulse animation en badge
- **Importante:** El type `School` se renombró a `SchoolType` en GlobalSearch para evitar colisión con el icono de lucide-react

### PWA (`0d63b11`)
- `vite-plugin-pwa` con manifest, workbox, auto-update
- Iconos 192x192 y 512x512 generados desde SVG (`scripts/generate-icons.mjs`)
- Meta tags: `theme-color`, `mobile-web-app-capable`, `viewport-fit=cover`
- Service worker: cachea assets estáticos + Firestore API (NetworkFirst)
- Se puede instalar como app desde el navegador del celular

### Bottom Nav + Mobile (`0d63b11`)
- `BottomNav` componente: Inicio, Asistencia/Historial/Supervisión + "Más" → drawer
- Solo visible en mobile (<768px)
- Touch targets 44px, `safe-area-inset-bottom`
- Layout responsive: 60px top + 72px bottom en móvil
- `overscroll-behavior: none`, `tap-highlight-color: transparent`

### Fix navbar tablet (`af18e32`, `9096180`)
- Hamburger visible en TODAS las resoluciones (antes se ocultaba en 768px+)
- Desktop links solo en ≥1024px
- Tablet (768-1024px): hamburger + drawer

### Fix botón volver (`f6138f6`)
- Padding aumentado: 0.625rem 1rem, min-height 44px
- Clase separada `supervisor__header-back` para botones icon-only (44x44)
- Eliminadas definiciones duplicadas de CSS

---

## Arquitectura de componentes clave

### Pages principales
| Ruta | Componente | Rol |
|---|---|---|
| `/` | `Home.tsx` | Home universal (supervisor ve jurisdicción, director ve su escuela) |
| `/supervisor` | `SupervisorSchools.tsx` | Supervisor — listado de escuelas |
| `/supervisor/escuela/:id` | `SupervisorSchoolDetail.tsx` | Supervisor — detalle de escuela (Hoy/Histórico) |
| `/asistencia` | `Asistencia.tsx` | Director/Vice/Preceptor — carga asistencia gestión |
| `/asistencia-docentes` | `AsistenciaDocentes.tsx` | Director/Vice/Preceptor — carga asistencia docentes (foto) |
| `/novedades` | `Novedades.tsx` | Director/Vice — carga novedades |
| `/incidentes` | `Incidentes.tsx` | Director/Vice — carga incidentes |
| `/fotos` | `Fotos.tsx` | Preceptor — sube fotos de planillas |
| `/historial` | `Historial.tsx` | Director/Vice/Preceptor — consulta histórica |
| `/supervisor/usuarios` | `SupervisorUsers.tsx` | Supervisor — gestión de usuarios |
| `/tema` | `ThemeSettings.tsx` | Todos — configuración de apariencia |

### Components comunes (21)
- `BottomNav/` — Bottom nav bar mobile
- `Breadcrumb/` — Navegación de migas
- `Button/` — Botón reutilizable (variantes, spinner, success)
- `ConfirmDialog/` — Diálogo de confirmación
- `ConnectionBanner/` — Banner offline/conexión
- `DashboardCharts/` — Gráficos recharts
- `DatePicker/` — Selector de fechas
- `EmptyState/` — Estado vacío con ilustraciones
- `ErrorBoundary/` — Error boundary global
- `FilterBar/` — Barra de filtros animada
- `FotoThumb/` — Miniatura de foto
- `GlobalSearch/` — Búsqueda global Ctrl+K
- `LoadingScreen/` — Splash/loading screen
- `Navbar/` — Navbar top con hamburger + drawer
- `NotificationBell/` — Campana de notificaciones en tiempo real
- `Pagination/` — Paginación client-side
- `SchoolSelect/` — Selector de escuelas
- `Skeleton/` — Skeleton loading con shimmer
- `StatusBadge/` — Badge de estado
- `Timeline/` — Timeline visual de actividad

### Components supervisor (8)
- `AccordionSection/`, `Lightbox/`, `SchoolDetailAttendances/`, `SchoolDetailDocentes/`, `SchoolDetailFotos/`, `SchoolDetailIncidents/`, `SchoolDetailNews/`, `SchoolDetailUsers/`

### Components forms (1)
- `AttendanceForm/` — Formulario compartido asistencia gestión + docentes

### Servicios y utilidades
- `src/services/api/firestore.ts` — 52 exports (CRUD + suscripciones onSnapshot)
- `src/services/api/auth.ts` — CreateUserAccount, sendPasswordReset (admin app aislada)
- `src/context/AuthContext.tsx` — Auth state, `hasRole()`, `canAccess()`, `profile.escuelaId`
- `src/context/ToastContext.tsx` — ToastProvider, `useToast()`, 4 variantes, auto-dismiss 4s
- `src/hooks/useCountUp.ts` — Contador animado con easing cúbico
- `src/hooks/useFeedback.ts` — Estados de operación (loading/success/error)
- `src/utils/validation.ts` — Schemas Zod para formularios
- `src/utils/constants.ts` — Labels, tipos, `FEEDBACK_AUTO_CLEAR_MS = 8000`
- `src/utils/dateKey.ts` — Función `dateKey()` UTC-based para normalizar fechas
- `src/utils/authErrors.ts` — Mensajes de error de Firebase Auth
- `src/utils/image.ts` — `fileToCompressedDataUrl()` para fotos
- `src/utils/pdfExport.ts` — Exportación PDF con jsPDF + autoTable
- `src/utils/exportCsv.ts` — Exportación CSV

---

## Firestore — Colecciones y reglas

### Colecciones
| Colección | Descripción | Campos clave |
|---|---|---|
| `escuelas` | Escuelas de la jurisdicción | `nombre`, `turno`, `direccion`, `activa` |
| `usuarios` | Perfiles de usuario | `uid`, `email`, `nombre`, `rol`, `escuelaId`, `activo` |
| `asistencias` | Asistencia de gestión (masiva) | `escuelaId`, `fecha`, `registros[]`, `cargadoPor` |
| `asistencia_docentes` | Asistencia de docentes (foto) | `escuelaId`, `fecha`, `fotoDataUrl`, `cargadoPorNombre`, `cargadoPor` |
| `docentes` | Catálogo de docentes por escuela | `nombre`, `materia`, `escuelaId`, `activo` |
| `fotos` | Fotos de planillas firmadas | `escuelaId`, `fecha`, `dataUrl`, `autorId` |
| `novedades` | Novedades institucionales | `escuelaId`, `fecha`, `tipo`, `hora`, `descripcion`, `cargadoPorNombre` |
| `incidentes` | Incidentes/informes | `escuelaId`, `fecha`, `categoria`, `urgencia`, `descripcion`, `ubicacion`, `fotoDataUrl`, `estado` |

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
Las suscripciones onSnapshot se usan en Historial, SupervisorSchoolDetail (vista Hoy), Home (no-supervisor activity), NotificationBell. Home supervisor usa fetch one-time + intervalo 30s con pausa en `visibilitychange`.

### 4. Asistencia de docentes
El tipo `DocenteAttendance` tiene `fotoDataUrl` (base64 comprimido). No tiene `registros[]` como `Attendance`. El componente `SchoolDetailAttendances` maneja ambos tipos.

### 5. Tests
52 tests pasando. Ejecutar con `npx vitest run` o `npm run test`.

### 6. Lint
`npm run lint` debe retornar 0 errores, 0 warnings antes de cada commit.

### 7. Build
`npx tsc -b --noEmit` debe pasar sin errores de tipos. `npx vite build` genera service worker + precache.

### 8. Tema/colores
CSS variables: `--primary-color`, `--primary-light`, `--background-color`, `--surface-color`, `--text-color`, `--text-secondary`, `--border-color`. Persistencia en `localStorage` key `sipnam-theme`.

### 9. Fotos
Base64 comprimido (~1024px, JPEG ~0.6 calidad). Límite ~1MiB por documento Firestore. Sin Firebase Storage.

### 10. Horarios de sesión
La sesión de usuario se mantiene mientras Firebase Auth esté activo. No hay timeout custom.

### 11. `dateKey()` y timezone
`dateKey()` usa UTC (`toISOString().split('T')[0]`). Firestore guarda fechas en UTC midnight. Consistencia verificada.

### 12. React 18/19 Strict Mode
Los `initialized.current` refs en useEffect blocks rompen el re-mount de Strict Mode. Fueron eliminados de Home, Historial, SupervisorSchools, SupervisorUsers.

### 13. PWA
- Service worker generado por `vite-plugin-pwa` con workbox
- Iconos generados con `sharp` via `scripts/generate-icons.mjs`
- Manifest en `vite.config.ts` (VitePWA plugin)
- Meta tags en `index.html`: `theme-color`, `mobile-web-app-capable`, `viewport-fit=cover`
- Firestore API cacheada con `NetworkFirst` strategy

### 14. Mobile-first
- Bottom nav bar visible en <768px
- Hamburger visible en todas las resoluciones
- Desktop links solo en ≥1024px
- Safe area insets para celulares con notch
- Touch targets mínimos 44px
- `overscroll-behavior: none` para evitar pull-to-refresh

### 15. Import collision
El type `School` de `@/types` fue renombrado a `SchoolType` en `GlobalSearch.tsx` para evitar colisión con el icono `School` de `lucide-react`.

---

## Tareas pendientes conocidas

### Firebase Console
- [ ] Crear 17 escuelas en Firestore `escuelas`
- [ ] Crear usuarios iniciales (1 director por escuela)

### Testing
- [ ] Tests de AuthContext
- [ ] Tests de Firestore services (CRUD schools, docentes, attendance)
- [ ] Tests de formularios de novedades/incidentes

### Mejoras futuras
- [ ] Evaluar reducir bundle de Firebase (~930KB monolítico)
- [ ] Evaluar índices compuestos adicionales
- [ ] Offline: sync automático de incidentes creados sin conexión

### UX media (audit completado, priorizado)
- [ ] Incidentes: `object-fit: contain` en vez de `cover` para fotos
- [ ] Incidentes: validación de tamaño de archivo
- [ ] Novedades/Incidentes: feedback cuando user context falta
- [ ] Historial: validación dateFrom > dateTo
- [ ] Navbar: active page indicator en drawer
- [ ] SupervisorSchoolDetail: descomponer componente (634 líneas)
- [ ] SupervisorSchoolDetail: hooks de feedback separados (statusOp reutilizado)
- [ ] SupervisorUsers: sort controls en lista
- [ ] Login: password visibility toggle
- [ ] Login: focus management después de error
- [ ] Home: empty state para supervisor cuando no hay actividad

### Mobile
- [ ] Swipe gestures para navegar entre vistas
- [ ] Pull-to-refresh en listas
- [ ] Mejorar formularios para input nativo del celular (date, file)
- [ ] Splash screen personalizado para iOS (apple-touch-startup-image)
