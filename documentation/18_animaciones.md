# Animaciones del proyecto

> Estado vivo de la estrategia de animación de SIPNAM. Documento creado para planificar y
> registrar las mejoras de animación implementadas con librerías externas + APIs nativas.
> Cada mejora se implementa en su propio commit, una por una.

## Stack base

- React 19.2.7 + react-router-dom 7.18.1
- CSS personalizado con variables (sin Tailwind ni CSS modules)
- PWA mobile-first → el peso del bundle es crítico
- Animaciones actuales: keyframes/transitions CSS propios + hook `useCountUp` (stats del Home)
- Accesibilidad: respetar `prefers-reduced-motion` en toda animación nueva

## Librerías elegidas

### 1. @formkit/auto-animate (~3kb gzip) — Fase 1

Animación cero-config para listas/accordions/toasts: inserta, elimina y reordena elementos
del DOM con transiciones suaves. Un solo `ref` en el contenedor padre.

```tsx
import { useAutoAnimate } from '@formkit/auto-animate/react';

const [parent, enableAnimations] = useAutoAnimate();
return <ul ref={parent}>...</ul>;
```

- Respeta `prefers-reduced-motion` automáticamente
- Opcional: `useAutoAnimate(/* duration */ 0.3)` o easing custom
- Usar SOLO donde el contenido cambia dinámicamente (datos en vivo, filtros)

### 2. View Transitions API (0kb — nativa) — Fase 1

Transiciones entre páginas sin librería: React Router 7 ya lo soporta.

```tsx
<Link to="/escuelas" viewTransition>Escuelas</Link>
navigate('/detalle', { viewTransition: true });
```

```css
/* Customización opcional */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 200ms;
}
```

- Progressive enhancement: navegador sin soporte → navegación normal
- Elementos compartidos entre páginas: asignar `view-transition-name` durante la navegación

### 3. Motion (`motion/react`, ex framer-motion) — Fase 2

Para exit animations, layout animations y shared elements que auto-animate no cubre.

**Obligatorio usar LazyMotion para no penalizar el bundle inicial:**

```tsx
import { LazyMotion, domAnimation, m } from 'motion/react';

<LazyMotion features={domAnimation} strict>
  <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
</LazyMotion>
```

- Importar siempre `m` (no `motion`) → ~4.6kb inicial + ~15kb lazy
- `AnimatePresence` para salida animada de modales/banners
- `layoutId` para indicadores que se deslizan (BottomNav)
- Cargar solo cuando la pantalla lo necesite (lazy import)

## Mejoras planificadas

| # | Mejora | Herramienta | Pantalla | Estado |
|---|--------|-------------|----------|--------|
| 1 | Actividad reciente animada (inserción en vivo por onSnapshot) | auto-animate | Home + Panel supervisor + Timeline | ✅ `useAutoAnimate` en `.home__activity`, `.home__alerts`, 3 summary-lists de /supervisor y contenedor de `Timeline` |
| 2 | Lista de escuelas: alta/eliminación animada | auto-animate | /supervisor | ✅ `useAutoAnimate` en `.supervisor-schools__grid` (inserta, elimina y reacomoda cards) |
| 3 | Acordeones de secciones (expandir/colapsar suave) | auto-animate | Detalle escuela | ✅ `useAutoAnimate` en `AccordionSection` (componente compartido por las 7 secciones) |
| 4 | Toasts con entrada/salida animada | auto-animate | Global (ToastContext) | ✅ `useAutoAnimate` en `.toast-container`; removido keyframe CSS `toastSlideIn` (duplicaba la entrada y no tenía salida) |
| 5 | Historial de estados de incidentes animado | auto-animate | SupervisorDetail + Historial | ✅ `useAutoAnimate` en contenedor de `IncidentHistory`; el evento nuevo aparece animado en vivo cuando cambia el estado |
| 6 | Transiciones entre páginas (fade/slide) | View Transitions | Toda la app | ✅ `viewTransition` en BottomNav, Navbar (desktop+drawer), Home cards, panel supervisor, Breadcrumb, RetentionBanner, GlobalSearch, NotificationBell, botones Volver y post-login. CSS global en index.css (`::view-transition-old/new(root)`, fade + slide sutil, con guard de reduced-motion) |
| 7 | Morph card escuela → detalle (shared element) | View Transitions | /supervisor → detalle | ✅ Card extraída a componente `SchoolCard` con `useViewTransitionState`; `view-transition-name: school-hero` en card (origen) y header del detalle (destino); desactivado con reduced-motion |
| 8 | ConfirmDialog/modal con salida animada (AnimatePresence) | Motion | Global | ✅ `motion` instalado; `LazyMotion features={domAnimation} strict` en main.tsx; ConfirmDialog con fade+scale entrada/salida vía `m.*` + `useReducedMotion`; keyframes CSS viejos removidos. Impacto bundle: ~5kb gzip |
| 9 | RetentionBanner slide down/up | Motion | Home supervisor | ✅ Wrapper animado (height auto→0 + opacity + marginBottom) con AnimatePresence; margin movido del CSS al wrapper; `useReducedMotion`; test de cierre adaptado a salida animada (`advanceTimersByTimeAsync`) |
| 10 | Lightbox zoom desde miniatura | Motion | Detalle escuela (fotos) | ⏳ |
| 11 | Indicador activo del BottomNav deslizante (layoutId) | Motion | BottomNav | ⏳ |
| 12 | Crossfade skeleton → contenido | Motion/CSS | Pantallas con skeleton | ⏳ |

## Reglas para implementar

1. Una mejora = un commit (`feat:` descriptivo en inglés)
2. Verificación completa antes de cada commit: `tsc -b --noEmit && npm run lint && vitest run`
3. Animar solo `transform` y `opacity` cuando sea posible (60fps en móviles)
4. No romper tests existentes: las animaciones no deben cambiar roles/textos accesibles
5. Si Motion entra al proyecto, envolver la app en `<LazyMotion strict>` y prohibir `motion.*`
6. Actualizar este documento (estado ✅ + notas técnicas) junto con cada commit
