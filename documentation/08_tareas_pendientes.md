# 08 - Tareas Pendientes

> Este archivo se actualizará automáticamente al finalizar cada sección o tarea de desarrollo.
> Las tareas se agregarán aquí según lo indicado en `AGENTS.md`.

---

## Estado actual (última actualización: 11/08/2026)

### Completado en esta sesión

- **Rediseño del formulario de Asistencia de Gestión** (validado con el cliente):
  - Ya no depende de usuarios precargados: se divide en secciones por cargo (Director, Vice-director, Preceptores, Secretario/a, Conserje)
  - Cada fila tiene nombre editable (obligatorio solo si hay más de una persona en la sección), toggle presente/ausente y motivo obligatorio si está ausente
  - Botón "+ Agregar" en la sección de Preceptores (permite múltiples)
  - Botón "Enviar Asistencia" al final + ventana modal de éxito/error del envío
  - `AttendanceRow` ahora soporta nombre editable y botón para quitar filas
  - `AttendanceForm` soporta modo `sections` (gestión) y modo `list` (docentes, con "+ Agregar integrante")
- **Verificación y configuración de Firebase para el guardado de asistencias (COMPLETADA):**
  - Firestore nativo confirmado en `sipnam-proyecto` (edition STANDARD, modo FIRESTORE_NATIVE)
  - Las reglas desplegadas permiten `create` en `asistencias` → el envío de Asistencia de Gestión ya puede guardar
  - Se creó `firebase.json` + `firestore.indexes.json` en el repo
  - Se desplegaron las reglas actualizadas de Firestore (`asistencias`, `docentes`, `asistencia_docentes`, `fotos`, `novedades`, `incidentes`) y los índices compuestos necesarios (7 índices) vía `firebase deploy --project sipnam-proyecto`
  - **Pendiente (solo para Fotos):** Firebase Storage NO está creado en el proyecto. Ir a Firebase Console → Storage → "Get Started" y elegir ubicación del bucket antes de usar la página `/fotos`

- **Asistencia de Docentes (RF-AS-11/12/13):**
  - Nueva colección `docentes` (nombre, materia opcional, escuelaId, activo) gestionada por el Supervisor en el detalle de escuela (agregar/desactivar)
  - Nueva colección `asistencia_docentes` con el mismo esquema de `asistencias` pero campo `materia`
  - Página `/asistencia-docentes` accesible para director/vice/preceptor usando un `AttendanceForm` compartido
  - Doble carga bloqueada con `getDocenteAttendanceByUserAndDate` (misma regla que BR-AS-02/03/04)
  - Sección "Asistencia de Docentes" en el detalle de escuela del Supervisor (con filtros de fecha)
- **Foto Diaria de Preceptores (RF-FO-01..04):**
  - Página `/fotos` exclusiva para preceptores: sube la foto al Storage (`fotos/{schoolId}/{fecha}/...`) e indexa metadatos en la colección `fotos`
  - Listado de fotos por escuela+fecha, con vista previa y eliminación (solo la propia)
  - Sección "Fotos de Planillas" en el detalle de escuela del Supervisor (miniatura + fecha + autor)
  - Nuevo archivo `storage.rules` con reglas para `fotos/`
- **Refactor:** formulario de asistencia extraído a componente compartido `components/forms/AttendanceForm` (usado por `/asistencia` y `/asistencia-docentes`); `FotoThumb` compartido para miniaturas
- Validación de fecha futura en todos los formularios:
  - Esquemas compartidos en `src/utils/validation.ts` (`novedadSchema`, `incidenteSchema`) con regla `fecha <= hoy`
  - `DatePicker` ahora limita `max` a la fecha de hoy
  - Formulario de Asistencia valida fecha futura en `validate()`
- Evitar doble carga de asistencia por día (BR-AS-02/03/04):
  - Nueva query `getAttendanceByUserAndDate` (escuela + fecha + cargadoPor)
  - `Asistencia.tsx` bloquea el envío si el usuario ya cargó esa escuela/fecha
- Filtros de fecha / consulta histórica en `SupervisorSchoolDetail` (RF-AS-10):
  - Barra "Desde / Hasta" que filtra asistencias, novedades e incidentes en cliente (sin requerir nuevos índices)
  - Botón "Limpiar filtros"
- Soporte offline (RNF-03):
  - `enableIndexedDbPersistence(db)` en `firebase.ts`
  - Hook `useOnlineStatus` + componente `ConnectionBanner` (aviso amarillo bajo el navbar)
- Consistencia del campo `activo`: `getUsersBySchool` ahora filtra en cliente (`activo !== false`) para no excluir usuarios creados antes sin ese campo
- Code splitting con `lazy` nativo de React Router v7: cada página es un chunk independiente (Login 1.5KB, SupervisorSchools 7.6KB, etc.)
- Tests unitarios (vitest): `src/test/validation.test.ts` (schemas zod) y `StatusBadge.test.tsx` — 10 tests pasando
- Lint sin warnings (0 errores, 0 warnings): `watch()` reemplazado por `useWatch` en Novedades/Incidentes, `eslint-disable` de fast-refresh en AuthContext

### Completado en esta sesión (anterior)

- Panel del Supervisor rediseñado:
  - Home con estadísticas del día, acciones rápidas y actividad reciente
  - Listado de escuelas (cards clickeables)
  - Vista por escuela con 4 secciones colapsables (Asistencias, Novedades, Incidentes, Usuarios)
  - Formulario para crear escuelas desde la app
  - Placeholder de configuración de usuarios
- Navbar actualizada con links para director/vice/preceptor y supervisor
- Firestore rules actualizadas para permitir escritura al supervisor
- Bugs corregidos: CSS imports, auth race condition, permission bypass, composite index en getSchools

### Crear en Firebase Console

- [ ] Crear 17 escuelas en Firestore `escuelas` (o desde el panel del Supervisor con "Nueva escuela")
- [ ] Crear los usuarios de las 17 escuelas (1 director por escuela) — ahora se puede hacer desde Configuración de Usuarios (crea cuenta en Auth + perfil en Firestore)
- [ ] Activar Firebase Storage en la consola (Storage → "Get Started") para que funcione la página `/fotos` y luego desplegar `storage.rules` con `firebase deploy --only storage:rules --project sipnam-proyecto`

---

## Tareas futuras (post-MVP)

- [ ] El chunk principal aún pesa ~930KB por el SDK monolítico de Firebase; evaluar importar solo los módulos usados o el uso de `firebase/compat` (el code splitting de páginas ya está aplicado)
- [ ] Crear composite indexes en Firestore para queries con `where` + `orderBy` (si se necesitan ordenar por campo)
- [ ] Ampliar cobertura de tests (formularios, AuthContext, servicios; ver `14_testing.md`)
