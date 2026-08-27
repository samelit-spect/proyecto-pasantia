# 12 - Gestión de Estado y Hooks

> Este documento de la bitácora recopila la **gestión de estado** y los **hooks** del proyecto: los providers/context de React, y la biblioteca de hooks reutilizables que componen la lógica de la interfaz.

---

## 1. Estrategia de estado

- **Estado global mínimo:** los estados compartidos que necesitan varios componentes se exponen por **React Context** (AuthContext, ToastContext). El resto es estado local de cada componente.
- **Hooks reutilizables:** la lógica repetitiva se extrae a hooks custom en `src/hooks/`, usados por varios componentes.
- **Persistencia puntual:** algunas preferencias (tema, borradores de formularios) se persisten en `localStorage`.

---

## 2. Providers / Contexts

### `AuthContext`
- Maneja el estado de **autenticación**: `user`, `profile`, `isAuthenticated`, `isLoading`, y las funciones `login`, `logout`, `hasRole`, `canAccess`.
- Detallado en el documento de **Autenticación**.
- Incluye el **cierre de sesión por inactividad** del rol director.

### `ToastContext`
- Sistema de **toasts** (avisos temporales): `addToast(type, message)`.
- Tipos: `success`, `error`, `warning`, `info`, con su icono y color.
- Cada toast se auto-elimina tras **4 segundos**, con **botón de cierre**.
- La lista de toasts se renderiza con `useAutoAnimate` (animación de entrada/salida) y se expone con `role="status"` y `aria-live="polite"` (accesibilidad).

---

## 3. Hooks reutilizables (`src/hooks/`)

| Hook | Función |
|---|---|
| `useTheme` | Tema claro/oscuro + color primario (ver documento de UI) |
| `useOnlineStatus` | Detección de conexión (online/offline) |
| `useFeedback` | Estado de operación: `updatingId`, `feedback`, `start`, `end`, `clear` con auto-limpiado |
| `useFormDraft` | Auto-guardado de formularios en `localStorage` (restaura el borrador, con TTL) |
| `useHaptic` | Vibración del dispositivo (`navigator.vibrate`) con patrones success/error/light |
| `useSwipe` | Gestos de deslizar (touch) con umbral configurable |
| `useCountUp` | Contador animado hacia un valor objetivo (con easing) |
| `useKeyboardShortcuts` | Atajos de teclado (ej. `mod+k`, `escape`) |
| `useAmbientMotion` | Decide si las animaciones continuas corren (respeta `prefers-reduced-motion`, conexión, `saveData`) |

### `useFeedback`
- Centraliza los estados de "operación en curso / éxito / error" (`updatingId`, `feedback`).
- `start(id)` inicia la operación; `end(feedback)` la finaliza; el éxito se auto-limpia a los `FEEDBACK_AUTO_CLEAR_MS` segundos.
- Se usa en las pantallas de supervisión para mostrar progreso y resultados de guardado.

### `useFormDraft`
- Guarda automáticamente los valores del formulario en `localStorage` (clave `sipnam-draft-{key}`).
- Restaura el borrador al volver, si no venció el **TTL** (24 h por defecto).
- Evita la pérdida de datos si el usuario se va sin enviar.

### `useHaptic`
- Envuelve `navigator.vibrate` con **patrones por tipo** (success, error, light) y protege cuando no está soportado.

### `useKeyboardShortcuts`
- Define atajos globales de teclado con un mapa `{ tecla: handler }` (ej. `mod+k` abre búsqueda, `escape` cierra menús).

### `useAmbientMotion`
- Controla las **animaciones ambientales** de fondo: las desactiva si hay `prefers-reduced-motion`, sin conexión, en datos móviles/`saveData`, y las activa en Wi-Fi/Ethernet (o cuando la API no está disponible).

---

## 4. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| `AuthContext` (estado global de autenticación) | Semana 1 | ~4 h |
| `ToastContext` (sistema de toasts) | Semana 4 | ~3 h |
| `useFeedback` (estados de operación) | Semana 3 | ~2 h |
| `useFormDraft` (auto-guardado de formularios) | Semana 5 | ~3 h |
| `useHaptic` y `useSwipe` | Semana 5 | ~2 h |
| `useCountUp` (contadores animados) | Semana 4 | ~1-2 h |
| `useKeyboardShortcuts` | Semana 5 | ~2 h |
| `useAmbientMotion` (animaciones por conexión) | Semana 5 | ~2 h |
| `useTheme` y `useOnlineStatus` | Semanas 1-4 | ~2 h |
| **Total aproximado** | - | **~2 días** |

---

## 5. Pendientes y observaciones

- Evaluar migrar a una librería de estado global (Zustand/Redux) si el estado crece.
- Considerar persistir el `updatingId`/feedback si se requiere más trazabilidad.
