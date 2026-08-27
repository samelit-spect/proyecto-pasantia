# 02 - Base de Datos

> Este documento de la bitácora recopila todo lo relacionado con la **base de datos** del proyecto: qué tecnología se usó, por qué, qué estructura tiene, cómo se relacionan los datos, las reglas de seguridad y los índices. Se trabajó a lo largo de varias semanas del proyecto.

---

## 1. Tecnología elegida y por qué

Se utilizó **Firestore** (base de datos NoSQL en la nube de Firebase).

### Por qué Firestore

- **Modelo documento/colección:** encaja de forma natural con la estructura del sistema (escuelas, usuarios, registros de cada día).
- **Tiempo real:** necesario para que las asistencias, novedades e incidentes se vean al instante en los paneles del Supervisor y de cada escuela. Firestore lo resuelve con suscripciones `onSnapshot`.
- **Sincronización multi-dispositivo:** los datos se comparten entre todos los perfiles sin mantener un servidor propio.
- **Soporte offline:** escritura local y sincronización automática cuando vuelve la conexión (clave porque las escuelas pueden quedarse sin internet).
- **Seguridad por reglas:** se puede restringir el acceso por rol y por escuela directamente en la base de datos.
- **Ya integrado con Firebase Auth:** el mismo ecosistema maneja login y datos.

### Por qué no una base SQL tradicional

- En SQL (tablas + relaciones con joins) se habría necesitado un servidor backend propio y más configuración de autenticación/sincronización.
- El volumen y la forma de consulta del sistema (registros por día por escuela) se adaptan mejor a documentos.
- Se simplifica el despliegue: no hay servidor de base de datos que administrar.

---

## 2. Estructura de la base de datos

### 2.1 Colecciones

```
firestore/
├── escuelas/                # Un documento por escuela
├── usuarios/                # Un documento por usuario del sistema
├── docentes/                # Un documento por docente (cargados por el Supervisor)
├── asistencias/             # Un documento por carga de asistencia de gestión
├── asistencia_docentes/     # Un documento por carga de asistencia de docentes
├── novedades/               # Un documento por cada novedad registrada
├── incidentes/              # Un documento por cada incidente registrado
└── fotos/                   # Un documento por cada foto de planilla subida
```

### 2.2 `escuelas/{schoolId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `nombre` | string | Nombre de la escuela | Sí |
| `turno` | string | Turno (mañana, tarde, noche) | Sí |
| `direccion` | string | Dirección de la escuela | No |
| `activa` | boolean | Si la escuela está activa en el sistema | Sí |

### 2.3 `usuarios/{userId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `nombre` | string | Nombre completo del usuario | Sí |
| `email` | string | Correo (usado para login) | Sí |
| `rol` | string | Rol: director, vice, preceptor, secretario, conserje, supervisor | Sí |
| `escuelaId` | string | Referencia al documento de escuela | Sí |
| `cargo` | string | Cargo específico del usuario | Sí |
| `activo` | boolean | Si el usuario está activo | Sí |
| `createdAt` | timestamp | Fecha de creación | Sí |

### 2.4 `asistencias/{attendanceId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia a la escuela | Sí |
| `fecha` | timestamp | Fecha del registro | Sí |
| `cargadoPor` | string | UID del usuario que cargó | Sí |
| `cargadoPorNombre` | string | Nombre del usuario que cargó | Sí |
| `registros` | array | Asistencia de cada integrante (nombre, cargo, presente, motivo) | Sí |
| `createdAt` | timestamp | Fecha de creación | Sí |
| `verificada` | boolean | Si el Supervisor la verificó | No |
| `verificadoPor` / `verificadoPorNombre` / `verificadoEn` | - | Datos de la verificación | No |

### 2.5 `asistencia_docentes/{attendanceId}`

Igual que `asistencias` pero para docentes. Cada elemento de `registros[]` lleva `nombre`, `materia`, `presente`, `motivo`.

### 2.6 `docentes/{docenteId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `nombre` | string | Nombre del docente | Sí |
| `materia` | string | Materia o área | No |
| `escuelaId` | string | Referencia a la escuela | Sí |
| `activo` | boolean | Solo los activos aparecen en el formulario | Sí |
| `createdAt` | timestamp | Fecha de creación | Sí |

### 2.7 `novedades/{newsId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia a la escuela | Sí |
| `fecha` | timestamp | Fecha de la novedad | Sí |
| `tipo` | string | acto, actividad, suspension, evento, otro | Sí |
| `hora` | string | Hora (HH:MM) | No |
| `descripcion` | string | Descripción | Sí |
| `cargadoPor` / `cargadoPorNombre` | string | Quién registró | Sí |
| `createdAt` | timestamp | Fecha de creación | Sí |

### 2.8 `incidentes/{incidentId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia a la escuela | Sí |
| `fecha` | timestamp | Fecha del incidente | Sí |
| `categoria` | string | rotura, filtracion, falla_servicio, urgencia, seguridad, otro | Sí |
| `urgencia` | string | baja, media, alta | Sí |
| `ubicacion` | string | Lugar dentro de la escuela | No |
| `fotoDataUrl` | string | Foto comprimida en base64 | No |
| `descripcion` | string | Descripción | Sí |
| `estado` | string | pendiente, en_analisis, en_gestion, resuelto | Sí |
| `cargadoPor` / `cargadoPorNombre` | string | Quién registró | Sí |
| `createdAt` / `updatedAt` | timestamp | Creación y última actualización de estado | Sí |

> **Historial de cambios de estado:** los cambios de `estado` se registran como historial de trazabilidad (cada vez que el Supervisor cambia el estado, queda constancia de cuándo y quién lo hizo). Se agregó en la Semana 4.

### 2.9 `fotos/{fotoId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia a la escuela | Sí |
| `fecha` | string | Fecha `YYYY-MM-DD` | Sí |
| `dataUrl` | string | Imagen comprimida en base64 (JPEG ~1024px) | Sí |
| `nombreArchivo` | string | Nombre original del archivo | Sí |
| `subidoPor` / `subidoPorNombre` | string | Preceptor que subió | Sí |
| `createdAt` | timestamp | Fecha de creación | Sí |

> **Nota sobre fotos:** las imágenes se guardan **comprimidas en base64 dentro del documento** (sin Firebase Storage), redimensionadas a ~1024px con calidad ~0.6 para no superar el límite de 1 MiB por documento.

---

## 3. Por qué las decisiones de diseño

- **`escuelaId` como clave de relación:** cada registro (asistencia, novedad, incidente, foto, docente, usuario) referencia a su escuela mediante `escuelaId`. Esto permite que cada perfil solo acceda a los datos de su propia escuela y que el Supervisor vea todo.
- **Guardar `cargadoPor` + `cargadoPorNombre`:** mantener el UID y el nombre evita consultas extra y permite mostrar "quién cargó" de forma directa.
- **`activo` (boolean) en usuarios y docentes:** en lugar de borrar registros, se desactivan. Así se conserva el historial y solo aparecen activos en los formularios.
- **Fotos en base64:** evita depender de Firebase Storage y simplifica el alta/lectura; a cambio exige compresión para respetar límites.
- **Timestamp de auditoría en usuarios/docentes** (`createdAt`, y trail de auditoría para gestiones del Supervisor): trazabilidad de quién creó/quién editó.

---

## 4. Cómo se relaciona cada cosa

Firestore **no tiene joins nativos**: las relaciones se resuelven en el frontend mediante consultas separadas o al cargar los datos.

```
escuelas ←──── usuarios.escuelaId
escuelas ←──── docentes.escuelaId
escuelas ←──── asistencias.escuelaId
escuelas ←──── asistencia_docentes.escuelaId
escuelas ←──── novedades.escuelaId
escuelas ←──── incidentes.escuelaId
escuelas ←──── fotos.escuelaId

usuarios ←──── asistencias.cargadoPor
usuarios ←──── asistencia_docentes.cargadoPor
usuarios ←──── novedades.cargadoPor
usuarios ←──── incidentes.cargadoPor
usuarios ←──── fotos.subidoPor
```

Es decir: **`escuelas` es la "colección padre"** a la que apuntan casi todos los registros, y **`usuarios` identifica a la persona que realizó cada carga**.

---

## 5. Índices compuestos

Los índices permiten consultar registros combinando dos o más campos (por ejemplo, todas las asistencias de una escuela ordenadas por fecha). Los definidos en `firestore.indexes.json`:

| Colección | Campos indexados | Motivo |
|---|---|---|
| `asistencias` | `escuelaId` + `fecha` (desc) | Asistencias de una escuela ordenadas por fecha |
| `asistencia_docentes` | `escuelaId` + `fecha` (desc) | Asistencias docentes de una escuela |
| `novedades` | `escuelaId` + `fecha` (desc) | Novedades de una escuela por fecha |
| `incidentes` | `escuelaId` + `fecha` (desc) | Incidentes de una escuela por fecha |
| `incidentes` | `estado` + `fecha` (desc) | Filtrar incidentes por estado |
| `fotos` | `escuelaId` + `fecha` + `createdAt` (desc) | Fotos de una escuela por fecha/subida |
| `fotos` | `escuelaId` + `createdAt` (desc) | Listar fotos de una escuela |

---

## 6. Reglas de seguridad (Firestore Rules)

Las reglas de `firestore.rules` controlan **quién puede leer y escribir cada colección** y qué campos puede modificar. Evolucionaron desde reglas básicas del MVP hasta reglas endurecidas por rol y por escuela.

### Funciones de apoyo

- `isSignedIn()`: el usuario está autenticado.
- `hasProfile()`: el usuario tiene un perfil en `usuarios/{uid}` (existe el documento).
- `userProfile()`: obtiene el perfil del usuario.
- `isSupervisor()`: el perfil tiene rol `supervisor`.
- `userHasAnyRole(roles)`: el usuario tiene alguno de los roles indicados.
- `userBelongsToSchool(schoolId)`: el usuario pertenece a esa escuela.
- `canSeeSchool(schoolId)` / `canSeeSchoolData()`: el Supervisor ve todo; los demás solo su propia escuela.
- `onlyChangedFields(allowedFields)`: solo se permiten cambiar los campos indicados.

### Permisos por colección

| Colección | Lectura | Creación | Actualización | Eliminación |
|---|---|---|---|---|
| `escuelas` | Supervisor o miembro de la escuela | Solo Supervisor | Solo Supervisor | Solo Supervisor |
| `usuarios` | El propio usuario, Supervisor o mismo escuela | Solo Supervisor | El propio (solo nombre/email) o Supervisor | Solo Supervisor |
| `asistencias` | Datos de su escuela (o todo si Supervisor) | Roles director/vice/preceptor, de su escuela, con su UID como `cargadoPor` | Solo Supervisor (verificación) | No |
| `asistencia_docentes` | Ídem | Ídem | Solo Supervisor (verificación) | No |
| `docentes` | Datos de su escuela (o todo si Supervisor) | Solo Supervisor | Solo Supervisor | Solo Supervisor |
| `novedades` | Datos de su escuela | Roles director/vice, de su escuela | No | No |
| `incidentes` | Datos de su escuela | Roles director/vice, de su escuela | Solo Supervisor (solo `estado` y `updatedAt`) | No |
| `fotos` | Datos de su escuela | Solo preceptor, de su escuela, con su UID como `subidoPor` | No | Supervisor, o el preceptor autor de su escuela |

### Detalles clave de las reglas

- **Los no-supervisores solo leen los datos de su propia escuela** (`canSeeSchoolData` compara `resource.data.escuelaId` con `profile.escuelaId`).
- **Al crear** un registro de asistencia/novedad/incidente/foto, las reglas exigen que el `cargadoPor`/`subidoPor` sea el UID del usuario autenticado **y** que la `escuelaId` coincida con la suya. Esto impide que un usuario cargue datos en nombre de otra escuela.
- **Solo el Supervisor puede cambiar el estado** de un incidente y **únicamente** los campos `estado` y `updatedAt` (protección contra cambios arbitrarios).
- **El Supervisor puede editar escuelas, docentes y crear usuarios.**
- **Eliminación** de datos sensibles (asistencias, novedades, incidentes) está **bloqueada** (`allow delete: if false`) para conservar el historial.

---

## 7. Tiempo estimado por tarea

La base de datos se construyó y fue evolucionando a lo largo del proyecto. Se lista el **tiempo estimado** de cada tarea relacionada (los valores son estimaciones del tiempo efectivo de trabajo).

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Diseño inicial del esquema (colecciones, campos, relaciones) | Semana 1 | ~1 día |
| Documentación de la base de datos (`05_base_datos.md`) | Semana 1 | ~3-4 h |
| Definición de tipos TypeScript (Attendance, News, Incident, Foto, etc.) | Semana 1-2 | ~3 h |
| Consultas y servicios Firestore (queries básicas) | Semana 1 | ~3 h |
| Endurecimiento de reglas de seguridad (por rol y escuela) | Semana 2 | ~1 día |
| Verificación de asistencias por el Supervisor (campos `verificada*`) | Semana 2 | ~3 h |
| Campos ampliados en novedades/incidentes + fotos en base64 | Semana 2 | ~4 h |
| Asistencia de docentes (`asistencia_docentes`) | Semana 2 | ~3 h |
| Índices compuestos y resolución de `orderBy` | Semanas 1-2 | ~2 h |
| Historial de cambios de estado de incidentes (trazabilidad) | Semana 4 | ~4 h |
| Queries jurisdiccionales (alcance Supervisor) y backup CSV | Semana 4 | ~4 h |
| Audit trail de usuarios/docentes y protección `exists()` en reglas | Semana 5 | ~4 h |
| **Total aproximado** | - | **~6 días** |

---

## 8. Pendientes y observaciones

- Revisar reglas de seguridad en el escenario definitivo de producción.
- Evaluar si el volumen de fotos en base64 requiere migrar a Firebase Storage.
- Mantener los índices actualizados si se agregan nuevas consultas combinadas.
