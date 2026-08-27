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
- Evaluar el envío de notificaciones **push** de Firebase Cloud Messaging para cuando la app esté cerrada.
- Revisar el manejo de permisos en iOS (PWA).
