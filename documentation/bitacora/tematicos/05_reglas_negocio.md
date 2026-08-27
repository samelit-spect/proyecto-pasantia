# 05 - Reglas de Negocio

> Este documento de la bitácora recopila las **reglas de negocio** del sistema: qué se puede hacer, quién puede hacerlo y bajo qué condiciones. Fueron la guía para implementar los formularios, la navegación, las reglas de Firestore y los roles.

Las reglas se confirman y se hacen cumplir tanto en el **frontend** (validación de formularios, rutas por rol) como en la **base de datos** (reglas de seguridad Firestore).

---

## 1. Reglas de asistencia de gestión

| ID | Regla |
|---|---|
| BR-AS-01 | Solo director, vice-director o preceptor pueden completar el formulario de asistencia. |
| BR-AS-02 | El director puede cargar **un solo formulario por día** por su escuela. |
| BR-AS-03 | El vice-director puede cargar **un solo formulario por día** por su escuela. |
| BR-AS-04 | Cada preceptor puede cargar **un formulario por día** (si hay 3 preceptores, hasta 3 formularios/día en total). |
| BR-AS-05 | El formulario es de **carga masiva**: se registra la asistencia de todos los integrantes de la gestión (director, vice, preceptores, secretarios, conserjes) en un solo envío. |
| BR-AS-06 | Para cada integrante, el estado es **obligatorio** (presente o ausente). |
| BR-AS-07 | Si un integrante está **ausente**, el motivo es **obligatorio**. Si está **presente**, el campo de motivo se oculta. |

### Cómo se hace cumplir

- **Duplicado por día:** antes de guardar se verifica (con `checkDuplicate`) si ya existe un registro de esa escuela para esa fecha. Si existe, se bloquea con el mensaje *"Ya cargaste la asistencia de esta escuela para esa fecha."*
- **Motivo obligatorio si ausente:** validación en el formulario (`AttendanceForm`) y para los integrantes sin nombre en modo secciones también se exige el nombre.

---

## 2. Reglas de novedades

| ID | Regla |
|---|---|
| BR-NO-01 | Solo director o vice-director pueden registrar novedades. |
| BR-NO-02 | Los campos escuela, fecha y descripción son obligatorios. |
| BR-NO-03 | No hay límite de novedades por día. |

### Cómo se hace cumplir

- Rutas/roles (`ROUTE_PERMISSIONS`) y reglas de Firestore: `novedades` solo se crean por roles `director`/`vice` de la propia escuela.
- Schema Zod (`novedadSchema`) exige tipo, fecha y descripción; la descripción tiene máximo 500 caracteres.

---

## 3. Reglas de incidentes

| ID | Regla |
|---|---|
| BR-IN-01 | Solo director o vice-director pueden registrar incidentes. |
| BR-IN-02 | Los campos escuela, fecha y descripción son obligatorios. |
| BR-IN-03 | Todo incidente nuevo se crea con estado **"pendiente"** por defecto. |
| BR-IN-04 | **Solo el Supervisor** puede cambiar el estado de un incidente. |
| BR-IN-05 | Transiciones de estado permitidas: |
| BR-IN-06 | No hay límite de incidentes por día. |

```
pendiente → en_analisis → en_gestion → resuelto
                ↓
           pendiente     (se vuelve a pendiente si se requiere más información)
```

### Cómo se hace cumplir

- En Firestore (`firestore.rules`), `incidentes` solo se **crean** por roles `director`/`vice` de la propia escuela, y el `update` del estado (campos `estado` y `updatedAt`) **solo lo puede hacer el Supervisor**.
- Cada cambio de estado queda registrado en el **historial de trazabilidad** del incidente (quién y cuándo).

---

## 4. Reglas de autenticación y acceso

| ID | Regla |
|---|---|
| BR-AU-01 | Todo usuario debe estar autenticado para acceder a cualquier vista del sistema. |
| BR-AU-02 | El rol del usuario se obtiene de Firestore al login y se guarda en el `AuthContext`. |
| BR-AU-03 | Cada ruta protegida verifica el rol antes de renderizar; si no tiene permisos, se redirige a `/`. |
| BR-AU-04 | Un usuario no puede modificar su propio rol ni el de otro usuario. |

### Cómo se hace cumplir

- `AuthContext.canAccess(route)` + `ROUTE_PERMISSIONS`.
- En Firestore, el `update` de `usuarios` solo permite cambiar `nombre`/`email` (no el rol) salvo que sea el Supervisor (`onlyChangedFields(['nombre', 'email'])`).

---

## 5. Reglas del Supervisor

| ID | Regla |
|---|---|
| BR-SU-01 | El Supervisor **solo visualiza** información salvo lo indicado; no registra asistencias, novedades ni incidentes. |
| BR-SU-02 | El Supervisor puede ver la información de **todas** las escuelas de la jurisdicción. |
| BR-SU-03 | El Supervisor puede **cambiar el estado** de los incidentes (gestión de casos) y **marcar/desmarcar la verificación** de asistencias. |
| BR-SU-04 | El Supervisor **no puede editar ni eliminar** registros de asistencia, novedades o incidentes. | 

### Cómo se hace cumplir

- En Firestore, el Supervisor tiene acceso de lectura a todas las escuelas (`canSeeSchool`).
- El `update` de `asistencias`/`asistencia_docentes` solo lo hace el Supervisor y únicamente en los campos de **verificación** (`verificada`, `verificadoPor`, `verificadoPorNombre`, `verificadoEn`).
- El `update` de `incidentes` solo lo hace el Supervisor y solo en `estado`/`updatedAt`.
- La **eliminación** está bloqueada (`allow delete: if false`) para conservar el historial.

---

## 6. Verificación de asistencias por el Supervisor

- El Supervisor puede **verificar** (validar) una asistencia de gestión o de docentes: se marca con `verificada: true` y se guardan los datos de quién y cuándo la verificó.
- Esto agrega una capa de **control de calidad** sobre las cargas realizadas por directores/vices/preceptores.

---

## 7. Roles del sistema (resumen)

```
director | vice | preceptor | secretario | conserje | supervisor
```

| Rol | Principal responsabilidad |
|---|---|
| Director | Carga asistencia, novedades e incidentes |
| Vice | Carga asistencia, novedades e incidentes |
| Preceptor | Carga asistencia de gestión, docentes y foto diaria |
| Secretario / Conserje | Son registrados en la asistencia (no cargan formularios) |
| Supervisor | Supervisa todas las escuelas, gestiona estados de incidentes y verifica asistencias |

---

## 8. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Definición de reglas de asistencia y formulario de carga masiva | Semana 1-2 | ~1 día |
| Reglas de novedades e incidentes | Semana 1-2 | ~4 h |
| Verificación de asistencias por el Supervisor | Semana 2 | ~3 h |
| Trazabilidad de cambios de estado de incidentes | Semana 4 | ~4 h |
| Refuerzo de reglas en Firestore según rol/escuela | Semana 2 y 5 | ~1 día |
| **Total aproximado** | - | **~3-4 días** |

---

## 9. Pendientes y observaciones

- Revisar si el Supervisor debe poder editar registros en algún caso especial.
- Definir política de auditoría completa (quién modificó qué y cuándo) a futuro.
