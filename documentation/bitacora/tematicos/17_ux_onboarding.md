# 17 - UX y Onboarding

> Este documento de la bitácora recopila las **estrategias de UX (experiencia de usuario)** y de **onboarding** para que el personal escolar aprenda a usar la app rápidamente y sin frustración.

---

## 1. Principios de UX

- **Los roles definen la experiencia:** cada usuario solo ve y hace lo que le corresponde (según su rol), reduciendo la complejidad percibida.
- **Atajos y flujos rápidos** para las tareas diarias (asistencia, foto de planilla, partes).
- **Estados vacíos atractivos:** cuando no hay datos, se muestra una vista guía en lugar de una pantalla "en blanco".
- **Guiones útiles en contexto** y un **centro de ayuda** completo con preguntas frecuentes.

---

## 2. Onboarding: `WelcomeTour`

- **Tour de bienvenida** que aparece la **primera vez** que cada usuario inicia sesión.
- **Personalizado según el rol**:
  - **Director/Vice:** explica Asistencia, Novedades/Incidentes y Seguimiento.
  - **Preceptor:** explica Asistencia y la Foto diaria de la planilla.
  - **Supervisor:** explica el Panel de Supervisión, la Verificación/Seguimiento y la Administración (usuarios, escuelas, exportación).
- Experiencia paso a paso con **contador** ("Paso X de Y"), puntitos de progreso y navegador "Saltar"/"Siguiente"/"Empezar".
- **Accesible:** `role="dialog"`, `aria-modal`, se cierra con `Escape`, bloquea el scroll de fondo.
- **Persistencia:** se marca como visto en `localStorage` (clave con el `uid` del usuario) para no repetirse en cada visita.

---

## 3. Pistas contextuales: `ContextHint`

- **Notas de ayuda desplegables** junto a secciones clave de la app.
- Se pueden **descartar** con un botón (×), y el descarte se **guarda** (`sipnam-hint-dismissed-{id}`) para no volver a mostrarse.
- `role="note"` para lectores de pantalla.
- Ayudan a orientar sin interrumpir el flujo principal.

---

## 4. Estados vacíos: `EmptyState`

- Cuando una sección no tiene registros, se muestra un **estado vacío** con:
  - Icono representativo (asistencia, novedades, alerta, usuarios, etc.).
  - Título y descripción breve.
  - **Acción sugerida** (botón "Cargar..." que redirige a la pantalla correspondiente o ejecuta una acción).
- Convierte el momento "no hay nada" en una **invitación a comenzar**.

---

## 5. Centro de ayuda: `Ayuda`

- Página de ayuda con **FAQ filtrado por rol** (las preguntas que no aplican al rol del usuario se ocultan).
- Docenas de respuestas concisas: escuela automática, límites de carga por rol, permisos de eliminación de fotos, etc.
- **Secciones** adicionales: **modo offline** (`WifiOff`), **cómo instalar la app** (`Smartphone`) y **glosario** (`BookOpen`).
- Accesible desde el **tour de bienvenida** ("Saltar" lo lleva directamente a Ayuda) y desde la navegación.

---

## 6. Otras mejoras de UX

- **Feedback inmediato y claro** en cada acción (éxito/error, toasts) — ver Manejo de Errores.
- **Auto-guardado de borradores** (`useFormDraft`) para no perder datos en formularios incompletos — ver Estado y Hooks.
- **Vibración háptica** (`useHaptic`) en acciones para feedback táctil.
- **Animaciones suaves** (ver documento de UI) con respeto a `prefers-reduced-motion`.

---

## 7. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| `WelcomeTour` (pasos + persistencia por rol) | Semana 5 | ~6 h |
| `ContextHint` (pistas contextuales) | Semana 5 | ~2 h |
| `EmptyState` (estados vacíos guiados) | Semanas 3-5 | ~2 h |
| Página `Ayuda` (FAQ por rol + secciones) | Semanas 4-5 | ~4 h |
| Micro-interacciones (haptic, toasts, borradores) | Semanas 4-5 | ~3 h |
| **Total aproximado** | - | **~1.5-2 días** |

---

## 8. Pendientes y observaciones

- Ampliar el tour con capturas o pasos interactivos si se detectan fricciones reales.
- Analizar con usuarios reales (pruebas de usabilidad) qué flujos generan más dudas.
