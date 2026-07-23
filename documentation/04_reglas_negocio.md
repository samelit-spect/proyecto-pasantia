# 04 - Reglas de Negocio

## 1. Reglas de asistencia

| ID | Regla |
|---|---|
| BR-AS-01 | Solo el director, vice-director o preceptor pueden completar el formulario de asistencia. |
| BR-AS-02 | El director puede cargar **1 único formulario por día** por su escuela. |
| BR-AS-03 | El vice-director puede cargar **1 único formulario por día** por su escuela. |
| BR-AS-04 | Cada preceptor puede cargar **1 formulario por día** (si hay 3 preceptores, hay hasta 3 formularios/día en total). |
| BR-AS-05 | El formulario es de carga masiva: se registra la asistencia de **todos** los integrantes de la gestión en un solo envío (director, vice, preceptores, secretarios, conserjes). |
| BR-AS-06 | Para cada integrante del formulario, el estado es **obligatorio** (presente o ausente). |
| BR-AS-07 | Si un integrante se marca como **ausente**, el campo de descripción (motivo) es **obligatorio**. Si se marca como **presente**, el campo de motivo se oculta y no se requiere. |

## 2. Reglas de novedades

| ID | Regla |
|---|---|
| BR-NO-01 | Solo el director o vice-director pueden registrar novedades. |
| BR-NO-02 | Los campos **escuela**, **fecha** y **descripción** son obligatorios en todo registro de novedad. |
| BR-NO-03 | No existe límite de novedades por día. Se pueden registrar múltiples novedades en el mismo día. |

## 3. Reglas de incidentes

| ID | Regla |
|---|---|
| BR-IN-01 | Solo el director o vice-director pueden registrar incidentes. |
| BR-IN-02 | Los campos **escuela**, **fecha** y **descripción** son obligatorios en todo registro de incidente. |
| BR-IN-03 | Todo incidente nuevo se crea con estado **"pendiente"** por defecto. |
| BR-IN-04 | Solo el Supervisor puede cambiar el estado de un incidente. |
| BR-IN-05 | Las transiciones de estado permitidas son: |

```
pendiente → en_analisis → en_gestion → resuelto
                ↓
           pendiente     (si se requiere más información)
```

| ID | Regla |
|---|---|
| BR-IN-06 | No existe límite de incidentes por día. |

## 4. Reglas de autenticación y acceso

| ID | Regla |
|---|---|
| BR-AU-01 | Todo usuario debe estar autenticado para acceder a cualquier vista del sistema. |
| BR-AU-02 | El rol del usuario se obtiene de Firestore al momento del login y se almacena en AuthContext. |
| BR-AU-03 | Cada ruta protegida verifica el rol antes de renderizar. Si el rol no tiene permisos, se redirige a `/`. |
| BR-AU-04 | Un usuario no puede modificar su propio rol ni el de otro usuario. |

## 5. Reglas del Supervisor

| ID | Regla |
|---|---|
| BR-SU-01 | El Supervisor **solo puede visualizar** información. No puede registrar asistencias, novedades ni incidentes. |
| BR-SU-02 | El Supervisor puede ver la información de **todas** las escuelas de la jurisdicción. |
| BR-SU-03 | El Supervisor puede **cambiar el estado** de los incidentes (gestión de casos). |
| BR-SU-04 | El Supervisor **no puede editar ni eliminar** registros de asistencia, novedades o incidentes. Solo puede visualizar y gestionar estados de incidentes. |
