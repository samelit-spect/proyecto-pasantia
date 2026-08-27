# 16 - Accesibilidad

> Este documento de la bitácora recopila las **prácticas de accesibilidad** implementadas en la app, orientadas a **WCAG 2.1 nivel AA**.

---

## 1. Estándar y objetivo

- Se busca cumplir **WCAG 2.1 nivel AA**, enfocado en los puntos más relevantes para una app web administrativa que también se usa en celular.
- La accesibilidad mejora la usabilidad para **todos**: personas con discapacidad visual, motriz o cognitiva, y también en contextos con pantallas chicas o luz solar.

---

## 2. ARIA en el código

Uso efectivo de atributos ARIA en los componentes reales:

| Atributo | Cantidad | Uso |
|---|---|---|
| `aria-label` | 22 | Botones de icono sin texto visible (descartar, cerrar, acciones) |
| `aria-hidden` | 6 | Iconos decorativos |
| `aria-modal` | 4 | Diálogos/modales (ConfirmDialog, GlobalSearch, Lightbox, WelcomeTour) |
| `aria-live` | 3 | Regiones dinámicas (toasts con `aria-live="polite"`) |
| `aria-current` | 1 | Elemento activo de navegación |

- **`role="status"` + `aria-live="polite"`** en el contenedor de toasts (`ToastContext`): los lectores de pantalla anuncian los avisos sin interrumpir.
- **`role="dialog"` + `aria-modal="true"`** en los modales, con `aria-labelledby` apuntando al título.
- **`role="alert"`** para mensajes de error críticos en los formularios.

---

## 3. Semántica HTML y landmarks

- Uso de elementos semánticos: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<form>`, `<table>`, y jerarquía de títulos `<h1>`–`<h6>` con un solo `<h1>` por página.
- Formularios con `<label>` asociado a cada campo (`id`/`for`).
- Errores ligados al campo con `aria-describedby` y `aria-invalid`.

---

## 4. Navegación por teclado

- **Focus visible:** estilo de foco (`:focus-visible`) con `outline` de color primario.
- **Atajos de teclado** (`useKeyboardShortcuts`): soporta `mod`, `shift`, `alt` combinados; incluye acciones como cerrar con `Escape`.
- Componentes interactivos con `onKeyDown` y `tabIndex` donde hace falta (GlobalSearch, AttendanceForm).
- Las utilidades (`useSwipe`) **no sustituyen** a la interacción por teclado (todo lo crucial es accesible por teclado además del gesto táctil).

---

## 5. Movimiento reducido (`prefers-reduced-motion`)

- **`useReducedMotion`** (de `motion/react`) se usa en: `ConfirmDialog`, `RetentionBanner`, `Lightbox` y `useAmbientMotion`; respeta la preferencia del usuario de reducir movimiento.
- **`useAmbientMotion`** **desactiva las animaciones ambientales continuas** cuando hay `prefers-reduced-motion`, además de cuando no hay conexión o se usa datos móviles/`saveData` (accesibilidad + ahorro de batería).

---

## 6. Contraste y color

Paleta verificada contra WCAG AA sobre fondo claro:

| Elemento | Contraste | Estado |
|---|---|---|
| Texto principal (`#1e293b` / `#f8fafc`) | 14.5:1 | ✅ |
| Texto secundario (`#64748b`) | 5.0:1 | ✅ |
| Botón primario (texto blanco / `#1e40af`) | 8.6:1 | ✅ |
| Botón peligro (blanco / `#dc2626`) | 4.6:1 | ✅ |
| Enlace (`#2563eb`) | 7.1:1 | ✅ |

- El modo **dark** también se define con variables de color con contraste verificado.
- Los estados de los registros (pendiente, resuelto, etc.) usan **texto + icono**, no solo color, para no depender únicamente del color.

---

## 7. Imágenes e iconos

- Imágenes informativas con `alt` descriptivo.
- Iconos decorativos con `aria-hidden="true"`.

---

## 8. Testing de accesibilidad

- **`@axe-core/react`** está instalado (paquete en `package.json`).
- Auditoría manual: navegación solo con teclado, uso de lector de pantalla y verificación de contraste (WCAG AA).

---

## 9. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| ARIA (labels, roles, modales, live regions) | Semanas 3-5 | ~4 h |
| Semántica HTML y labels de formularios | Semanas 1-3 | ~3 h |
| `prefers-reduced-motion` / `useReducedMotion` | Semana 5 | ~2 h |
| Contraste y paleta verificada | Semanas 1-4 | ~2 h |
| Integración de `@axe-core/react` | Semanas 4-5 | ~1 h |
| **Total aproximado** | - | **~1-1.5 días** |

---

## 10. Pendientes y observaciones

- Completar la inicialización de `@axe-core/react` en modo desarrollo (si aún no está activa).
- Añadir tests de accesibilidad con `jest-axe` o auditoría automatizada en CI.
- Revisar `aria-invalid`/`aria-describedby` en todos los formularios editables.
