# 17 - Accesibilidad

## 1. Estándar

Se busca cumplir con **WCAG 2.1 nivel AA** como mínimo, enfocado en los puntos más relevantes para una app web administrativa.

## 2. Semántica HTML

### 2.1 Uso correcto de elementos

| Elemento | Uso |
|---|---|
| `<header>` | Cabecera de la app (navbar) |
| `<nav>` | Navegación principal |
| `<main>` | Contenido principal |
| `<footer>` | Pie de página |
| `<section>` | Secciones temáticas |
| `<form>` | Formularios |
| `<table>` | Tablas de datos |
| `<h1>` a `<h6>` | Jerarquía de títulos (un solo `<h1>` por página) |

### 2.2 Landmarks

```html
<body>
  <header>
    <nav aria-label="Navegación principal">...</nav>
  </header>
  <main>
    <h1>Título de la página</h1>
    <section aria-label="Formulario de asistencia">...</section>
  </main>
  <footer>...</footer>
</body>
```

## 3. Formularios

### 3.1 Labels

Todo input debe tener un `<label>` asociado:

```html
<!-- ✅ Correcto -->
<label for="school">Escuela</label>
<select id="school" name="school">...</select>

<!-- ❌ Incorrecto -->
<span>Escuela</span>
<select name="school">...</select>
```

### 3.2 Mensajes de error

Asociar errores a inputs con `aria-describedby`:

```html
<label for="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Ingresá un email válido
</span>
```

### 3.3 Campos requeridos

```html
<label for="nombre">
  Nombre <span aria-hidden="true">*</span>
</label>
<input
  id="nombre"
  required
  aria-required="true"
/>
```

## 4. Navegación por teclado

### 4.1 Tab order

- Todos los elementos interactivos deben ser alcanzables con `Tab`.
- El orden lógico debe seguir el orden visual.
- No usar `tabindex` positivo.

### 4.2 Focus visible

```css
/* Estilo de focus por defecto */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* No quitar outline sin proveer alternativa */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 4.3 Atajos de teclado

| Acción | Tecla |
|---|---|
| Navegar entre campos | `Tab` |
| Activar botón/enlace | `Enter` |
| Seleccionar opción | `Espacio` |
| Cerrar modal | `Escape` |

## 5. ARIA

### 5.1 Roles

```html
<!-- Alertas -->
<div role="alert">Error al guardar</div>

<!-- Indicador de carga -->
<div role="status">Cargando...</div>

<!-- Tab panel -->
<div role="tabpanel" aria-labelledby="tab-1">...</div>

<!-- Modal -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">...</div>
```

### 5.2 Estados dinámicos

```html
<!-- Botón con estado -->
<button
  [attr.aria-busy]="isLoading"
  [disabled]="isLoading"
>
  {{ isLoading ? 'Guardando...' : 'Guardar' }}
</button>

<!-- Indicador de expandir -->
<button aria-expanded="false" aria-controls="menu-1">
  Menú
</button>
<ul id="menu-1" hidden>...</ul>
```

## 6. Colores y contraste

### 6.1 Ratios mínimos (WCAG 2.1 AA)

| Tipo de texto | Ratio mínimo |
|---|---|
| Texto normal (< 18px) | 4.5:1 |
| Texto grande (≥ 18px bold o ≥ 24px) | 3:1 |
| Componentes interactivos | 3:1 |

### 6.2 Paleta verificada

| Elemento | Color | Contraste sobre fondo |
|---|---|---|
| Texto principal | `#1e293b` sobre `#f8fafc` | 14.5:1 ✅ |
| Texto secundario | `#64748b` sobre `#f8fafc` | 5.0:1 ✅ |
| Botón primario (texto blanco) | `#ffffff` sobre `#1e40af` | 8.6:1 ✅ |
| Botón peligro (texto blanco) | `#ffffff` sobre `#dc2626` | 4.6:1 ✅ |
| Enlace | `#2563eb` sobre `#f8fafc` | 7.1:1 ✅ |

## 7. Imágenes

- Toda imagen decorativa usa `alt=""`.
- Toda imagen informativa tiene `alt` descriptivo.
- Iconos decorativos usan `aria-hidden="true"`.

```html
<!-- Decorativa -->
<img src="bg.png" alt="" aria-hidden="true" />

<!-- Informativa -->
<img src="logo.png" alt="Logo de SIPNAM" />

<!-- Icono -->
<i class="icon-home" aria-hidden="true"></i>
```

## 8. Tablas de datos

```html
<table>
  <caption>Asistencia del día 23/07/2026</caption>
  <thead>
    <tr>
      <th scope="col">Nombre</th>
      <th scope="col">Estado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Juan Pérez</td>
      <td>Presente</td>
    </tr>
  </tbody>
</table>
```

## 9. Testing de accesibilidad

### 9.1 Herramienta: axe-core

```bash
npm install -D @axe-core/react
```

En desarrollo:

```typescript
// src/main.tsx
import ReactDOM from 'react-dom/client';
import App from './App';

if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

### 9.2 Auditoría manual

1. Navegar solo con teclado (sin mouse).
2. Usar lector de pantalla (NVDA o VoiceOver).
3. Verificar contraste con herramientas como [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
