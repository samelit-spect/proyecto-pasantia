# Semana 4 — PWA, Notificaciones y Pulido de la Interfaz

> **Período:** miércoles 19, viernes 21 y sábado 22 de agosto de 2026

**Horas acumuladas:** a completar por el pasante.

---

## Objetivo de la semana

Convertir la app en una **PWA instalable** con navegación móvil, agregar notificaciones en tiempo real, búsqueda global, exportación PDF, gráficos y **pulir toda la interfaz** con animaciones y accesibilidad.

---

## Actividades realizadas

### Miércoles 19 de agosto

- **Soporte PWA + barra de navegación inferior para móviles** (commit `51cbf28`).
  - La app es instalable desde el navegador.
  - Botón de menú (hamburguesa) visible en todas las resoluciones (fix de navbar para tablet 768–1024px).
  - Botón de volver con mayor área táctil, separado en modo icono/texto.
- **Notificaciones en la app con actualización en tiempo real** (commit `292ad43`): campana de notificaciones.
- **Búsqueda global con atajo Ctrl+K** (commit `88922ad`).
- **Exportación de Historial a PDF** con jsPDF + autoTable.
- **Gráficos de dashboard con Recharts** en el home del Supervisor.
- **Sistema de toasts animados** (commit `f41460c`).
- **Pantalla de carga (splash) animada** con logo, barra de progreso y gradiente.

### Viernes 21 de agosto

- **Retención y trazabilidad de incidentes:**
  - Registro del **historial de cambios de estado de incidentes** en Firestore.
  - Visualización del historial de estado a supervisor y escuelas.
  - **Queries de alcance jurisdiccional** y exportación CSV de respaldo a nivel de jurisdicción.
  - Tarjeta de respaldo de datos con exportación CSV.
  - **Banner de advertencia de purga de datos a fin de año** para el supervisor.
- **Indicadores en tiempo real** en todas las vistas del supervisor (commit `e04683c`).
- **Animaciones con `motion` y `auto-animate`:**
  - Listas de actividad en vivo (auto-animate).
  - Inserción/eliminación en el grid de escuelas.
  - Secciones de acordeón expansibles/contraíbles.
  - Entrada/salida de toasts.
  - Eventos del historial de estado de incidentes.
  - **View transitions** en la navegación entre páginas.
  - **Morph** de la tarjeta de escuela hacia la página de detalle.
  - Confirm dialog con entrada/salida animada, banner de retención, lightbox con zoom.
- **Normalización de formato** (endOfLine auto) y corrección de bloqueos de build TS.

### Sábado 22 de agosto

- **Paleta de colores derivada, acentos con gradiente y aurora animada** (commit `29af763`).
- **Crossfade de skeleton a contenido** en pantallas principales.
- **Indicador deslizante activo en la barra de navegación inferior.**
- **Acciones de tarjetas de escuela movidas a la fila inferior.**
- **Actualización de documentación** (CONTEXT) con animaciones, tiempo real y sesión de color.

---

## Dificultades encontradas

- Colisión de nombres de tipo `School` con `lucide-react` (se renombró el alias del import).
- Mantener las animaciones fluidas sin afectar el rendimiento en listas grandes (se usó `auto-animate` con cuidado).
- Configurar PWA y vista previa de la build de producción para validar la instalación móvil.

---

## Resultados y evidencias

- Aplicación instalable (PWA) con barra de navegación inferior en móvil.
- Notificaciones en tiempo real y búsqueda global (Ctrl+K).
- Exportación de Historial a PDF y backup CSV jurisdiccional.
- Gráficos Recharts e interfaz animada (toasts, splash, view transitions, aurora).
- Trazabilidad del historial de cambios de estado de incidentes.

---

## Aprendizajes

- Implementación de PWA (manifest, service worker) con Vite PWA plugin.
- Uso de `motion` y `auto-animate` para animaciones declarativas.
- Uso de **View Transitions API** para transiciones de navegación.
- Exportación PDF con jsPDF + autoTable y CSV a nivel jurisdicción.

---

## Pendientes / Próxima semana

- Diseño responsive de la pantalla de **login** (split-screen escritorio, full-screen móvil).
- Ajustes finales de estilo y correcciones de build.
- Cierre de sesión por inactividad para el rol director.
- Changelog, mapa de calor y animaciones finales.
