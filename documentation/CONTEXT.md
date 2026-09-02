# CONTEXT — SIPNAM Proyecto Pasantía

> Última actualización: 01/09/2026
> Commits totales: 180+

---

## Qué es el proyecto

**SIPNAM** (Sistema Integrado de Partes de Novedades y Asistencias Móvil) + **SAI-Móvil** (Alertas de Incidentes Institucionales). Es una app web para gestión escolar en una jurisdicción educativa.

**Stack:** React 19 + TypeScript + Vite 8 + Firebase (Firestore + Auth) + react-hook-form + Zod + Vitest + PWA

**Presupuesto: NO hay.** Firebase Storage fue descartado. Las fotos se guardan como base64 comprimido en Firestore.

**Mobile-first:** La app se usa mayormente en celular. Hay bottom nav bar, safe areas, touch targets de 44px. Se puede instalar como PWA.

---

## Roles del sistema

| Rol               | Qué hace                                                                              | Escuela    |
| ----------------- | ------------------------------------------------------------------------------------- | ---------- |
| **Supervisor**    | Ve TODAS las escuelas, verifica asistencias, gestiona incidentes, administra usuarios | Todas      |
| **Director**      | Carga asistencia (1/día), novedades, incidentes                                       | Su escuela |
| **Vice-director** | Igual que Director                                                                    | Su escuela |
| **Preceptor**     | Carga asistencia, sube fotos de planillas, ve registros                               | Su escuela |
| **Secretario/a**  | Solo es registrado en asistencia (no carga)                                           | —          |
| **Conserje**      | Solo es registrado en asistencia (no carga)                                           | —          |

---

## Lo que ya está hecho (commit por commit)

### ✅ Consistencia visual dark mode + micro-interacciones (01/09/2026)

Se revisó el sistema visual. Diagnóstico: el design system era sólido (variables,
tema claro/oscuro, color personalizado, animaciones de entrada, `prefers-reduced-motion`),
pero **varios componentes usaban colores `#hex` fijos** que ignoraban el modo oscuro
(filas de ausentes con fondo casi blanco, puntos/etiquetas "en gestión", feedbacks de
éxito/error, chips de íconos de tarjetas). Se reemplazaron por variables del tema y se
agregaron 2 familias nuevas (`--accent-purple-*`, `--accent-teal-*`).

**Micro-interacciones sumadas:** shine sweep en botón primario (hover) y transición
suave de colores al cambiar tema (`applyTheme(theme, animate)`, clase `.theme-transitioning`
durante ~350ms, respetando reduced-motion). Sin sobre-ingeniería: hovers, `:active` y
spinners ya estaban pulidos.

Se dejaron a propósito los colores de marca que funcionan en ambos modos (ámbar de
banners/vacaciones, escala del heatmap, confeti de éxito).

### ✅ Fix: fecha por defecto "futura" en Novedades/Incidentes/Fotos de noche (01/09/2026)

`Novedades.tsx`, `Incidentes.tsx` y `Fotos.tsx` inicializaban la fecha con
`new Date().toISOString().split('T')[0]` (día **UTC**) mientras el validador
(`todayISO()` en `validation.ts`) compara contra el día **local**. En
UTN-3 (Argentina) de ~21:00 a medianoche el día UTC ya es "mañana" local → el
formulario nacía con fecha inválida y no se podía guardar; la suite fallaba 3 tests
solo si se corría en ese horario. **Fix:** las 3 páginas usan `todayISO()` como
default (convención de asistencias y `DatePicker`).

> Regla para futuro: para valores de FECHA-por-defecto usar siempre `todayISO()`
> (día local), NO `new Date().toISOString().split('T')[0]` (día UTC).

### ✅ Foto diaria accesible para director/vice (01/09/2026)

**Decisión de producto:** en producción habrá **1 sola cuenta por escuela** (rol
`director`, que carga asistencia, novedades, incidentes Y la foto diaria) + 1
supervisor. No se usarán los roles `vice`/`preceptor`/`secretario`/`conserje`.

**Cambio (en repos y commit):** la sección "Foto Diaria" (antes solo `preceptor`)
ahora también permite a `director` y `vice`:
- `firestore.rules` (+ `AuthContext` + `Navbar`)
- Test actualizado: `canAccess('/fotos') === true` para director.

⚠️ **Pendiente manual:** desplegar `firestore.rules` en Firebase Console.

### ✅ Tareas pendientes de UX/media resueltas (01/09/2026)

Cuatro pendientes de `08_tareas_pendientes.md` resueltos en esta sesión:

1. **SupervisorUsers: sort controls** — lista con orden por `nombre`/`rol`/
   `escuela`/`fechaCreacion` + botón de dirección asc/desc (`localeCompare 'es'`).
2. **Login: focus management** — el foco va al mensaje de error (`role="alert"`) tras
   un login fallido.
3. **Tests de AuthContext** (`src/test/AuthContext.test.tsx`): mocks de
   firebase/auth + firestore; cubre inicio de sesión, perfil, logout, permisos.
4. **Tests de Firestore services** (`src/test/firestore.test.ts`): mocks de bajo
   nivel de firebase/firestore; 25 tests de CRUD de escuelas/usuarios/
   docentes/incidentes/asistencias/fotos y suscripciones.
5. **Ampliar cobertura de tests** (`src/test/componentTests.test.tsx`): 19 tests
   de `SchoolDetailToday`, `SchoolDetailFeedback`, `useFeedback` y `SchoolSelect`.
6. **Evaluar bundle de Firebase** (medir y documentar, sin tocar producción):
   `npm run analyze` (`rollup-plugin-visualizer`) → Firestore 107 KB + auth
   33 KB + webchannel 21 KB = **161 KB gzip** del chunk inicial (429 KB gzip).
   recharts/jspdf/html2canvas ya viven en chunks lazy. Firebase es modular y
   tree-shaken; la carga diferida de auth/firestore queda como futuro (alto
   riesgo por el bootstrap de AuthContext).

Suite completa: **176/176 en verde** (eran 115). Commits: `e5865ef`, `fc60243`,
`2dbd48d`, `42568fc`.

### ✅ Refactor SupervisorSchoolDetail (01/09/2026)

**Página descompuesta (estaba en ~720 líneas):**

- Hook `src/hooks/useSchoolDetailData.ts`: toda la lógica de datos (carga
  estática + 5 suscripciones onSnapshot), filtros, y handlers (docentes,
  incidentes, verificación, export CSV, fotos). Exporta `ViewMode`/`ExportType`.
- Componentes nuevos: `SchoolDetailToday` (vista "Hoy") y `SchoolDetailFeedback`
  (banner único reutilizable).
- Hooks de feedback separados: `statusOp` (incidentes), `verifyOp`
  (verificación), `fotoOp` (borrar fotos), `exportOp` (export), `docenteOp`
  (docentes) — ya no comparten estado de carga.
- Página resultante: ~286 líneas de pura composición. Sin cambios funcionales.

### ✅ Notificaciones push con la app cerrada (FCM) — FUNCIONANDO (31/08/2026)

**Problema original:** las notificaciones al supervisor solo funcionaban con la pestaña abierta en segundo plano; con la PWA cerrada no llegaba nada (no había Web Push).

**Solución (sin Firebase Cloud Functions ni plan Blaze — gratis en el plan actual):**

- **SW combinado:** `vite-plugin-pwa` migró de `generateSW` a `injectManifest`. `src/sw.js` hace precache workbox + SPA + cache Firestore Y maneja `onBackgroundMessage` (FCM) y `notificationclick`. Build genera `dist/sw.js` con las 2 cosas.
- **Cliente:** `src/services/push.ts` (`pushSupported`, `registerForPush`, `removePushToken`) con `getToken({ vapidKey: VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: navigator.serviceWorker.ready })` y `onMessage`; `src/hooks/usePushNotifications.ts` integrado en `SupervisorLiveAlerts` cuando `Notification.permission === 'granted'`.
- **Firestore:** colección `push_tokens/{token}` (doc id = token) con `userId/userNombre/role/platform/activo/timestamps`; reglas de dueño + supervisor **desplegadas**.
- **Emisor: `netlify/functions/send-push.mjs`** (función serverless del plan **gratis de Netlify**, usa `firebase-admin`). La app la llama fire-and-forget tras cada `addDoc` (`src/services/pushSender.ts` enganchado en `firestore.ts`). Verifica idToken + rol + autor + escuela antes de enviar. Envía mensajes **`data`** (para que `onBackgroundMessage` del SW siempre se ejecute con la app cerrada), **deduplica tokens por usuario+plataforma** (mantiene el más reciente) y limpia tokens inválidos.
- **env:** `VITE_FIREBASE_VAPID_KEY` (cliente) y `FIREBASE_SERVICE_ACCOUNT` (función) en Netlify. **Ambas configuradas.**

**✅ VERIFICADO FUNCIONAL 31/08/2026:** la novedad que carga el director llega como **banner del sistema al celular del supervisor con la app CERRADA** (`send-push` responde `sent:1`). Mensajes `data` y `notification` por FCM se entregan correctamente.

#### 🔧 Depuración y fixes claves de la sesión (31/08)

1. **VAPID key truncada/inválida (commit inicial):** el `.env` local tenía `VITE_FIREBASE_VAPID_KEY=` vacío y la de Netlify estaba truncada (85 chars). Se regeneró a la key válida `BINV76...` (87 chars, empieza con `B_`).
2. **`getToken` registraba `firebase-messaging-sw.js` inexistente (`messaging/failed-service-worker-registration`):** se pasó `serviceWorkerRegistration: await navigator.serviceWorker.ready` al `getToken` (`d2da66f`). Confirmado `getToken` devolvió token de 142 chars.
3. **Mensaje `notification` no activaba el SW en background:** se cambió el envío a **solo `data`** + `self.skipWaiting()` y `self.clients.claim()` en el SW para que `onBackgroundMessage` siempre se ejecute (`b640d64`).
4. **`sent:0` pese a existir token activo:** era eventual-consistency del token recién registrado. Al re-probar con el token asentado devolvió `sent:1`. Se aísla el problema del **tiempo** (no del código).
5. **Tokens obsoletos tras cada reinstalación:** cada re-instalación generaba un token nuevo `activo:true` y los viejos quedaban para siempre, ensuciando el envío. Fix FINAL (`7453f76`): la deduplicación se hace **en `send-push.mjs` con Admin** (mantiene el token más reciente por `userId::platform`, desactiva los anteriores). **NO hacer la query de limpieza en el cliente** (`where('userId','==',...)` sobre `push_tokens` da `permission-denied` porque las reglas usan `resource.data`, no disponible en queries de colección).

**⚠️ Paso manual original (detalle en `bitacora/tematicos/08_notificaciones.md` §5.3) — YA HECHO vía el setup de Netlify:**

1. Firebase → Configuración → cuenta de servicio → generar clave privada (JSON) → pegarla en Netlify `FIREBASE_SERVICE_ACCOUNT` (hecho).
2. Firebase → Configuración → Cloud Messaging → copiar VAPID (Web Push key pair) → pegarla en Netlify `VITE_FIREBASE_VAPID_KEY` (hecho).
3. Redeploy del sitio en Netlify (automático en cada push a `main`).
4. iOS: PWA instalada ≥ 16.4 para Web Push (no aplicable: el supervisor usa Android).

**⚠️ Lección / gotcha de reinstalación:** la PWA instalada cachea el `sw.js` viejo. Para tomar un SW nuevo hay que **desinstalar y reinstalar la PWA** (o forzar `navigator.serviceWorker.getRegistrations().then(rs => rs.map(r => r.update()))`). Un SW no actualizado puede hacer que la notificación "no llegue" con la app cerrada aunque FCM la entregue (la app la captura como toast al abrir, distinguiéndose por el favicon).

### ✅ Marca PWA + fixes incidentes/exportación (sesión 29/08/2026)

**Ícono de la PWA con marca SIPNAM (`fe5ae4c`, `4cd94fb`, `f1cb19e`):**

- El `favicon.svg` era el logo por defecto de Vite y de ahí salían todos los PNG. Reemplazado por gradiente institucional `#1e40af → #3b82f6` full-bleed + glifo **portapapeles-check en blanco** en la zona segura central (60%) — compatible con Android maskable, iOS y favicon 16px.
- Fuente del glifo guardada en `src/assets/clipboard-check-svgrepo-com.svg` (SVG Repo).
- `scripts/generate-icons.mjs` ahora genera **180×180** para `apple-touch-icon` (ya no apunta a 192).

**Fix: estado de incidente no se persistía (`firestore.rules` + deploy):**

- `updateIncidentStatus` escribe `historialEstados` (arrayUnion) pero las reglas solo permitían `['estado','updatedAt']` → el update era rechazado en silencio y el incidente seguía "pendiente".
- Fix: `onlyChangedFields(['estado','updatedAt','historialEstados'])` en `/incidentes/{incidentId}`, desplegado con `firebase deploy --only firestore:rules --project sipnam-proyecto`.
- **Regla de oro:** todo campo nuevo en un `updateDoc` debe estar en `onlyChangedFields`; las reglas son la fuente de verdad.

**Fix: exportación CSV silenciosa en móvil (`src/utils/exportCsv.ts`):**

- Se revocaba el blob síncronamente tras `link.click()` y el click ocurría después de `await`s (fuera del gesto del usuario) → iOS/PWA cancelaba la descarga sin avisar.
- Fix: `link.rel='noopener'`, ancla en DOM y revoke diferido 4 s.

### ✅ Ayuda y onboarding (sesión 24/08/2026, lote completo)

**Centro de ayuda `/ayuda` (`6db98d3`):**

- Página para todos los roles con acordeón propio (NO reutilizar `AccordionSection`, está acoplado al CSS de supervisor)
- 4 secciones: FAQ filtrada por rol (`<details>` nativos), uso sin conexión, instalación manual Android/iOS, glosario
- Links en drawer móvil + navbar desktop

**Prompt de instalación PWA (`cb4337c`):**

- `InstallPrompt` captura `beforeinstallprompt` a NIVEL MÓDULO (el evento puede dispararse antes de que React monte; si se escucha dentro de useEffect se pierde)
- Fallback iOS: detecta iPhone/iPad incl. iPadOS disfrazado de Mac (`Macintosh` + `ontouchend`) → muestra instrucciones manuales + link a /ayuda
- No aparece si ya está instalada (`display-mode: standalone` / `navigator.standalone`); cierre persistente localStorage; delay 2,5s; escucha `appinstalled`

**Tour de bienvenida por rol (`17a9d40`):**

- Modal multi-paso con AnimatePresence/motion (reduced motion respetado), dots de progreso, Escape/Saltar cierran
- Pasos según rol (director/vice ≠ preceptor ≠ supervisor); saludo con nombre del perfil
- Una sola vez por usuario: localStorage `sipnam-welcome-seen-v1-{uid}`; bloquea scroll del body

**Hints contextuales (`a3eb3f4`):**

- Componente reutilizable `ContextHint` (id → persistencia individual en localStorage)
- Estado inicial con initializer perezoso `useState(() => ...)` — NO setState en effect (regla `react-hooks/set-state-in-effect`)
- En Asistencia (1 vez/día), Fotos (respaldo), Novedades (vs incidente), Incidentes (foto acelera solución)

**Empty states con acción (`5d6f8f1`):**

- `EmptyState` acepta prop opcional `action { label, to?, onClick? }` (Link o botón)
- Home "Sin actividad hoy" → Registrar asistencia; supervisor escuelas/usuarios vacíos → abren su formulario de creación

### ✅ Permisos, auditoría y UX (sesión 24/08/2026)

**Fix permission-denied para no-supervisores (`f26d6e5`):**

- `NotificationBell` se suscribía a las colecciones COMPLETAS de asistencias/novedades sin filtro de escuela → Firestore rechaza queries que pueden traer documentos prohibidos
- Fix: usa `subscribeTodayAttendancesBySchool(profile.escuelaId)` y `subscribeTodayNewsBySchool()`; supervisor mantiene su suscripción global
- **Lección:** toda query de colección necesita el filtro `escuelaId ==` explícito para roles no-supervisor (las reglas se evalúan contra la query, no contra los resultados)

**AuthContext simplificado (`017f44e`):**

- `login()` ya NO carga el perfil: solo hace `signInWithEmailAndPassword` y resuelve
- El perfil lo carga el listener `onAuthStateChanged` → menos código, una sola fuente de verdad
- Warnings por consola si el usuario autenticado no tiene documento de perfil

**Auditoría de gestión usuarios/docentes (`3469262`):**

- Campos nuevos en `UserProfile` y `Docente`: `creadoPor`, `creadoPorNombre`, `editadoPor`, `editadoPorNombre`, `editadoEn`
- Servicios (`addUserProfile`, `updateUserProfile`, `setUserActive`, `addDocente`, `updateDocente`, `setDocenteActive`) aceptan actor opcional `{ uid, nombre }`
- SupervisorUsers y SchoolDetailDocentes pasan su perfil como actor y muestran "Creado por X" / "Editado por X · fecha" en las listas
- Registros ANTERIORES a este cambio no tienen campos de auditoría (son opcionales)

**Reglas blindadas + desplegadas (`21364d9`):**

- Nueva función `hasProfile()` con `exists(...)` en firestore.rules — todas las funciones que leen `userProfile()` la evalúan primero (Firestore corta-circuito en `&&`)
- Cierra el bug prioritario "permission-denied al iniciar sesión" cuando el perfil aún no existe
- Desplegadas: `firebase deploy --only firestore:rules --project sipnam-proyecto`

**UX menor (`0d0c25f`):**

- Fotos de incidentes con `object-fit: contain` (form preview + detalle supervisor)
- `DatePicker` acepta props `min`/`max` (retrocompatible); Historial valida rango Desde/Hasta — si queda invertido limpia el filtro contradictorio con toast info
- Drawer del Navbar marca la página activa (`navbar__drawer-link--active`, patrón `useLocation` igual que BottomNav)
- Login con password visibility toggle (Eye/EyeOff)

**Sync offline con feedback (`e762880`):**

- Firestore ya sincroniza solo (persistent cache); lo nuevo es la trazabilidad visual
- `utils/offlineQueue.ts`: marcador localStorage `sipnam-offline-writes` cuando hay escrituras hechas sin conexión
- Incidentes offline muestra "guardado en el dispositivo, se sincronizará automáticamente"
- ConnectionBanner: al volver la conexión + `waitForPendingWrites(db)` confirmado → banner verde 4s "Registros pendientes sincronizados"; cubre también app cerrada offline y reabierta online

### ✅ Respaldo anual + trazabilidad de incidentes (ago 2026)

- **Export global:** queries jurisdiccionales sin límite (`getAll*` en firestore.ts) + util `exportAll.ts` (4 CSV con columna Escuela, incluye motivos de ausencia). Tarjeta "Respaldo de datos" en Panel de Supervisión con rango de fechas, ConfirmDialog y progreso. Las fotos NO se incluyen (base64 pesado; Firebase 12 quitó `select()`).
- **Banner borrado anual:** `RetentionBanner` en Home del supervisor, activo desde 60 días antes del 31/12 (`constants.ts`), cierre diario vía localStorage, CTA → /supervisor. Se auto-reinicia cada año.
- **Trazabilidad incidentes:** modelo `IncidentStatusEvent[]` en `historialEstados`; `addIncident` siembra evento inicial; `updateIncidentStatus(id, nuevo, actor, anterior)` usa `arrayUnion`. Componente `IncidentHistory` visible para supervisor Y escuelas (/historial). `incidentStatusLabel` centralizado. `window.confirm` reemplazado por `ConfirmDialog`.

### ✅ Tiempo real en todas las vistas del supervisor (`e04683c`)

- `/supervisor` (SupervisorSchools): indicadores del día con `subscribeToday*` (onSnapshot; antes fetch one-time)
- Home supervisor: polling de 30s reemplazado por 4 suscripciones onSnapshot con contador de "settle" (`TOTAL_INIT_STEPS = 5`) para soltar el skeleton
- Detalle escuela: galería de fotos en vivo con `subscribeFotosBySchool` (nueva en firestore.ts); el índice compuesto ya existía
- Única vista que sigue con fetch + intervalo 30s: Home no-supervisor

### ✅ Animaciones, colores y fixes UI (sesión 21–22/08/2026)

Plan de 12 mejoras documentado ítem por ítem en `documentation/18_animaciones.md` (tabla con estado, librería y notas técnicas).

**Librerías incorporadas:**

- `@formkit/auto-animate` (~3kb): listas de actividad, grilla de escuelas, acordeones (AccordiónSection genérico), toasts, IncidentHistory
- View Transitions API (0kb): prop `viewTransition` en Links/navigate + keyframes `vt-exit/vt-enter` globales; morph card escuela → detalle con `view-transition-name: school-hero` y `useViewTransitionState`
- `motion` (~35kb gzip efectivo): LazyMotion `domAnimation` strict en main.tsx (obliga a usar `m.*`, nunca `motion.*`), AnimatePresence para ConfirmDialog, RetentionBanner y Lightbox

**Lección de bundle (medir SIEMPRE):** `domMax` sumaba +48kb gzip → descartado; el loader dinámico de features no sirve si AnimatePresence ya está importado estático. Mejora 10 (lightbox) quedó como zoom centrado con domAnimation. Bundle principal: ~305kb gzip. Si hay que recortar, mejoras 8–10 se pueden rehacer con CSS puro.

**Colores (0kb JS, `29af763`):**

- Tokens derivados con `color-mix(in oklch)` en global.css: `--primary-tint`, `--primary-tint-strong`, `--gradient-accent` — siguen automáticamente al color elegido en /tema y funcionan en claro/oscuro
- Aurora ambiental animada: `body::before` fijo con 2 halos radiales que derivan lentamente (26s, transform compositable, reduced-motion off)
- Gradiente aplicado a `.btn--primary`, botón Guardar de /tema y nombre del saludo (`background-clip: text`)
- Utilidades `.animate-fade-in` reutilizadas para crossfade skeleton → contenido en Home, /supervisor y detalle

**Fix UI (`4be4996`):** botones editar/eliminar del SchoolCard siempre al fondo — en móvil bajan a una fila propia de ancho completo (link horizontal icono|nombre|stats), en desktop el link crece con flex:1 para pegarlas al borde inferior

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

| Ruta                      | Componente                   | Rol                                                                 |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| `/`                       | `Home.tsx`                   | Home universal (supervisor ve jurisdicción, director ve su escuela) |
| `/supervisor`             | `SupervisorSchools.tsx`      | Supervisor — listado de escuelas                                    |
| `/supervisor/escuela/:id` | `SupervisorSchoolDetail.tsx` | Supervisor — detalle de escuela (Hoy/Histórico)                     |
| `/asistencia`             | `Asistencia.tsx`             | Director/Vice/Preceptor — carga asistencia gestión                  |
| `/asistencia-docentes`    | `AsistenciaDocentes.tsx`     | Director/Vice/Preceptor — carga asistencia docentes (foto)          |
| `/novedades`              | `Novedades.tsx`              | Director/Vice — carga novedades                                     |
| `/incidentes`             | `Incidentes.tsx`             | Director/Vice — carga incidentes                                    |
| `/fotos`                  | `Fotos.tsx`                  | Preceptor — sube fotos de planillas                                 |
| `/historial`              | `Historial.tsx`              | Director/Vice/Preceptor — consulta histórica                        |
| `/supervisor/usuarios`    | `SupervisorUsers.tsx`        | Supervisor — gestión de usuarios                                    |
| `/tema`                   | `ThemeSettings.tsx`          | Todos — configuración de apariencia                                 |

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
- `src/utils/offlineQueue.ts` — marcador localStorage de escrituras offline (sync feedback)
- `src/utils/pdfExport.ts` — Exportación PDF con jsPDF + autoTable
- `src/utils/exportCsv.ts` — Exportación CSV

---

## Firestore — Colecciones y reglas

### Colecciones

| Colección             | Descripción                         | Campos clave                                                                                       |
| --------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `escuelas`            | Escuelas de la jurisdicción         | `nombre`, `turno`, `direccion`, `activa`                                                           |
| `usuarios`            | Perfiles de usuario                 | `uid`, `email`, `nombre`, `rol`, `escuelaId`, `activo`                                             |
| `asistencias`         | Asistencia de gestión (masiva)      | `escuelaId`, `fecha`, `registros[]`, `cargadoPor`                                                  |
| `asistencia_docentes` | Asistencia de docentes (foto)       | `escuelaId`, `fecha`, `fotoDataUrl`, `cargadoPorNombre`, `cargadoPor`                              |
| `docentes`            | Catálogo de docentes por escuela    | `nombre`, `materia`, `escuelaId`, `activo`                                                         |
| `fotos`               | Fotos de planillas firmadas         | `escuelaId`, `fecha`, `dataUrl`, `autorId`                                                         |
| `novedades`           | Novedades institucionales           | `escuelaId`, `fecha`, `tipo`, `hora`, `descripcion`, `cargadoPorNombre`                            |
| `incidentes`          | Incidentes/informes                 | `escuelaId`, `fecha`, `categoria`, `urgencia`, `descripcion`, `ubicacion`, `fotoDataUrl`, `estado` |
| `push_tokens`         | Tokens FCM para notificaciones push | `userId`, `userNombre`, `role`, `platform`, `activo`, `token` (doc id), `createdAt`, `updatedAt`   |

### Índices compuestos (`firestore.indexes.json`)

- `asistencias`: `escuelaId + fecha`
- `docentes`: `escuelaId + activo`
- `asistencia_docentes`: `escuelaId + fecha`
- `fotos`: `escuelaId + fecha`
- `novedades`: `escuelaId + fecha`
- `incidentes`: `escuelaId + fecha`

### Reglas de seguridad

- `hasProfile()` con `exists(...)` blanca TODO acceso a `userProfile()` — evita permission-denied cuando el perfil no existe (desplegadas 24/08/2026)
- No-supervisores solo leen documentos de su `escuelaId`; toda query de colección debe incluir el filtro `escuelaId ==` explícito o Firestore la rechaza
- `getSchools()` (collection query) FALLA para directores — usar `getSchoolById()` en su lugar
- Supervisor tiene acceso completo a todas las escuelas

---

## Detalles importantes para retomar

### 1. Users-association model

Los formularios NO tienen dropdown de SchoolSelect. La escuela se toma automáticamente de `profile.escuelaId`. Esto es intencional — el director/preceptor siempre carga para su propia escuela.

### 2. Query de escuelas para directores

Cuando un director llama `getSchools()` (lectura de colección), Firestore bloquea documentos de otras escuelas → la query falla. Solución: usar `getSchoolById(escuelaId)` para leer un documento individual.

### 3. Tiempo real (onSnapshot)

Las suscripciones onSnapshot se usan en Historial, SupervisorSchoolDetail (vista Hoy + fotos), Home supervisor y Home no-supervisor, NotificationBell. SupervisorSchools (panel de escuelas) usa suscripciones subscribeToday* para los indicadores del día; la lista de escuelas queda como fetch one-time. El Home no-supervisor mantiene fetch one-time + intervalo 30s con pausa en `visibilitychange`.

### 4. Asistencia de docentes

El tipo `DocenteAttendance` tiene `fotoDataUrl` (base64 comprimido). No tiene `registros[]` como `Attendance`. El componente `SchoolDetailAttendances` maneja ambos tipos.

### 5. Tests

57 tests (56 pasan + 1 falla PRE-EXISTENTE de Login "muestra texto de carga en el botón"). Ejecutar con `npx vitest run` o `npm run test`.

### 6. Lint

Línea base actual: 16 errores PRE-EXISTENTES (11 react-compiler por setState síncrono en effects + 3 `no-explicit-any` en pdfExport.ts + 1 `purity` en useFormDraft + 1 `preserve-manual-memoization` en Home) + 667 warnings prettier. Verificado contra baseline en la sesión de animaciones (02/09/2026): un cambio no agregó ningún problema nuevo. Detalle en `08_tareas_pendientes.md` (ver entrada ⚠️ deuda de lint).

### 7. Build

`npx tsc -b --noEmit` debe pasar sin errores de tipos. `npx vite build` genera service worker + precache.

### 8. Tema/colores

CSS variables base: `--primary-color`, `--primary-light`, `--background-color`, `--surface-color`, `--text-color`, `--text-secondary`, `--border-color`. Persistencia en `localStorage` key `sipnam-theme`. Desde 22/08 existen además tokens DERIVADOS con `color-mix(in oklch)` (`--primary-tint`, `--primary-tint-strong`, `--gradient-accent`) definidos en global.css que siguen a `--primary-color` automáticamente — usar estos en vez de hardcodear tonos del primario.

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

### 16. Reglas de animación (ver 18_animaciones.md)

- Listas/acordeones/toasts: `useAutoAnimate` de @formkit/auto-animate
- Navegación entre páginas: prop `viewTransition` en `<Link>` / `navigate()`
- Modales y banners con salida: Motion SIEMPRE con `m.*` (LazyMotion es strict, `motion.*` tira error), envueltos en AnimatePresence donde el componente se monta/desmonta
- Toda animación nueva: respetar `prefers-reduced-motion` (useReducedMotion o media query)
- Antes de sumar features de Motion, medir el build — ver lección domMax en 18_animaciones.md

---

## Tareas pendientes conocidas

### Push notifications

- [x] **Push con app cerrada (FCM) — FUNCIONANDO (31/08/2026):** verificado de punta a punta; ver sección "Notificaciones push" arriba.

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
- [x] Extender marcador offline-sync a novedades y asistencias (hecho 24/08/2026:
      mismo patrón que incidentes — `savedOffline` + `markOfflineWrite()` + mensaje
      específico en AttendanceForm, AsistenciaDocentes y Novedades; ConnectionBanner
      global ya las cubría)

### UX media (audit completado, priorizado)

- [x] Incidentes: validación de tamaño de archivo (hecho 24/08/2026 — helpers
      compartidos `validateImageFile` / `isSafeDataUrl` en utils/image.ts, aplicados
      en Incidentes, Fotos y AsistenciaDocentes: rechazo de no-imágenes y >20MB al
      seleccionar + guarda post-compresión contra el límite de 1MB/doc Firestore)
- [ ] Novedades/Incidentes: feedback cuando user context falta
- [ ] SupervisorSchoolDetail: descomponer componente (634 líneas)
- [ ] SupervisorSchoolDetail: hooks de feedback separados (statusOp reutilizado)
- [ ] SupervisorUsers: sort controls en lista
- [ ] Login: focus management después de error
- [ ] Home: empty state para supervisor cuando no hay actividad

### Mobile

- [ ] Swipe gestures para navegar entre vistas
- [ ] Pull-to-refresh en listas
- [ ] Mejorar formularios para input nativo del celular (date, file)
- [ ] Splash screen personalizado para iOS (apple-touch-startup-image)
