# 04 - Interfaz Visual, Formularios y Navegación

> Este documento de la bitácora recopila todo lo relacionado con la **parte visual** del sistema: el sistema de temas, los componentes de interfaz, la navegación (barra superior, drawer, barra inferior), los formularios, los botones, los estados de carga/vacío y las **animaciones**.

---

## 1. Enfoque visual y por qué

La interfaz se construyó con **React + CSS propio** (sin frameworks de UI como Tailwind o Material UI), usando **variables CSS** como base del diseño.

### Por qué CSS propio con variables

- **Ligereza y control total:** no se carga una librería de estilos ni clases predefinidas; cada componente tiene su propio CSS junto a su `.tsx`.
- **Tema unificado:** las **variables CSS** (`--primary-color`, `--surface-color`, `--text-color`, etc.) permiten cambiar el color de toda la app desde un solo lugar.
- **Consistencia:** el diseño usa una misma paleta, radios de borde, sombras y espaciados definidos como tokens reutilizables.

### Por qué iconografía con lucide-react

- Biblioteca de iconos liviana y consistente con todo el sistema (cada botón, enlace y estado usa el mismo estilo de trazo).

### Por qué `motion` y `auto-animate`

- `motion` para animaciones declarativas (entradas, transiciones de página, lightbox).
- `@formkit/auto-animate` para animar **listas y colecciones** de forma automática (inserción/eliminación de elementos).

---

## 2. Sistema de temas (claro / oscuro + color primario)

La app permite personalizar la apariencia en `/tema`.

### Cómo funciona

- Las variables CSS base se definen en `global.css` en `:root`:
  - Colores: `--primary-color`, `--primary-light`, `--secondary-color`, `--background-color`, `--surface-color`, `--text-color`, `--text-secondary`, `--border-color`.
  - Sombras: `--shadow-xs` … `--shadow-xl`.
  - Radios: `--radius-xs` … `--radius-full`.
  - Espaciados: `--space-1` … `--space-8`.
  - **Acentos por estado:** `--accent-green-*`, `--accent-blue-*`, `--accent-red-*`, `--accent-yellow-*` (éxito, info, error, advertencia).
  - **Tonos derivados:** `--primary-tint`, `--primary-tint-strong` y `--gradient-accent` se calculan automáticamente a partir del color principal con `color-mix()`.
- `src/utils/theme.ts` manage el tema:
  - `ThemeState` guarda `primary`, `primaryLight` y `mode` (`light`/`dark`).
  - `applyTheme()` fija las variables CSS en `document.documentElement`.
  - Se **persiste en `localStorage`** (clave `sipnam-theme`) para que sobreviva a recargas.
  - El modo oscuro aplica un mapa de variables oscuras (fondos, superficies, textos y acentos).
- `useTheme()` es el hook que exponen los componentes: `isDark`, `toggleMode()`, `setTheme()`.

### El color primario se puede cambiar

- En `/tema` el usuario puede elegir otro color principal y la app recalcula **automáticamente** la paleta derivada (tints y gradientes). Esto permite dar identidad visual a cada escuela/organismo.

---

## 3. Navegación

### 3.1 Barra superior (`Navbar`)

- **Marca SIPNAM** a la izquierda.
- A la derecha: **campana de notificaciones**, botón de **menú (hamburguesa)**.
- **Barra de escritorio** (`navbar__desktop`): enlaces con iconos que se muestran **según el rol** (via `hasRole`):
  - Inicio, Asistencia, Docentes, Historial, Fotos, Novedades, Incidentes, Supervisión, Usuarios, Ayuda.
  - Búsqueda global (Ctrl+K), Mi Perfil y botón Salir.
- **Drawer (menú lateral)**: se abre con la hamburguesa, muestra los datos del usuario (avatar, nombre, rol), los enlaces según rol, el **toggle de tema oscuro** y el botón de cerrar sesión. Se cierra al hacer clic fuera o con Escape, y bloquea el scroll de fondo mientras está abierto.
- Los enlaces identifican el **estado activo** (`isActive`) y usan `viewTransition` para la transición de página.

### 3.2 Barra de navegación inferior móvil (`BottomNav`)

- Pensada para **teléfonos**: barra fija abajo con acceso rápido a las secciones principales.
- Incluye un **indicador deslizante** que marca la pestaña activa y **badges** (por ejemplo, incidentes abiertos o asistencia pendiente).
- Fue parte de la conversión de la app a PWA (instalable en móvil).

---

## 4. Formularios

Todos los formularios del sistema siguen un patrón consistente con **react-hook-form + Zod**:

### Cómo se construyen

1. Se define un **schema Zod** (`src/utils/validation.ts`) que valida tipos, obligatoriedad, rangos y mensajes de error.
2. `useForm` con `zodResolver(schema)` conecta el formulario con la validación.
3. Los campos usan `register` (inputs/selects) y `Controller` (para componentes como `DatePicker`).
4. `formState.errors` muestra los mensajes de validación junto a cada campo.
5. En el envío se maneja el estado `isSubmitting`, se muestra **feedback de éxito o error** y (si corresponde) una **animación de éxito**.

### Características comunes a todos los formularios

- **Validación en tiempo real** con mensajes de error en español.
- **Contador de caracteres** en campos de texto largo (ej. descripción 0/500).
- **Auto-guardado en borrador** (`useFormDraft`): si el usuario se va sin enviar, el contenido se conserva en localStorage y se recupera al volver.
- **Feedback háptico** (`useHaptic`) al enviar correctamente en dispositivos con vibración.
- **Feedback offline**: si no hay conexión, el registro se guarda localmente y se avisa que se sincronizará al volver.
- **Mensajes de error amigables** de Firestore (`friendlyFirestoreError`).

### Ejemplos de formularios

- **Novedades** (`pages/Novedades`): fecha, tipo, hora y descripción, con hint contextual y animación de éxito (confeti).
- **Incidentes** (`pages/Incidentes`): categoría, urgencia, ubicación, foto y descripción.
- **Asistencia de gestión** (`AttendanceForm`): lista de integrantes con presente/ausente y motivo.
- **Asistencia de docentes**: foto diaria + lista de docentes.
- **Usuarios/Escuelas (Supervisor)**: alta y edición con formularios react-hook-form + Zod.

---

## 5. Componentes de interfaz reutilizables

En `src/components/common/` hay componentes que se usan en todas las pantallas:

| Componente | Función |
|---|---|
| `Button` | Botón con variantes (primario, secundario, peligro, ghost), estados de **carga (spinner)** y **éxito (check)** |
| `Navbar` / `BottomNav` | Navegación (escritorio + móvil) |
| `GlobalSearch` | Búsqueda global con atajo Ctrl+K |
| `NotificationBell` | Campana de notificaciones con actualización en tiempo real |
| `DatePicker` | Selector de fecha |
| `StatusBadge` | Insignia de estado (pendiente, resuelto, etc.) |
| `EmptyState` | Estado vacío con ilustración, mensaje y botón de acción |
| `Skeleton` | Placeholders de carga animados |
| `LoadingScreen` | Pantalla de carga (splash) |
| `ConfirmDialog` | Diálogo de confirmación animado |
| `ErrorBoundary` | Captura errores de renderizado y los muestra de forma amigable |
| `Breadcrumb` | Migas de pan (navegación de contexto) |
| `Pagination` | Paginación de listas |
| `FilterBar` | Barra de filtros animada |
| `Timeline` | Línea de tiempo (ej. historial de incidentes) |
| `SwipeableRow` | Filas con gesto de deslizar |
| `IncidentHistory` | Historial de cambios de estado de incidentes |
| `WelcomeTour` | Recorrido guiado según rol al primer ingreso |
| `ChangelogModal` | Novedades de la versión al primer acceso tras actualizar |
| `SuccessAnimation` | Animación de éxito (confeti) |

---

## 6. Estados de carga y vacío

- **Skeleton loadings:** al cargar datos, las pantallas muestran placeholders animados (Home, Historial, Fotos, Supervisor, etc.) para que la interfaz no "salte" cuando llegan los datos. Se hace un **crossfade** del skeleton al contenido real.
- **Empty states:** cuando no hay datos, se muestra una ilustración con mensaje y, en muchos casos, un **botón de acción** (ej. "Registrar primera novedad") y una **animación de entrada**.

---

## 7. Animaciones

### Librerías y técnicas usadas

- **`motion`**: animaciones declarativas de componentes (entrada, salida, zoom, lightbox).
- **`@formkit/auto-animate`**: anima listas y colecciones automáticamente (inserciones/eliminaciones en grids de escuelas, listas de actividad).
- **View Transitions API** (`viewTransition` en React Router): transición fluida al **navegar entre páginas** y **morph** de la tarjeta de escuela hacia su detalle.
- **CSS transitions/keyframes**: animaciones de entrada, cruce (crossfade), el indicador deslizante de la barra inferior y la **aurora** de fondo.
- **`useCountUp`**: contadores animados (estadísticas).
- **`useAmbientMotion`**: animaciones ambientales de fondo según el estado de conexión (Wi-Fi).

### Dónde se aplican

| Animación | Componente / pantalla |
|---|---|
| Splash / loading screen | Carga inicial |
| Toasts (entrada/salida) | Sistema de notificaciones |
| View transitions entre rutas | Toda la navegación |
| Morph tarjeta → detalle | Escuelas (Supervisor) |
| Grid de escuelas (insert/delete) | Supervisor |
| Acordeón (expand/collapse) | Detalle de escuela |
| Confeti de éxito | Formulario de Novedades |
| Mapa de calor | Home del Supervisor |
| Crossfade skeleton → contenido | Screens principales |
| Indicador deslizante + badges | Barra inferior móvil |
| Aurora animada | Fondo (ambient) |

---

## 8. Accesibilidad y responsive

- **Focus-visible rings** y `backdrop-blur` en modales (accesibilidad de teclado).
- **ARIA labels** en botones de solo icono (changelog, close, etc.).
- **Responsive**: el layout se adapta a escritorio (login split-screen, barra superior con enlaces), tablet y móvil (login full-screen, drawer + barra inferior).
- **Contraste de tema oscuro** ajustado (fondos, superficies y textos del mapa oscuro).
- **CSS puro** para el WelcomeTour (en lugar de `motion`) para asegurar que se muestre bien.

---

## 9. Verificación

- Lint: `npm run lint`, compilación: `npx tsc -b --noEmit`, tests: `npm run test`.
- Existen tests de componentes de UI (StatusBadge, AttendanceRow, Button implícito en Login, etc.).

---

## 10. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Estructura de CSS con variables y design tokens | Semana 1 | ~1 dia |
| Pantalla de Login (MVP) | Semana 1 | ~3 h |
| Navegación: Navbar + acceso según rol | Semana 1 | ~4 h |
| Componentes reutilizables base (Button, inputs, listas) | Semana 1 | ~4 h |
| Sistema de tema claro/oscuro + configuración en `/tema` | Semana 3 | ~1 día |
| Skeletons de carga | Semana 3-4 | ~3 h |
| Estilos responsive (escritorio/tablet/móvil) | Semanas 3-5 | ~1 día |
| Formularios con react-hook-form + Zod | Semanas 1-2 | ~1-2 días |
| Auto-guardado en borrador (`useFormDraft`) | Semana 5 | ~3 h |
| Barra inferior móvil (`BottomNav`) con badges | Semana 4 | ~3 h |
| Animaciones (motion, auto-animate, view transitions) | Semana 4 | ~1-2 días |
| Animaciones ambientales (aurora, contadores) | Semanas 4-5 | ~4 h |
| Login responsive (split-screen / full-screen) | Semana 5 | ~1 día |
| Accesibilidad (focus rings, ARIA) | Semanas 4-5 | ~4 h |
| **Total aproximado** | - | **~10-12 días** |

---

## 11. Pendientes y observaciones

- Revisar contraste de color en todos los modos/temas personalizados.
- Ampliar cobertura de tests de componentes de UI.
- Evaluar agregar theme presets para cada escuela.
