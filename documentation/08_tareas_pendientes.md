# 08 - Tareas Pendientes

> Este archivo se actualizará automáticamente al finalizar cada sección o tarea de desarrollo.
> Las tareas se agregarán aquí según lo indicado en `AGENTS.md`.

---

## Estado actual (última actualización: 11/08/2026)

### Completado en esta sesión

- **Campos ampliados en Novedades e Incidentes** (validado con el cliente):
  - Novedad: nuevo select "Tipo de novedad" (Acto, Actividad, Suspensión de clases, Evento, Otro) + campo "Hora" opcional. Se guardan `tipo` y `hora` en la colección `novedades`
  - Incidente: nuevo select "Categoría" (Rotura edilicia, Filtración, Falla de servicio, Urgencia, Seguridad, Otro), select "Urgencia" (Baja/Media/Alta), campo "Ubicación" opcional y subida de foto opcional. Se guardan `categoria`, `urgencia`, `ubicacion`, `fotoDataUrl` en `incidentes`
  - El Supervisor ahora muestra en el detalle de escuela: tipo + hora de cada novedad; y categoría, urgencia (con color), ubicación y foto de cada incidente
  - Opciones centralizadas en `src/utils/constants.ts`; schemas actualizados en `src/utils/validation.ts` (novedadSchema con `tipo`, incidenteSchema con `categoria` y `urgencia` obligatorios)
  - Tests de validación actualizados (13 tests pasando); lint 0 warnings; build OK
- **Imágenes sin Firebase Storage (base64 en Firestore)** (decisión del cliente: no crear Storage por costo):
  - Nueva utilidad `src/utils/image.ts` (`fileToCompressedDataUrl`): comprime la foto en el navegador (canvas, ~1024px, JPEG calidad ~0.6) y retorna un data URL
  - Las fotos de `/fotos` se guardan como `dataUrl` en la colección `fotos`; la foto del incidente como `fotoDataUrl` en el documento del incidente (límite por documento: 1 MiB)
  - `FotoThumb` ahora recibe `dataUrl` directa (sin Storage); se eliminó `storage.ts`, `storage.rules` y el bloque `storage` de `firebase.json`
  - No hace falta activar Firebase Storage en la consola
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
  - Las fotos no requieren Storage: se guardan comprimidas en base64 dentro de Firestore

- **Asistencia de Docentes (RF-AS-11/12/13):**
  - Nueva colección `docentes` (nombre, materia opcional, escuelaId, activo) gestionada por el Supervisor en el detalle de escuela (agregar/desactivar)
  - Nueva colección `asistencia_docentes` con el mismo esquema de `asistencias` pero campo `materia`
  - Página `/asistencia-docentes` accesible para director/vice/preceptor usando un `AttendanceForm` compartido
  - Doble carga bloqueada con `getDocenteAttendanceByUserAndDate` (misma regla que BR-AS-02/03/04)
  - Sección "Asistencia de Docentes" en el detalle de escuela del Supervisor (con filtros de fecha)
- **Foto Diaria de Preceptores (RF-FO-01..04):**
  - Página `/fotos` exclusiva para preceptores: comprime la foto y la guarda como base64 (`dataUrl`) en la colección `fotos`
  - Listado de fotos por escuela+fecha, con vista previa y eliminación (solo la propia)
  - Sección "Fotos de Planillas" en el detalle de escuela del Supervisor (miniatura + fecha + autor)
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

---

## Tareas futuras (post-MVP)

- [ ] El chunk principal aún pesa ~930KB por el SDK monolítico de Firebase; evaluar importar solo los módulos usados o el uso de `firebase/compat` (el code splitting de páginas ya está aplicado)
- [ ] Crear composite indexes en Firestore para queries con `where` + `orderBy` (si se necesitan ordenar por campo)
- [ ] Ampliar cobertura de tests (formularios, AuthContext, servicios; ver `14_testing.md`)
