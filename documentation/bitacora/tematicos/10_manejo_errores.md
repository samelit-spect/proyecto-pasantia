# 10 - Manejo de Errores

> Este documento de la bitácora recopila cómo el sistema **captura y muestra los errores** de forma amigable para el usuario, tanto en la interfaz como en la capa de datos.

---

## 1. Estrategia general

- **Nunca mostrar errores técnicos crudos** al usuario final.
- Mapear los errores de Firebase/Firestore a **mensajes claros y accionables** en español.
- **Capturar errores de renderizado** para que un fallo en un componente no deje la app en blanco.
- Mostrar **feedback visual** (éxito/error) en los formularios con posibilidad de descartarlo.

---

## 2. Componentes del sistema de errores

| Componente | Función |
|---|---|
| `ErrorBoundary` | Captura errores de renderizado de la app |
| `friendlyFirestoreError()` | Convierte errores de Firestore en mensajes amigables |
| `getAuthErrorMessage()` | Convierte errores de autenticación en mensajes amigables |
| Feedback en formularios | Mensajes de éxito/error con cierre manual |

---

## 3. ErrorBoundary (captura de errores de renderizado)

- Componente de clase de React que envuelve la app y **detecta cualquier error lanzado durante el renderizado** de sus hijos.
- Cuando ocurre un error, muestra una pantalla de fallo con:
  - El mensaje *"Algo salió mal / Ocurrió un error inesperado. Podés intentar recargar la página."*
  - El **detalle técnico** del error (para diagnóstico).
  - Botones: **"Recargar página"** y **"Volver al inicio"**.
- Evita que la app quede en pantalla en blanco ante un error no controlado.

---

## 4. Friendly Firestore Error (`friendlyFirestoreError`)

Mapea los códigos de error de Firestore a mensajes accionables para el personal escolar:

| Código | Mensaje mostrado |
|---|---|
| `resource-exhausted` | El servicio alcanzó su límite por hoy. Reintentá más tarde o avisá al supervisor. |
| `unavailable` | El servicio no responde en este momento. Reintentá en unos minutos. |
| `network-request-failed` | Problema de conexión. Verificá tu internet e intentá de nuevo. |
| `permission-denied` | No tenés permiso para realizar esta acción. Avísale al supervisor. |
| `failed-precondition` | La operación necesita una configuración pendiente del sistema. Avísale al supervisor. |
| `cancelled` | La operación fue cancelada. Intentá de nuevo. |

Cualquier otro error cae en el mensaje genérico *"Ocurrió un error inesperado. Intentá de nuevo."*

> **Nota:** `resource-exhausted` (cuota agotada) se distingue de `network-request-failed`: la falta de cuota no queda en cola offline, mientras que la falta de red sí se sincroniza luego.

---

## 5. Friendly Auth Error (`getAuthErrorMessage`)

Mapea los códigos de Firebase Auth (login) a mensajes claros: usuario no existe, contraseña incorrecta, cuenta desactivada, demasiados intentos, sin conexión, etc. (detallado en el documento de Autenticación). Evita exponer detalles técnicos en el login.

---

## 6. Feedback en los formularios

- Cada formulario (asistencias, novedades, incidentes) muestra un mensaje de **feedback** al guardar:
  - **Éxito:** confirmación (y nota de sincronización si estuvo offline).
  - **Error:** usa `friendlyFirestoreError()` para mostrar un mensaje comprensible.
- Los mensajes tienen un **botón de cierre** mid (×) y además se auto-ocultan después de un tiempo.

---

## 7. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| `ErrorBoundary` global | Semana 3 | ~2-3 h |
| Mapeo de errores de autenticación (`getAuthErrorMessage`) | Semana 3 | ~1-2 h |
| Hook `useFeedback` (consolidar estados de operación) | Semana 3 | ~2 h |
| `friendlyFirestoreError` para errores de Firestore | Semana 5 | ~2 h |
| Feedback de éxito/error en formularios | Semanas 3-5 | ~3 h |
| **Total aproximado** | - | **~1-1.5 días** |

---

## 8. Pendientes y observaciones

- Loggear errores a un servicio de monitoreo (Sentry) a futuro.
- Clasificar más códigos de error de Firestore si aparecen nuevos escenarios.
