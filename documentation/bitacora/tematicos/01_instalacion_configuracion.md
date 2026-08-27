# 00 - Instalación y Configuración Inicial del Proyecto

> **Semana 1 · 23 al 24 de julio de 2026**

Este es el primer documento de la bitácora. Documenta **cómo se instaló y configuró** el proyecto desde cero, el **porqué** de cada decisión, y la **documentación inicial** que se hizo para entender de qué se trataba el proyecto y qué había que construir.

Cuando este documento se convierta a Word, cada semana posterior detallará las actividades específicas realizadas en esa semana. Esta semana se completó en **2 días de trabajo**.

---

## 1. Por qué este stack

### React + TypeScript con Vite

- **Por qué React:** ecosistema maduro, componentes reutilizables (ideal para las pantallas repetitivas de asistencias/escuelas) y gran soporte para el tipo de app (formularios, listas, paneles).
- **Por qué TypeScript:** tipado estricto que evita errores en tiempo de ejecución, fundamentales en un sistema con roles y datos sensibles.
- **Por qué Vite:** arranque y recarga en caliente (HMR) muy rápidos, comparado con alternativas más pesadas.

### Firebase (Auth + Firestore + Hosting)

- **Por qué una BBDD NoSQL en la nube:** la app necesita **tiempo real** (las asistencias/novedades de una escuela deben verse al instante) y sincronización multi-dispositivo, que Firestore resuelve con `onSnapshot`.
- **Por qué Firestore y no un backend propio:** evita mantener servidores, autenticación y despliegue se simplifican, y el modelo de reglas de seguridad encaja con los roles.

### react-hook-form + Zod

- Por qué: validación declarativa y schemas centralizados, evitando formularios con errores inconsistentes.

### jsPDF + Recharts

- Reportes PDF de asistencias/historial y gráficos de actividad.

---

## 2. Cómo se instaló (paso a paso real)

### 2.1. Creación del proyecto base

```bash
# Crear proyecto Vite con plantilla de React + TypeScript
npm create vite@latest proyecto-pasantia -- --template react-ts
cd proyecto-pasantia

# Instalar dependencias base
npm install
```

Esto generó la estructura raíz inicial: `index.html`, `src/`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`.

### 2.2. Instalación de dependencias de la aplicación

```bash
npm install react-router-dom firebase
npm install react-hook-form zod
npm install recharts jspdf jspdf-autotable
npm install lucide-react motion @formkit/auto-animate
npm install -D prettier @testing-library/react @testing-library/jest-dom vitest jsdom
```

### 2.3. Configuración de TypeScript y Vite

- Se definió el **alias `@/` → `src/`** en `vite.config.ts` y `tsconfig.app.json`, para importaciones limpias.
- `tsconfig.app.json` con `strict: true`.
- Se revisó `vite.config.ts` con el plugin de React y el de PWA (instalado luego para soporte de instalación móvil).

### 2.4. Configuración de ESLint + Prettier

- Flat config en `eslint.config.js` con `typescript-eslint`, reglas de React Hooks, y `eslint-plugin-prettier`.
- `.prettierrc`: single quotes, trailing comma es5, printWidth 100.

### 2.5. Configuración de Firebase

Ver detalle en `09_setup_firebase.md`. Resumen:

1. Crear proyecto en **Firebase Console**.
2. Habilitar **Authentication** (email/password).
3. Crear **Firestore** (modo de prueba en desarrollo).
4. Configurar variables de entorno en `.env` (API keys, projectId, etc.).
5. Inicializar la app en `src/services/firebase.ts` (`initializeApp`, `getAuth`, `initializeFirestore`).
6. Definir `firestore.rules` para restringir el acceso por `escuelaId` según el rol (los no-supervisores solo leen su propia escuela).

### 2.6. Configuración del router y estructura de carpetas

- `src/routes/index.tsx` con las rutas protegidas por rol (`ROUTE_PERMISSIONS` en `AuthContext.tsx`).
- Estructura por carpetas: `components/`, `context/`, `hooks/`, `pages/`, `services/`, `types/`, `utils/`.

## 3. Documentación para entender el proyecto

Además de configurar el entorno, en esta primera semana se realizó la **documentación inicial** para entender de qué se trataba el proyecto y qué había que hacer. Esta documentación quedó en `documentation/`:

- **Contexto general** (`01_contexto_general.md`): en qué consiste el sistema, para quién es y el problema que resuelve.
- **Requerimientos** (`02_requerimientos.md`): qué funcionalidades debía tener la aplicación.
- **Arquitectura** (`03_arquitectura.md`): cómo se estructura el sistema y las decisiones técnicas.
- **Reglas de negocio** (`04_reglas_negocio.md`): reglas de asistencias, novedades, incidentes y roles.
- **Base de datos** (`05_base_datos.md`): modelo de datos en Firestore (colecciones y campos).
- **API** (`06_api.md`): servicios y consultas de datos.
- **Diseño UI** (`07_diseno_ui.md`): pantallas, flujos y estilo visual.
- **Configuración de Firebase** (`09_setup_firebase.md`): pasos para Firebase.
- **Manejo de errores, validaciones, estado, testing, despliegue y accesibilidad** (docs 11 a 17).

Esta documentación sirvió de **guía** para saber qué construir a lo largo del proyecto y para retomarlo en cualquier momento (se documenta en `CONTEXT.md`).

---

## 4. Verificación inicial

Cada paso se validó con:

```bash
npx tsc -b --noEmit   # compilación
npm run lint          # linting
npm run dev           # arranque local en http://localhost:5173
```

---

## 5. Tiempo invertido en la Semana 1

La siguiente tabla muestra el tiempo que se tardó en cada tarea de esta primera semana (documentación + instalación y configuración del entorno). Los valores están estimados en base a la jornada de trabajo del 23 y 24 de julio de 2026.

| Tarea | Tiempo estimado |
|---|---|
| **Documentación para entender el proyecto** (contexto, requerimientos, arquitectura, base de datos, API, diseño UI, etc.) | ~2 días |
| Elección y revisión del stack tecnológico | ~1 h |
| Creación del proyecto Vite + React + TS | ~30 min |
| Instalación de todas las dependencias | ~20 min |
| Configuración TypeScript + alias `@/` | ~30 min |
| Configuración ESLint + Prettier | ~30 min |
| Configuración Firebase (proyecto, Auth, Firestore, `.env`, inicialización) | ~1 h |
| Reglas de seguridad Firestore + índices | ~1 h |
| Router protegido por rol + estructura de carpetas | ~1 h |
| **Total Semana 1** | **~2 días de trabajo** |

> A esta base de instalación se le sumó, en la misma semana, el armado del **MVP** (tipos, servicios, componentes y el panel del Supervisor), que se detalla en `01_semana_1.md`.

---

## 6. Pendientes y observaciones

- Ajustar `firestore.rules` para el escenario definitivo de producción.
- Configurar variables de entorno para el despliegue (Netlify y/o Firebase Hosting).
- Las semanas siguientes de esta bitácora documentan las funcionalidades construidas sobre esta base.
