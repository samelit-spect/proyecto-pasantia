# Instrucciones para agentes

## Antes de modificar código

1. Leer `documentation/CONTEXT.md` para entender el estado actual del proyecto.
2. Revisar documentación relevante en `documentation/`.
3. Mantener la arquitectura existente.
4. No instalar dependencias sin justificar.
5. Mantener TypeScript estricto.

## Al finalizar cada tarea

6. Ejecutar verificación:
   - `npx tsc -b --noEmit` (compilación)
   - `npx vitest run` (tests)
   - `npm run lint` (linting)
7. Commitear con mensaje descriptivo en inglés, estilo convencional:
   - `feat:` nueva funcionalidad
   - `fix:` corrección de bug
   - `refactor:` reestructuración sin cambio funcional
   - `perf:` mejora de rendimiento
8. Agregar tareas pendientes/futuras a `documentation/08_tareas_pendientes.md`.

## Convenciones del proyecto

### Código
- React 19 + TypeScript + Vite 8
- react-hook-form + Zod para formularios
- CSS personalizado con variables (no Tailwind, no CSS modules)
- Componentes en carpetas: `ComponentName/ComponentName.tsx + ComponentName.css`
- Tests junto al componente: `ComponentName.test.tsx`
- Path alias: `@/` → `src/`

### Firestore
- Colecciones: `escuelas`, `usuarios`, `asistencias`, `asistencia_docentes`, `docentes`, `fotos`, `novedades`, `incidentes`
- Las queries de colección (`getSchools()`) fallan para directores — usar `getSchoolById()`
- Tiempo real: funciones `subscribe*` con `onSnapshot` en `firestore.ts`
- Fotos: base64 comprimido en Firestore (sin Storage)
- Reglas: no-supervisores solo leen su `escuelaId`

### Roles
- `supervisor`: acceso total
- `director`, `vice`, `preceptor`: acceso a su escuela (`profile.escuelaId`)
- `secretario`, `conserje`: solo son registrados en asistencia

### Tema
- CSS variables para colores
- Persistencia en `localStorage` key `sipnam-theme`
- Dark/light toggle en `/tema`

## Archivos importantes

- `documentation/CONTEXT.md` — Estado completo del proyecto para retomar
- `documentation/08_tareas_pendientes.md` — Tareas pendientes
- `src/services/api/firestore.ts` — Todas las queries Firestore
- `src/context/AuthContext.tsx` — Estado de autenticación
- `src/utils/validation.ts` — Schemas Zod
- `firestore.rules` — Reglas de seguridad
- `firestore.indexes.json` — Índices compuestos
