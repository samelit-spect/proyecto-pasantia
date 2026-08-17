# 08 - Tareas Pendientes

> Última actualización: 17/08/2026

---

## Completado en la sesión de refactor y mejoras (47 commits)

### Testing y calidad
- ✅ Tests de componentes (52 tests, `@testing-library/user-event`)
- ✅ React.memo en 10 componentes
- ✅ ErrorBoundary global
- ✅ Suspense fallback + HydrateFallback

### Arquitectura
- ✅ Descomponer SupervisorSchoolDetail (8 subcomponentes)
- ✅ Custom hook `useFeedback` para estados
- ✅ Paginación client-side en Historial
- ✅ dateKey centralizado + makeVerifyHandler
- ✅ Lazy load de rutas (ya existía)

### UX/UI
- ✅ Confirmaciones antes de eliminar
- ✅ Feedback 5 segundos
- ✅ Tooltips CSS
- ✅ Botón volver en Panel de Supervisión
- ✅ Vista Hoy/Histórico en detalle de escuela
- ✅ Theme settings con dark/light toggle
- ✅ Estética de cards de escuelas (stats, colores)

### Funcionalidad
- ✅ Home para directores/preceptores (Mi escuela + actividad)
- ✅ Eliminar SchoolSelect de formularios (usa `profile.escuelaId`)
- ✅ Editar usuarios + restablecer contraseña
- ✅ Tiempo real con onSnapshot en todos los paneles
- ✅ Offline persistence modernizado

### Fix
- ✅ EntrySeq global
- ✅ SchoolSelect para directores (`getSchoolById`)

---

## Pendiente

### Firebase Console
- [ ] Crear 17 escuelas en Firestore `escuelas`
- [ ] Crear usuarios iniciales (1 director por escuela)

### Mejoras futuras
- [ ] Reducir bundle de Firebase (~930KB monolítico)
- [ ] Tests de AuthContext, Firestore services, formularios
- [ ] Evaluar índices compuestos adicionales
- [ ] Offline: sync automático de incidentes creados sin conexión

---

## Tareas futuras (post-MVP)

- [ ] Crear composite indexes para queries con `where` + `orderBy` adicionales
- [ ] Ampliar cobertura de tests
- [ ] Evaluar migración a Firebase v12.x si hay nuevas features
