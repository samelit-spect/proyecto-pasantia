# 08 - Notificaciones

> Este documento de la bitácora recopila el **sistema de notificaciones** del proyecto: la campana de notificaciones, los toasts en tiempo real, las alertas en vivo del Supervisor y las **notificaciones nativas** del navegador/dispositivo.

---

## 1. Por qué notificaciones

- El **Supervisor** debe enterarse al instante de nuevos incidentes, asistencias y novedades de todas las escuelas, sin tener que revisar manualmente.
- Los **directores/preceptores** deben ver la actividad reciente de su propia escuela.

---

## 2. Componentes del sistema de notificaciones

| Componente | Función |
|---|---|
| `NotificationBell` | Campana en la barra superior con conteo de no leídos y panel desplegable |
| `RealtimeNotifications` | Toasts en tiempo real para el Supervisor (nuevos registros) |
| `SupervisorLiveAlerts` | Alertas en vivo del Supervisor + **notificaciones nativas opt-in** |
| `ToastContext` | Sistema de toasts reutilizable |

Todos se montan en `MainLayout`, de modo que están disponibles en toda la app logueada.

---

## 3. Campana de notificaciones (`NotificationBell`)

- Muestra un **badge con el número de notificaciones no leídas**.
- Al abrir, se marcan como leídas (el contador se pone en 0).
- **Según el rol:**
  - **Supervisor:** se suscribe a `subscribeRecentIncidents` y muestra los **incidentes pendientes** (no resueltos) de todas las escuelas. Al hacer clic navega al panel de supervisión.
  - **Escuelas (director/vice/preceptor):** se suscribe a `subscribeTodayAttendancesBySchool` y `subscribeTodayNewsBySchool` y muestra las asistencias y novedades cargadas hoy en su escuela.
- Las suscripciones se cancelan al desmontar el componente (`unsubscribe`).

---

## 4. Toasts en tiempo real (`RealtimeNotifications`)

- Componente **solo para el Supervisor**.
- Se suscribe a `subscribeTodayIncidents`, `subscribeTodayAttendances` y `subscribeTodayNews`.
- Al recibir datos, muestra un **toast** (aviso temporal) con el detalle del nuevo registro usando `ToastContext`.
- **Evita el "spam" inicial:** con un ref de inicialización, ignora el primer snapshot (que es el estado ya existente) y solo notifica **cambios posteriores**.
- Tipos de toast: `warning` (incidente) e `info` (asistencia/novedad).

---

## 5. Alertas en vivo del Supervisor (`SupervisorLiveAlerts`)

- Componente dedicado al Supervisor con dos funciones:

### 5.1 Alertas en pantalla
- Mantiene una lista de alertas visuales (asistencia, novedad, incidente) con iconos por tipo.
- Detecta **solo registros nuevos** comparando contra un set de ids ya vistos (`seenRef`).
- Si llegan varios a la vez, agrupa en "N registros nuevos de X".
- Las alertas se auto-eliminan después de un tiempo.

### 5.2 Notificaciones nativas (opt-in)
- Pide **permiso de notificaciones** del navegador (banner "opt-in" que desaparece si se descarta o acepta).
- Si el permiso está **otorgado** y la pestaña está **en segundo plano** (`document.visibilityState !== 'visible'`), muestra una **notificación nativa** del dispositivo:
  - A través del **service worker** (`reg.showNotification`), con fallback a `new Notification`.
  - Incluye icono y texto del nuevo registro.
- `notificationsSupported()` valida que el navegador soporte `Notification`.

### 5.3 Web Push con la app cerrada (Firebase Cloud Messaging) — sesión 29/08/2026

> La fase 5.2 solo funcionaba con la **pestaña abierta en segundo plano**. Si la PWA estaba cerrada, no llegaba nada. Esta fase agrega **Web Push real (FCM)** para que el teléfono "despierte" con la notificación aunque la app esté cerrada.

**Arquitectura (3 piezas):**

1. **Service worker combinado (`src/sw.js`)** — se migró `vite-plugin-pwa` de `generateSW` a `injectManifest` (ver `16_pwa_movil.md`). El SW único hace:
   - precache de workbox (`precacheAndRoute`, SPA navigation) + cache `NetworkFirst` de Firestore;
   - importa `firebase/messaging/sw` y `onBackgroundMessage` → muestra la notificación;
   - `notificationclick` → abre/enfoca `/supervisor` (data `url`).
2. **Cliente (`src/services/push.ts` + `src/hooks/usePushNotifications.ts`):**
   - `pushSupported()` exige `serviceWorker` + `PushManager` + `Notification` + `VITE_FIREBASE_VAPID_KEY` definida;
   - `registerForPush(owner, onForeground)` obtiene el token con `getToken({ vapidKey })`, lo guarda en Firestore (`push_tokens`, doc id = token) y suscribe `onMessage` (app abierta → toast);
   - `removePushToken()` borra token local + doc al desloguear/desactivar;
   - `usePushNotifications(enabled)` se activa en `SupervisorLiveAlerts` cuando el permiso es `granted` (deps por primitivos: uid, nombre, rol; limpia el handle al desmontar).
3. **Netlify Function de envío (`netlify/functions/send-push.mjs`)** — sin Firebase Cloud Functions ni plan Blaze:
   - Es una función serverless del plan **gratis de Netlify** (125K invocaciones/mes → este uso es <1%).
   - **No es un trigger de Firestore:** la app la llama con un `fetch` fire-and-forget **después** de cada `addDoc` exitoso (`src/services/pushSender.ts`, enganchado en `firestore.ts` en `addAttendance`, `addDocenteAttendance`, `addNews`, `addIncident`, `addFoto`). Una falla del push NUNCA interfiere con el guardado.
   - **Seguridad:** recibe `{ collection, id }` + `Authorization: Bearer <idToken de Firebase>`. Verifica el token (`admin.auth()`), que el rol pueda cargar en esa colección (mismo mapa que las reglas), `cargadoPor/subidoPor == uid` y `escuelaId == perfil` — y recién ahí busca los tokens y envía con `admin.messaging().sendEachForMulticast`.
   - Limpia tokens inválidos (`registration-token-not-registered`, etc.) para no acumular basura.

**Colección nueva en Firestore:** `push_tokens/{token}` con `userId`, `userNombre`, `role`, `platform`, `activo`, `createdAt`, `updatedAt`. Reglas: el dueño crea/actualiza (exige `userId == auth.uid` y `token == doc id`) y borra el suyo; lectura solo del dueño o supervisor. **Reglas desplegadas.**

**Setup manual pendiente (Netlify y una vez en Firebase):**
1. Firebase Console → ⚙️ Configuración del proyecto → **cuenta de servicio** → **Generar nueva clave privada** → descargar el JSON.
2. Pasar ese JSON (en una sola línea) a la variable de entorno de Netlify **`FIREBASE_SERVICE_ACCOUNT`** (Site configuration → Environment variables).
3. Firebase Console → Configuración → **Cloud Messaging** → copiar el **Web Push certificates / Key pair** y ponerlo en la variable de Netlify **`VITE_FIREBASE_VAPID_KEY`**.
4. Redeploy del sitio en Netlify (el deploy sube automáticamente `netlify/functions/send-push.mjs`).
5. iOS: Web Push en PWA instalada requiere **iOS ≥ 16.4** + permiso; Android Chrome funciona directo.

**Trade-off vs. Cloud Functions (documentado):** como el disparo es del cliente tras guardar, un registro capturado **sin conexión** (cola offline de Firestore) NO dispara el push en el momento de la sincronización automática. Impacto real: mínimo (la conexión offline suele ser temporal y el caso típico es cargar en línea).

**Límites conocidos:** FCM no garantiza entrega inmediata en iOS; el envío replica a todos los dispositivos del supervisor logueados (1 token por dispositivo/sesión).

---

## 6. Cómo se detectan solo los registros nuevos

Tanto `RealtimeNotifications` como `SupervisorLiveAlerts` usan el mismo patrón:

1. En el **primer snapshot** cargan los ids existentes en un `Set` (sin notificar).
2. En los **snapshots siguientes** comparan los ids contra el set: los que no estaban son "nuevos".
3. Agregan los nuevos al set y notifican.

Esto evita notificar datos que ya estaban al iniciar la vista.

---

## 7. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Sistema de toasts (`ToastContext`) | Semana 4 | ~3 h |
| Campana de notificaciones (`NotificationBell`) con conteo | Semana 4 | ~4 h |
| Toasts en tiempo real para Supervisor (`RealtimeNotifications`) | Semana 5 | ~3 h |
| Alertas en vivo del Supervisor (`SupervisorLiveAlerts`) | Semana 5 | ~4 h |
| Notificaciones nativas opt-in (service worker) | Semana 5 | ~3 h |
| Detección de registros nuevos (sets de ids vistos) | Semana 5 | ~2 h |
| **Total aproximado** | - | **~3 días** |

---

## 8. Pendientes y observaciones

- Considerar persistir el "leído/no leído" por usuario en Firestore (hoy el conteo es por sesión).
- **Web Push FCM:** el código está completo (SW + cliente + Netlify Function `send-push.mjs`). Falta el setup manual: clave de servicio en `FIREBASE_SERVICE_ACCOUNT`, VAPID en `VITE_FIREBASE_VAPID_KEY` (ambas en Netlify) y redeploy. Pasos en la sección 5.3.
- Registro **offline** no dispara push al sincronizar (disparo del cliente) — impacto mínimo, documentado en 5.3.
- Revisar el manejo de permisos en iOS (PWA instalada ≥ 16.4).
