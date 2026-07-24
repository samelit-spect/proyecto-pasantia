# 08 - Tareas Pendientes

> Este archivo se actualizará automáticamente al finalizar cada sección o tarea de desarrollo.
> Las tareas se agregarán aquí según lo indicado en `AGENTS.md`.

---

## Estado actual (última actualización: 24/07/2026)

### Completado en esta sesión

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

- [ ] Crear 17 usuarios en Authentication (1 director por escuela)
- [ ] Crear 17 documentos en Firestore `usuarios` con rol `director` y `escuelaId` correspondiente

---

## Tareas futuras (post-MVP)

- [ ] Panel de gestión de usuarios del Supervisor (crear/borrar directores, asignar escuelas)
- [ ] Asistencia de docentes (placeholder creado, pendiente de implementar)
- [ ] Foto diaria de preceptores (vista independiente, vacía por ahora)
- [ ] Code splitting para reducir bundle (Firebase pesa ~850KB)
- [ ] Crear composite indexes en Firestore para queries con `where` + `orderBy` (si se necesitan ordenar por campo)
