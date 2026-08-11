# 02 - Requerimientos del Sistema

## 1. Requerimientos Funcionales — SIPNAM (Asistencias y Novedades)

### 1.1 Asistencias

| ID | Requerimiento |
|---|---|
| RF-AS-01 | El sistema debe permitir el registro de asistencia del personal de gestión mediante un formulario de carga masiva. |
| RF-AS-02 | El formulario debe incluir: selección de escuela, selección de fecha, y para cada integrante de la gestión: estado (presente/ausente) + campo de descripción si marca ausente. |
| RF-AS-03 | Solo el director, vice-director o preceptor pueden completar el formulario de asistencia. |
| RF-AS-04 | El director puede cargar 1 formulario por día (es único por escuela). |
| RF-AS-05 | El vice-director puede cargar 1 formulario por día (es único por escuela). |
| RF-AS-06 | Los preceptores pueden cargar múltiples formularios por día (cada uno carga el suyo). |
| RF-AS-07 | Los roles que se registran en el formulario son: director, vice-director, preceptores, secretarios y conserjes. |
| RF-AS-08 | Si un integrante se marca como ausente, se debe desbloquear un campo de texto para indicar el motivo. |
| RF-AS-09 | El Supervisor debe poder visualizar las asistencias de todas las escuelas, organizadas por escuela y fecha. |
| RF-AS-10 | El Supervisor debe poder consultar registros históricos de asistencia. |
| RF-AS-11 | El sistema debe permitir el registro de asistencia de los docentes por separado, en una vista independiente (`/asistencia-docentes`). |
| RF-AS-12 | Los docentes se cargan por escuela (nombre + materia opcional) y solo los activos aparecen en el formulario de asistencia. |
| RF-AS-13 | Director, vice-director o preceptor pueden completar el formulario de asistencia de docentes. |

### 1.2 Subida de fotos (preceptores)

| ID | Requerimiento |
|---|---|
| RF-FO-01 | Los preceptores deben poder subir diariamente la foto de la planilla firmada de asistencia. |
| RF-FO-02 | Esta vista está destinada exclusivamente a preceptores. |
| RF-FO-03 | Las fotos se indexan por escuela y fecha; el Supervisor las visualiza en el detalle de cada escuela. |
| RF-FO-04 | El preceptor que subió una foto puede eliminarla. |

### 1.3 Novedades

| ID | Requerimiento |
|---|---|
| RF-NO-01 | El sistema debe permitir el registro de novedades institucionales mediante un formulario. |
| RF-NO-02 | El formulario debe incluir: selección de escuela, selección de fecha, tipo de novedad, hora (opcional) y campo de descripción. |
| RF-NO-03 | Solo el director o vice-director pueden registrar novedades. |
| RF-NO-04 | El Supervisor debe poder visualizar las novedades agrupadas por escuela. |

---

## 2. Requerimientos Funcionales — SAI-Móvil (Incidentes)

| ID | Requerimiento |
|---|---|
| RF-IN-01 | El sistema debe permitir el registro de incidentes institucionales mediante un formulario. |
| RF-IN-02 | El formulario debe incluir: selección de escuela, selección de fecha, categoría, urgencia, ubicación (opcional), foto (opcional) y campo de descripción del incidente. |
| RF-IN-03 | Solo el director o vice-director pueden registrar incidentes. |
| RF-IN-04 | El Supervisor debe poder visualizar los incidentes agrupados por escuela. |
| RF-IN-05 | El Supervisor debe poder gestionar el estado de cada incidente: en análisis, en gestión, resuelto, pendiente. |
| RF-IN-06 | El sistema debe mantener un historial institucional de incidentes registrados. |

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Categoría |
|---|---|---|
| RNF-01 | La interfaz debe ser responsive y funcionar correctamente en computadoras, notebooks, celulares y tablets. | Usabilidad |
| RNF-02 | La interfaz debe ser simple e intuitiva, adecuada para su utilización en contextos de urgencia institucional. | Usabilidad |
| RNF-03 | El sistema debe funcionar en condiciones de conectividad limitada para el módulo de incidentes. | Disponibilidad |
| RNF-04 | Los registros deben encontrarse organizados y disponibles para su consulta cuando sean requeridos por el Supervisor. | Disponibilidad |
| RNF-05 | El sistema debe priorizar el uso de información liviana, asegurando su sostenibilidad operativa en el tiempo. | Rendimiento |
| RNF-06 | La solución debe poder utilizarse desde distintos dispositivos disponibles en las instituciones educativas. | Compatibilidad |

---

## 4. Requerimientos Técnicos

| ID | Requerimiento | Tecnología |
|---|---|---|
| RT-01 | Desarrollo del frontend con framework de componentes y tipado estático. | React 19 + TypeScript |
| RT-02 | Bundler del proyecto con soporte para hot module replacement. | Vite 8 |
| RT-03 | Sistema de rutas anidadas con soporte para layouts. | React Router v7 |
| RT-04 | Servicio de autenticación de usuarios. | Firebase Auth |
| RT-05 | Base de datos NoSQL para almacenamiento de registros. | Firestore |
| RT-06 | Almacenamiento de archivos (fotos de planillas). | Firestore (imágenes comprimidas en base64) |
| RT-07 | Formateo y linting del código fuente. | Prettier + ESLint |
| RT-08 | Modelo de datos NoSQL optimizado para consultas por escuela y fecha. | Firestore collections |
