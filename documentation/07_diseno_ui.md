# 07 - Diseño de Interfaz de Usuario

## 1. Sistema de diseño

### 1.1 Paleta de colores

Definida en `styles/global.css` mediante custom properties:

| Variable | Valor | Uso |
|---|---|---|
| `--primary-color` | `#1e40af` (azul institucional) | Navbar, botones principales, acentos |
| `--primary-light` | `#3b82f6` (azul claro) | Hover states, links, iconos activos |
| `--secondary-color` | `#16a34a` (verde) | Estados positivos, badge "resuelto", "presente" |
| `--secondary-light` | `#22c55e` (verde claro) | Hover de elementos secundarios |
| `--background-color` | `#f8fafc` (gris muy claro) | Fondo de página |
| `--surface-color` | `#ffffff` (blanco) | Fondo de cards, formularios, tablas |
| `--text-color` | `#1e293b` (gris oscuro) | Texto principal |
| `--text-secondary` | `#64748b` (gris medio) | Labels, captions, texto secundario |
| `--border-color` | `#e2e8f0` (gris claro) | Bordes de inputs, cards, tablas |

**Colores de estado:**

| Estado | Color | Variable sugerida | Uso |
|---|---|---|---|
| Éxito / Resuelto | `#16a34a` (verde) | `--secondary-color` | Badge "resuelto", mensaje de éxito |
| Pendiente | `#ca8a04` (amarillo) | — | Badge "pendiente" |
| Error / Ausente | `#dc2626` (rojo) | — | Mensajes de error, validaciones, "ausente" |
| En análisis | `#2563eb` (azul) | — | Badge "en_analisis" |
| En gestión | `#ea580c` (naranja) | — | Badge "en_gestion" |

### 1.2 Tipografía

| Elemento | Font family | Font weight | Tamaño sugerido |
|---|---|---|---|
| Body | Inter, system-ui, sans-serif | 400 (regular) | 16px |
| H1 | Inter, system-ui, sans-serif | 700 (bold) | 28px |
| H2 | Inter, system-ui, sans-serif | 600 (semibold) | 22px |
| H3 | Inter, system-ui, sans-serif | 600 (semibold) | 18px |
| Labels | Inter, system-ui, sans-serif | 500 (medium) | 14px |
| Inputs | Inter, system-ui, sans-serif | 400 (regular) | 14px |
| Small / captions | Inter, system-ui, sans-serif | 400 (regular) | 12px |

### 1.3 Espaciado y border-radius

| Propiedad | Valor |
|---|---|
| Espaciado base | 8px (múltiplos: 8, 16, 24, 32, 48) |
| Border-radius (inputs, cards) | 8px |
| Border-radius (botones) | 6px |
| Padding general de página | 16px (mobile) / 24px (desktop) |

## 2. Responsive approach

- **Mobile-first:** estilos base para móvil, media queries para pantallas más grandes.
- **Breakpoints:**

| Nombre | Ancho | Uso |
|---|---|---|
| `sm` | ≥ 640px | Tablets pequeñas, landscape phone |
| `md` | ≥ 768px | Tablets |
| `lg` | ≥ 1024px | Laptops, desktops pequeños |
| `xl` | ≥ 1280px | Monitores grandes |

## 3. Estructura general de la aplicación

### 3.1 Header (Navbar)

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 SIPNAM        [Asistencia] [Novedades] [Incidentes]        │
│  Logo              Links según rol                             │
│                                                                │
│                                        [👤 Juan Pérez] [Salir] │
│                                        Usuario + Cerrar sesión │
└─────────────────────────────────────────────────────────────────┘
```

| Propiedad | Valor |
|---|---|
| Posición | `position: fixed`, parte superior |
| Altura | ~60px |
| Z-index | Alto (por encima de todo el contenido) |
| Contenido izquierda | Logo / nombre del sistema ("SIPNAM") |
| Contenido centro | Links de navegación (filtrados por rol) |
| Contenido derecha | Nombre del usuario + botón cerrar sesión |
| Fondo | `--primary-color` |
| Texto | Blanco |

### 3.2 Body (Contenido principal)

```
┌─────────────────────────────────────────┐
│  (debajo del navbar, con padding-top)   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │         PÁGINA / VISTA            │  │
│  │                                   │  │
│  │  Home, Asistencia, Novedades,     │  │
│  │  Incidentes, Supervisor, 404      │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

| Propiedad | Valor |
|---|---|
| Padding-top | ~80px (compensa el navbar fijo) |
| Ancho | 100% en móvil, `max-width: 1200px` en desktop |
| Centrado | `margin: 0 auto` |
| Padding horizontal | 16px (mobile) / 24px (desktop) |
| Fondo | `--background-color` |

### 3.3 Footer

```
┌─────────────────────────────────────────────────────────────────┐
│  © 2026 SIPNAM — Supervisión Escolar Jurisdiccional            │
└─────────────────────────────────────────────────────────────────┘
```

| Propiedad | Valor |
|---|---|
| Posición | Abajo del contenido (no fijo) |
| Contenido | Copyright, nombre del sistema |
| Fondo | `--surface-color` |
| Borde | Superior (`--border-color`) |
| Texto | `--text-secondary`, centrado |

## 4. Estructura por tipo de página

### 4.1 Home (`/`) — Cards de acceso rápido

```
┌─────────────────────────────────────────┐
│  Bienvenido, Juan                       │
│  Director — Escuela N° 123              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ 📋       │  │ 📰       │            │
│  │Asistencia│  │ Novedades│            │
│  │ [ Ir → ] │  │ [ Ir → ] │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐                          │
│  │ ⚠        │                          │
│  │Incidentes│                          │
│  │ [ Ir → ] │                          │
│  └──────────┘                          │
│                                         │
└─────────────────────────────────────────┘
```

- Cards con acceso rápido a cada módulo.
- Según el rol, se muestran las cards correspondientes.
- Saludo personalizado con nombre y rol del usuario.

### 4.2 Formularios (Asistencia, Novedades, Incidentes)

```
┌─────────────────────────────────────────┐
│  Título de la página                    │
├─────────────────────────────────────────┤
│                                         │
│  Escuela: [Dropdown ▼]                  │
│  Fecha:   [Date picker]                 │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Contenido específico del         │  │
│  │  formulario (tabla, textarea)     │  │
│  └───────────────────────────────────┘  │
│                                         │
│            [ Guardar ]                  │
│                                         │
└─────────────────────────────────────────┘
```

- **Encabezado:** Título descriptivo de la acción.
- **Campos comunes:** Escuela (dropdown) y Fecha (date picker) siempre arriba.
- **Contenido específico:** Tabla de asistencia, textarea de novedad, o textarea de incidente.
- **Botón:** "Guardar" al final, centrado.

### 4.3 Supervisor (`/supervisor`) — Vista con tabs

```
┌─────────────────────────────────────────┐
│  Panel de Supervisión                   │
├─────────────────────────────────────────┤
│                                         │
│  [Asistencias] [Novedades] [Incidentes] │
│  ─────────────────────────────────────  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📚 Escuela N° 123                 │  │
│  │   ├─ 23/07 — 5 presentes         │  │
│  │   └─ 22/07 — 4 presentes         │  │
│  ├───────────────────────────────────┤  │
│  │ 📚 Escuela N° 456                 │  │
│  │   └─ 23/07 — 3 presentes         │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

- **Tabs:** Para alternar entre asistencias, novedades e incidentes.
- **Acordeón o cards:** Para expandir cada escuela.
- **Badges:** De estado en incidentes.

## 5. Comportamiento responsive

### 5.1 Breakpoints por componente

| Dispositivo | Navbar | Contenido | Formularios |
|---|---|---|---|
| **Mobile** (<768px) | Logo + hamburger menu | 1 columna, padding 16px | Campos apilados verticalmente |
| **Tablet** (768-1024px) | Logo + links visibles | 1-2 columnas, padding 24px | Campos en grid 2 columnas |
| **Desktop** (>1024px) | Todo visible | 2 columnas, max-width 1200px | Campos en grid 2-3 columnas |

### 5.2 Navbar responsive

| Dispositivo | Comportamiento |
|---|---|
| Mobile | Logo a la izquierda, hamburger menu a la derecha. Al abrir, links verticales. |
| Tablet | Logo a la izquierda, links centrados, usuario a la derecha. |
| Desktop | Todo en una línea: logo izquierda, links centro, usuario derecha. |

### 5.3 Formularios responsive

| Dispositivo | Distribución |
|---|---|
| Mobile | Campos apilados (1 columna), botón full-width. |
| Tablet | Campos en 2 columnas, botón auto. |
| Desktop | Campos en 2-3 columnas, botón alineado a la derecha. |

### 4.1 Formularios

```
┌─────────────────────────────────────┐
│  Escuela:  [Dropdown ▼]             │
│                                      │
│  Fecha:   [Date picker 📅]          │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ Integrante 1    [✓] Ausente ▼  │ │
│  │   Motivo: [_______________]     │ │
│  ├─────────────────────────────────┤ │
│  │ Integrante 2    [✓] Presente ▼  │ │
│  ├─────────────────────────────────┤ │
│  │ Integrante 3    [✓] Ausente ▼  │ │
│  │   Motivo: [_______________]     │ │
│  └─────────────────────────────────┘ │
│                                      │
│            [ Guardar ]               │
└─────────────────────────────────────┘
```

**Elementos:**
- **Select (dropdown):** para escuela y estado de asistencia.
- **Date picker:** selector de fecha nativo o custom.
- **Checkbox / Toggle:** presente/ausente.
- **Textarea:** campo de motivo/descripción (se desbloquea condicionalmente).
- **Botón primario:** "Guardar" con `--primary-color`.

### 4.2 Tablas / Listas de registros

```
┌──────────────────────────────────────────────┐
│  📅 23/07/2026 — Escuela N° 123              │
├──────────────────────────────────────────────┤
│  Integrante      Estado       Motivo          │
│  ─────────────────────────────────────────── │
│  Juan Pérez      ✅ Presente  —              │
│  María López     ✅ Presente  —              │
│  Carlos García   ❌ Ausente   Enfermedad      │
│  Ana Martínez    ✅ Presente  —              │
│  Pedro Ruiz      ✅ Presente  —              │
└──────────────────────────────────────────────┘
```

### 4.3 Cards

```
┌────────────────────────┐
│  📋 Asistencias         │
│  Cargar asistencia      │
│  diaria del personal    │
│            [ Ir → ]     │
└────────────────────────┘
```

- **Background:** `--surface-color` (blanco)
- **Border-radius:** 8px
- **Sombra:** sutil (`box-shadow: 0 1px 3px rgba(0,0,0,0.1)`)
- **Hover:** elevación ligera + borde `--primary-light`

### 4.4 Badges de estado

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ pendiente │  │ en_análisis│ │ en_gestión│ │ resuelto │
│  (gris)   │  │  (azul)   │  │(naranja) │  │ (verde)  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### 4.5 Mensajes de feedback

| Tipo | Color | Icono sugerido |
|---|---|---|
| Éxito | Verde | ✓ |
| Error | Rojo | ✗ |
| Advertencia | Amarillo | ⚠ |
| Info | Azul | ℹ |

## 6. Navegación (Navbar)

### 5.1 Estructura

```
┌─────────────────────────────────────────────────────┐
│  🏠 SIPNAM          [Asistencia] [Novedades] [Incidentes]  [👤 Nombre] [Cerrar sesión] │
└─────────────────────────────────────────────────────┘
```

### 5.2 Links según rol

| Rol | Links visibles |
|---|---|
| Director | Inicio, Asistencia, Novedades, Incidentes |
| Vice-director | Inicio, Asistencia, Novedades, Incidentes |
| Preceptor | Inicio, Asistencia |
| Supervisor | Inicio, Panel Supervisor |
| Secretario / Conserje | Inicio (solo lectura) |

### 5.3 Estado activo

- El link de la página actual se resalta con `--primary-color` y un borde inferior.
