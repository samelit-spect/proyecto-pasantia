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
| `Login.test.tsx` | Formulario de inicio de sesión, validación y manejo de errores (incluye foco al mensaje de error tras login fallido) |
| `Novedades.test.tsx` / `Incidentes.test.tsx` | Formularios de registro, su validación y el feedback cuando falta user context |
| `AttendanceRow.test.tsx` | Fila de asistencia (estados, motivo si ausente) |
| `IncidentHistory.test.tsx` | Historial de incidentes y cambio de estado |
| `StatusBadge.test.tsx` | Renderizado según los 4 estados |
| `RetentionBanner.test.tsx` | Banner de retención/avisos |
| `NotFound.test.tsx` | Página 404 |
| `SchoolSelect.test.tsx` | Selector de escuelas (carga, selección, lista vacía) |

## 5. Tests de lógica / servicios (01/09/2026)

| Archivo | Qué cubre |
|---|---|
| `AuthContext.test.tsx` | Contexto de autenticación: arranque sin sesión, carga de perfil desde `usuarios/{uid}`, login con permisos, logout y usuario sin perfil (mocks de `firebase/auth` + `firebase/firestore`) |
| `firestore.test.ts` | Servicios de Firestore (mocks de bajo nivel): CRUD de escuelas/usuarios/docentes/incidentes/asistencias/fotos, actor en auditoría, `historialEstados` con `arrayUnion`, notificación al supervisor y suscripciones `subscribe*` |
| `componentTests.test.tsx` | `SchoolDetailToday` (vista Hoy), `SchoolDetailFeedback`, `useFeedback` y `SchoolSelect` |

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

## 7. Estado actual de la suite (02/09/2026)

- **179/179 tests en verde** (eran 115). Esquema: unitarios (validación, constantes,
  imagen) + componentes (Login, formularios, incidentes, badges, banners, SchoolSelect)
  + lógica/servicios (AuthContext, firestore, componentTests) + smoke global.
- Últimos sumados (02/09/2026, auditoría de datos): `fechaCreacion` con fallback a
  `createdAt`, `updateIncidentStatus` sin estado anterior, y `GlobalSearch` oculto
  para no-supervisores.
- Verificación completa tras cada cambio: `npx tsc -b --noEmit` + `npx vitest run` +
  `npm run lint`.

## 8. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Configuración de Vitest + setup | Semana 3 | ~1-2 h |
| Tests unitarios (validación, constantes, imagen) | Semana 3 | ~3 h |
| Tests de componentes (Login, Novedades, Incidentes, etc.) | Semanas 3-5 | ~5 h |
| Smoke test global (mocks + montaje de todas las pantallas) | Semanas 4-5 | ~6 h |
| Tests de AuthContext + Firestore services + componentes | Semana 7 | ~5 h |
| **Total aproximado** | - | **~2.5 días** |

## 9. Pendientes y observaciones

- Agregar tests de integración de servicios (`firestore.ts` con emulador de Firestore).
- Evaluar los 16 errores eslint pre-existentes (11 `react-compiler` setState síncrono en
  effects + 3 `any` en pdfExport + 1 purity + 1 memoization; detalle en
  `08_tareas_pendientes.md` ⚠️ deuda de lint).
- Considerar generación de reporte de cobertura para visualizar avance.
