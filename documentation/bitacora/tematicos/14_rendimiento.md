# 14 - Rendimiento

> Este documento de la bitácora recopila las **optimizaciones de rendimiento** aplicadas al proyecto (una PWA enfocada a celulares y redes de baja calidad en escuelas rurales de Tinogasta).

---

## 1. Contexto

- La app recorre **celulares con conexiones limitadas y a veces sin internet**.
- Las **fotos** (asistencia, partes) se guardan como **base64 en Firestore**, que limita cada documento a **1 MB**. Comprimir bien las imágenes es crítico.
- Ser **offline-first** (con Workbox/Service Worker) es la principal mejora percibida de rendimiento.

---

## 2. Optimizaciones aplicadas

### 2.1 Compresión de imágenes (`src/utils/image.ts`)

- `fileToCompressedDataUrl(file)`: redimensiona la imagen en un `<canvas>` a **máx 1024px** en su lado mayor y la codifica como **JPEG con calidad 0.6**.
- Límites de seguridad:
  - Entrada: `MAX_IMAGE_INPUT_BYTES` = **20 MB** (físico de celulares).
  - Salida: `MAX_SAFE_DATA_URL_LENGTH` = **900 KB** (por debajo del límite de 1 MB de Firestore, dejando margen para el resto del documento).
- `validateImageFile` rechaza archivos que no sean imagen o superen 20 MB con mensaje claro.
- Evita que surja el error de "documento demasiado grande" y reduce los datos subidos por la red.

### 2.2 Service Worker / PWA (vite.config.ts)

- **`vite-plugin-pwa`** con `registerType: 'autoUpdate'` (la app se actualiza sola en segundo plano).
- **Precache** de `js, css, html, svg, png, woff2`: la app carga offline al instante.
- **`runtimeCaching` con `NetworkFirst`** para las llamadas a `firestore.googleapis.com`: intenta la red y, si no hay conexión o falla, sirve desde la caché.
- Manifiesto con `display: 'standalone'`, íconos y **shortcuts** a pantallas frecuentes (Asistencia, Historial, Ayuda).

### 2.3 Animaciones eficientes

- **`useCountUp`**: anima contadores con `requestAnimationFrame` + easing cúbico (rápido y sin bloquear el hilo).
- **`useAmbientMotion`**: **desactiva las animaciones ambientales** cuando hay conexión móvil / `saveData` / sin conexión / `prefers-reduced-motion`; las deja solo en Wi-Fi/Ethernet. Ahorra batería y datos.
- Las animaciones de la UI usan transformadas CSS (GPU) en lugar de propiedades que fuerzan layout.

### 2.4 Renders mínimos

- **Lazy loading por ruta**: el enrutador (`src/routes/index.tsx`) usa `lazy: () => load(() => import(...))` con `<Suspense fallback={<LoadingScreen />}>` — cada pantalla carga su propio chunk solo al visitarla.
- **react-hook-form** minimiza los re-renders de formularios (el estado de cada campo se registra sin re-renderizar todo el árbol).
- Estado local en lugar de re-render global (solo los contexts necesarios comparten estado).

---

## 3. Observaciones (pendientes)

- Hay **lazy loading por ruta**: el enrutador (`src/routes/index.tsx`) usa `lazy: () => load(() => import(...))` envuelto en un `<Suspense fallback={<LoadingScreen />}>` en `main.tsx`. Cada pantalla carga su propio chunk de JS solo cuando se visita.
- **No hay `React.memo`/`useMemo`** en el código; aunque el bundle ya está dividido por rutas, **se puede mejorar** memoizando listas/derivaciones costosas donde aporte.
- Evaluar medición de rendimiento real (Lighthouse / Web Vitals) en [deploy].

---

## 4. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Compresión de imágenes (canvas → JPEG base64) | Semana 5 | ~4 h |
| Configuración PWA (manifiesto + workbox) | Semanas 4-5 | ~4 h |
| Cache `NetworkFirst` para Firestore | Semana 5 | ~2 h |
| Animaciones con `requestAnimationFrame` | Semana 4-5 | ~2 h |
| `useAmbientMotion` (desactiva según conexión) | Semana 5 | ~2 h |
| **Total aproximado** | - | **~1.5 días** |

---

## 5. Pendientes / próximos pasos

- Implementar **lazy loading** de rutas y memoización donde aporte.
- Medir Core Web Vitals y tamaño de bundle (`vite-bundle-visualizer`).
