# Semana 6 — Marca PWA, fixes de producción y notificaciones push

> **Período:** sábado 29 de agosto de 2026

**Horas acumuladas:** a completar por el pasante.

---

## Objetivo de la semana

Darle **identidad propia a la PWA** (ícono de marca reemplazando al de Vite por defecto), **corregir dos fallos detectados en producción** (el cambio de estado de un incidente no se persistía y la exportación CSV fallaba en silencio en el celular) e **implementar notificaciones push reales (FCM)** para que el supervisor reciba avisos en el celular aunque la app esté cerrada.

---

## Actividades realizadas

### Sábado 29 de agosto

- **Ícono de la PWA con marca SIPNAM:**
  - El `favicon.svg` que llegaba de la plantilla era el **logo de Vite** (rayo morado) y de ahí se generaban todos los PNG (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon`, OG image y logo del login).
  - Se reemplazó por un **squircle con gradiente institucional** `#1e40af → #3b82f6` y un glifo **portapapeles con check en blanco** (fuente: `src/assets/clipboard-check-svgrepo-com.svg` de SVG Repo).
  - El glifo se encuadra en la **zona segura central (60%)** para que Android (maskable), iOS y el favicon de 16px no lo recorten.
  - `scripts/generate-icons.mjs` ahora genera también **180×180** (el correcto para `apple-touch-icon`, antes apuntaba a 192).
  - Commits: `fe5ae4c`, `4cd94fb`, `f1cb19e`.
- **Fix: el estado del incidente no cambiaba en producción (seguía "pendiente").**
  - `updateIncidentStatus` escribe `estado`, `updatedAt` **y `historialEstados`** (evento del historial vía `arrayUnion`), pero `firestore.rules` solo permitía modificar `['estado', 'updatedAt']` → Firestore **rechazaba el update en silencio**.
  - Fix en `firestore.rules` (se agregó `historialEstados` a `onlyChangedFields`) y **despliegue** con `firebase deploy --only firestore:rules --project sipnam-proyecto`.
  - **Lección:** cualquier campo nuevo que se escriba en un `updateDoc` debe existir en la lista de `onlyChangedFields`; si las reglas rechazan, el cliente no lo sabe (el error solo aparece como un banner poco notorio).
- **Fix: la exportación CSV "no pasaba nada" en el celular.**
  - `downloadCsv` revocaba el blob (`URL.revokeObjectURL`) de forma síncrona justo después de `link.click()`, y el click ocurre **después de varios `await`** (fuera del gesto del usuario). En iOS/PWA esto **cancela la descarga en silencio**.
  - Fix en `src/utils/exportCsv.ts`: `link.rel = 'noopener'`, se mantiene el ancla en el DOM y el revoke se difiere 4 s para dejar que el navegador arranque la descarga.
- **Verificación:** `tsc` sin errores, `eslint` limpio en los archivos tocados, **121 tests pasan** (14 archivos).
- **Notificaciones push al celular con la app cerrada (FCM):**
  - El requisito era que al supervisor le llegara una **notificación real al teléfono** cuando una escuela carga asistencia/novedad/incidente, aunque tenga la PWA **cerrada**. El estado anterior (`SupervisorLiveAlerts`) solo mostraba notificación del navegador con la **pestaña abierta en segundo plano**; no había Web Push.
  - **SW combinado:** se migró `vite-plugin-pwa` de `generateSW` a `injectManifest`. `src/sw.js` ahora hace precache workbox + SPA + cache de Firestore **y** maneja `onBackgroundMessage` de `firebase/messaging/sw` + `notificationclick` → abre `/supervisor`. Build: `dist/sw.js` único.
  - **Cliente:** `src/services/push.ts` (`pushSupported`, `registerForPush` con `getToken({ vapidKey: VITE_FIREBASE_VAPID_KEY })`, `onMessage` para toasts en primer plano, `removePushToken`) y `src/hooks/usePushNotifications.ts`, integrado en `SupervisorLiveAlerts` cuando el permiso queda `granted`.
  - **Firestore:** colección `push_tokens/{token}` (doc id = FCM token) con usuario/rol/plataforma/activo; reglas de escritura del dueño y lectura del dueño/supervisor. **Reglas desplegadas** (`Deploy complete!`).
  - **Emisor: Netlify Function (`netlify/functions/send-push.mjs`)** en lugar de Cloud Functions, para **no cambiar el plan** (el plan Blaze de Firebase requería Cloud Functions; Netlify las incluye **gratis** en el plan actual). La app dispara un `fetch` fire-and-forget tras cada `addDoc` (`src/services/pushSender.ts` enganchado en `addAttendance`, `addDocenteAttendance`, `addNews`, `addIncident`, `addFoto`). La función verifica el idToken de Firebase, que el rol pueda cargar en esa colección, que `cargadoPor/subidoPor == uid` y la escuela, y recién entonces envía con `firebase-admin` (`sendEachForMulticast`) + limpieza de tokens inválidos.
  - **Trade-off documentado:** un registro guardado sin conexión (cola offline) no dispara push al sincronizar, porque el disparo es del cliente.
  - Detalle técnico completo en `tematicos/08_notificaciones.md` §5.3.

---

## Dificultades encontradas

- **Regla "silenciosa":** el fallo de permisos de Firestore no muestra un error en consola llamativo ni en la UI (solo un banner arriba). Al usuario le parecía que el sistema "no hacía nada".
- **Descargas en iOS/PWA:** el `download` no se dispara si la descarga ocurre fuera del gesto del usuario y el blob se revoca muy pronto; costo de depuración porque en el escritorio funciona perfecto.
- Modelo de imagen para rediseñar el ícono: no puedo leer imágenes generadas, así que se usó un **glifo SVG conocido (SVG Repo)** que se ensambló a mano sobre el gradiente.

---

## Resultados y evidencias

- PWA con ícono de marca (gradiente azul + portapapeles-check) coherente en login, splash, favicon y pantalla de inicio.
- Cambio de estado de incidentes **persistido** y con evento en el historial (reglas desplegadas).
- Exportación CSV funcionando también en móvil (revoke diferido).
- Notificaciones push implementadas de punta a punta en el código (SW combinado + cliente + Netlify Function `send-push.mjs` + reglas de `push_tokens`). En la sesión del 31/08 se completó el **setup de Netlify** (clave de servicio `FIREBASE_SERVICE_ACCOUNT` + VAPID en `VITE_FIREBASE_VAPID_KEY`) y se **verificó funcional con la app cerrada**.
- Commits de la sesión: `fe5ae4c`, `4cd94fb`, `f1cb19e`, + fixes de incidentes/exportación.

---

## Aprendizajes

- **Reglas de Firestore = la fuente de verdad.** Todo campo que una función de escritura toque debe estar permitido; las reglas se despliegan con `firebase deploy --only firestore:rules`.
- Descarga de archivos en PWA móvil: mantener el ancla y **no revocar el objeto URL en forma síncrona**.
- Íconos de PWA: gradiente full-bleed + símbolo dentro del 60% central (zona segura maskable) y `apple-touch-icon` de 180×180.
- **Web Push sin cambiar el plan:** el "emisor" del push no tiene por qué ser una Cloud Function; una **Netlify Function del plan gratis** (misma plataforma del deploy) cumple el mismo rol, con la única diferencia del disparo (cliente tras guardar en vez de trigger de Firestore).

---

## Pendientes / Próxima semana

- **Push activo y verificado (31/08):** setup de Netlify completo + notificación recibida con la app cerrada (ver sección "Lunes 31 de agosto" más abajo).
- Pruebas en distintos dispositivos del cambio de estado, la exportación y el push en varios celulares.
- Splash screen personalizado para iOS (`apple-touch-startup-image`) — sigue pendiente.
- Preparación de la entrega y documentación final.

---

## Lunes 31 de agosto — Activación y depuración del push (FCM) hasta dejarlo funcionando

> Sesión dedicada íntegramente a **configurar Netlify, depurar y VERIFICAR** el push de punta a punta (director → `send-push` → FCM → celular del supervisor con la app cerrada).

### Qué se hizo
1. **Setup Netlify:** se configuraron las variables `VITE_FIREBASE_VAPID_KEY` y `FIREBASE_SERVICE_ACCOUNT` (todas las scopes) y se hizo redeploy del sitio.
2. **Verificación del backend Netlify Function:** `GET /` → 405 (función viva); POST sin body → 400 `parametros-invalidos`; POST con token falso → 401 `token-invalido` (confirma que `FIREBASE_SERVICE_ACCOUNT` cargó: el Admin inicializó y pudo validar token).

### Bugs encontrados y cómo se resolvieron
- **VAPID key truncada/inválida:** el `.env` local tenía `VITE_FIREBASE_VAPID_KEY=` vacío y la key en Netlify estaba cortada (85 chars, `BF5vk...`). Se regeneró y Netlify quedó con la key válida `BINV76...` (87 chars, empieza con `B_`). Se confirmó que la key válida llega al bundle de producción.
- **`getToken` fallaba:** FCM intentaba auto-registrar `/firebase-messaging-sw.js` (no existía → `messaging/failed-service-worker-registration`, servido como `text/html` por el redirect SPA). Fix: pasar `serviceWorkerRegistration: await navigator.serviceWorker.ready` al `getToken` (`d2da66f`). Log: token de 142 chars registrado en la colección `push_tokens`.
- **El mensaje `notification` no mostraba banner con la app cerrada:** FCM, con un mensaje `notification`, muestra la notificación "automática" solo si el SW está activo; al cambiarlo a **solo `data`** se fuerza la ejecución de `onBackgroundMessage` del SW, que llama `showNotification`. Además se agregaron `self.skipWaiting()` y `self.clients.claim()` al SW (`b640d64`).
- **Falsa alarma `sent:0`:** la función devolvió `sent:0` pese a existir un token activo. Se descubrió que era **eventual-consistency** (el token se acababa de registrar); al re-probar con el token asentado devolvió `sent:1`. Se usó un script `firebase-admin` local para aislar: el envío directo al token dio `successCount: 1` y la notificación llegó.
- **Tokens obsoletos por reinstalación:** cada reinstalación generaba un token nuevo `activo:true` y los viejos quedaban, produciendo entregas parciales/confusas (`sent` entre tokens válidos e inválidos). Se intentó primero limpiar en el cliente (`where('userId','==',...)` en `upsertPushToken`), pero **daba `permission-denied`** porque las reglas de `push_tokens` usan `resource.data` (no disponible en queries de colección) y Firestore evalúa las reglas contra la clave del documento. **Fix final (`7453f76`):** la deduplicación se hace **en `send-push.mjs` con Admin** (bypassa las reglas): se agrupa por `userId::platform` y se mantiene solo el token más reciente, desactivando los anteriores.

### Depuración de diagnóstico (temporal)
- Se agregó logging temporal (`[push]`, `[push-send]`) en `push.ts`, `usePushNotifications.ts`, `SupervisorLiveAlerts.tsx` y `pushSender.ts` para ver en consola el flujo completo. Se **quitó** al final de la sesión, dejando `pushSender.ts` como fire-and-forget silencioso (una falla aquí NUNCA debe bloquear el guardado de Firestore).

### Resultado final (verificado)
- Director carga una novedad → la consola muestra `[push-send] respuesta: 200 {"sent":1}` y la **notificación llega al celular del supervisor como banner del sistema con la app cerrada**.
- Mensajes `data` y `notification` de FCM se entregan correctamente (verificado con envíos directos `messaging.send` y `sendEachForMulticast`).

### Evidencias / commits de la sesión
- `d2da66f` (SW personalizado en getToken), `b640d64` (enviar `data` + `skipWaiting`/`clients.claim`, `7453f76` (deduplicación de tokens en `send-push`), `pushSender.ts` limpio en `f0e1bc9`.

### Aprendizajes de la sesión
- **Reglas de Firestore y queries de colección:** una regla con `resource.data` impide las consultas de colección (Firestore evalúa reglas contra la clave del doc, no contra los resultados). Para operar sobre colecciones con lógica (deduplicar/limpiar) hay que usar **Admin** (server-side), no el SDK del cliente.
- **`data` vs `notification` en FCM Web:** para controlar la notificación con la app cerrada desde el SW, enviá **`data`** y mostralo con `onBackgroundMessage`; un mensaje `notification` depende de que el SW esté activo.
- **Reinstalación de la PWA:** el SW se cachea; un SW desactualizado hace que la notificación "no llegue" con la app cerrada (el mensaje llega pero lo muestra la app como toast al abrirla, se reconoce porque lleva el favicon). Para tomar un SW nuevo hay que reinstalar la PWA.