# 13 - Testing

> Este documento de la bitácora recopila la **estrategia de testing** del proyecto y los **tests reales** ya implementados.

---

## 1. Stack de testing

| Herramienta | Propósito |
|---|---|
| **Vitest** | Test runner (nativo de Vite, reemplaza Jest) |
| **Testing Library** (`@testing-library/react`) | Tests de componentes React |
| **`@testing-library/jest-dom`** | Matchers extra para aserciones de DOM |
| **jsdom** | Simulación del DOM en Node.js |

## 2. Configuración

- En `vite.config.ts`: `test.globals = true`, `test.environment = 'jsdom'`, `setupFiles = './src/test/setup.ts'`.
- `src/test/setup.ts`: `import '@testing-library/jest-dom';`
- Script: **`npm run test`** → `vitest run`.

## 3. Tests unitarios

| Archivo | Qué cubre |
|---|---|
| `src/test/validation.test.ts` | Schemas Zod (`novedadSchema`, `incidenteSchema`): casos válidos e inválidos (fechas futuras, descripciones cortas, campos faltantes) |
| `src/test/constants.test.ts` | Constantes de la app (estados, roles, valores de negocio) |
| `src/test/image.test.ts` | Utilidades de imágenes (compresión/resize a base64) |

## 4. Tests de componentes

| Archivo | Qué cubre |
|---|---|
| `Login.test.tsx` | Formulario de inicio de sesión, validación y manejo de errores |
| `Novedades.test.tsx` / `Incidentes.test.tsx` | Formularios de registro y su validación |
| `AttendanceRow.test.tsx` | Fila de asistencia (estados, motivo si ausente) |
| `IncidentHistory.test.tsx` | Historial de incidentes y cambio de estado |
| `StatusBadge.test.tsx` | Renderizado según los 4 estados |
| `RetentionBanner.test.tsx` | Banner de retención/avisos |
| `NotFound.test.tsx` | Página 404 |

## 5. Smoke test global (`all-components.smoke.test.tsx`)

El test más importante: **monta TODAS las páginas y componentes comunes** para verificar que renderizan sin errores.

- **Stubs de APIs** que jsdom no implementa: `matchMedia`, `ResizeObserver`.
- **Mock de `AuthContext`** con rol configurable por test (director/supervisor), con valor estable para evitar bucles de efectos.
- **Mock de `ToastContext`** (`useToast`).
- **Mock de Firestore**: mockea las ~44 funciones de `firestore.ts` (queries y funciones `subscribe*` con `onSnapshot`) para datos seguros.
- Usa `createMemoryRouter` (Data Router) porque las páginas usan `<Link viewTransition>` / `useViewTransitionState`.
- Cubre: Login sin sesión, NotFound, Home (director/supervisor), Asistencia, Historial, Fotos, Novedades, Incidentes, Ayuda, Tema, y las páginas de Supervisor (Escuelas, Usuarios, Detalle). También ~18 componentes comunes (Button, DatePicker, StatusBadge, ErrorBoundary, Navbar, GlobalSearch, WelcomeTour, etc.).

> **Por qué importa:** garantiza que un cambio no rompa el renderizado de ninguna pantalla ni componente, sin tocar Firestore real.

## 6. Cobertura mínima (referencia)

- Objetivo: Lines/Functions/Statements > 60%, Branches > 50%.
- Para el MVP la cobertura **no es bloqueante**; se prioriza testear la lógica crítica (validación, auth, servicios, formularios) y el smoke test global.

## 7. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Configuración de Vitest + setup | Semana 3 | ~1-2 h |
| Tests unitarios (validación, constantes, imagen) | Semana 3 | ~3 h |
| Tests de componentes (Login, Novedades, Incidentes, etc.) | Semanas 3-5 | ~5 h |
| Smoke test global (mocks + montaje de todas las pantallas) | Semanas 4-5 | ~6 h |
| **Total aproximado** | - | **~1.5-2 días** |

## 8. Pendientes y observaciones

- Agregar tests de integración de servicios (`firestore.ts` con emulador de Firestore).
- Agregar tests más específicos de formularios (submit, validación en pantalla).
- Considerar generación de reporte de cobertura para visualizar avance.
