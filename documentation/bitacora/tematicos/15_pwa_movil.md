# 15 - PWA y Móvil

> Este documento de la bitácora recopila cómo la app se comporta como una **PWA (Progressive Web App)** enfocada a **uso móvil**, pensada para celulares del personal escolar en Tinogasta.

---

## 1. Por qué PWA

- Los directores y docentes usan la app **desde el celular**, a menudo con **conexión intermitente**.
- Una PWA permite **instalarla** en la pantalla de inicio (como una app nativa, sin pasar por tiendas) y **funcionar offline**.
- La app es **mobile-first**: diseñada y probada primero para pantallas chicas y táctiles.

---

## 2. Configuración PWA (vite.config.ts)

### Manifiesto
- `name`: SIPNAM — Sistema Integrado de Partes de Novedades y Asistencias Móvil.
- `display: 'standalone'`, `orientation: 'portrait'`, `theme_color: #1e40af`.
- **Íconos** 192x192 y 512x512 (incluido `maskable`).
- **Shortcuts** para acciones rápidas al mantener presionado el ícono:
  - Cargar asistencia (`/asistencia`)
  - Ver historial (`/historial`)
  - Centro de ayuda (`/ayuda`)

### Service Worker (Workbox)
- `registerType: 'autoUpdate'`: la app se **actualiza sola** en segundo plano.
- **Precache** de `js, css, html, svg, png, woff2`.
- **`NetworkFirst`** para Firestore: offline-tolerante (ver documento de Tiempo Real y Offline).
- El `sw.js` compilado además registra FCM (`onBackgroundMessage` → notificación push con la app cerrada, ver `08_notificaciones.md`), `self.skipWaiting()` y `self.clients.claim()`.

### Cómo se actualiza la PWA tras cada deploy (commit + push a `main`)
> Comportamiento real de producción, verificado el 31/08/2026.

- **Web (navegador normal):** al recargar la pestaña ya toma la versión nueva. Sin intervención.
- **App instalada (PWA):** por `registerType: 'autoUpdate'` + `skipWaiting`/`clients.claim`, el service worker **descarga la versión nueva en segundo plano al abrir la app** y la activa. No hace falta desinstalar.
  - Detalle: cuando el `sw.js` cambia, el SW nuevo se descarga y activa (skipWaiting), y el SW activo invalida la precache vieja y baja los assets nuevos (`/assets/*` se sirven con `max-age=31536000, immutable`, pero la nueva precache los redeclara con nombre de hash distinto).
  - **A veces pide una segunda apertura** (cerrar y reabrir) para que el SW control completamente la página activa. Es normal, no es un bug.
- **Cuándo SÍ hace falta desinstalar y reinstalar (último recurso):** solo si el SW quedó "atascado" con una versión vieja (ej. la notificación push no llega con la app cerrada aunque FCM la entregue, porque la app la "captura" como toast al abrir). Reinstalar (o forzar `navigator.serviceWorker.getRegistrations().then(rs => rs.map(r => r.update()))`) limpia el SW. Fue la causa de un diagnóstico engañoso del push el 31/08.
- **Regla de oro para el pasante:** tras cada `git push`, esperar el auto-deploy de Netlify (~1-2 min), recargar la web para verificar; la app del celular se actualiza sola al abrir (a veces con una segunda apertura). No reinstalar salvo problemas puntuales de SW.

---

## 3. Meta tags móviles (index.html)

- `viewport-fit=cover` (para aprovechar pantallas con notch).
- `theme-color` acorde al color primario.
- `mobile-web-app-capable` / `apple-mobile-web-app-*` → soporte iOS.
- `apple-touch-icon` para el ícono en iOS.

---

## 4. Instalación (`InstallPrompt`)

- Escucha el evento **`beforeinstallprompt`** del navegador y lo muestra como **invitación a instalar**.
- **Detección de standalone**: no muestra el aviso si la app ya está instalada o en modo standalone.
- **Modo iOS**: como iOS no dispara `beforeinstallprompt`, muestra instrucciones manuales ("Compartir → Agregar a pantalla de inicio").
- El aviso aparece tras un **delay** (`SHOW_DELAY_MS` ~2.5s) y se puede **descartar** (persistido en `localStorage` `sipnam-install-dismissed`).
- Se oculta automáticamente cuando se dispara el evento **`appinstalled`**.

---

## 5. UX móvil / táctil

- **`BottomNav`**: barra de navegación inferior (patrón de app móvil) con menú lateral ("drawer") para más opciones.
- **`useSwipe`**: gestos de deslizar con el dedo (con umbral configurable).
- **`useHaptic`**: vibración háptica en acciones (exitosa/error).
- **`useKeyboardShortcuts`**: atajos para usuarios de escritorio.
- **`useCountUp`** y animaciones suaves adaptadas al tacto.
- **Controles táctiles grandes** y mensajes claros para dedos (ver documento de UI).
- **Análisis de conectividad**: `useOnlineStatus` y `ConnectionBanner` avisan cuándo hay/sin conexión.

---

## 6. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Configuración PWA (manifiesto + workbox) | Semanas 4-5 | ~4 h |
| Service Worker con `NetworkFirst` | Semana 5 | ~2 h |
| `InstallPrompt` (invitación a instalar + modo iOS) | Semana 5 | ~3 h |
| Meta tags móviles en `index.html` | Semana 1-4 | ~1 h |
| BottomNav y navegación móvil | Semanas 3-5 | ~3 h |
| Gestos táctiles (`useSwipe`, `useHaptic`) | Semana 5 | ~2 h |
| **Total aproximado** | - | **~1.5 días** |

---

## 7. Pendientes y observaciones

- Verificar el ícono `maskable` con el área segura.
- Probar instalación en iOS y Android reales.
- Considerar notificaciones `push` locales al caché (ver documento de Notificaciones).
