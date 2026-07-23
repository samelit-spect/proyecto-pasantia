# 01 - Contexto General del Proyecto

## Nombre del Sistema

**SIPNAM** — Sistema Integrado de Partes de Novedades y Asistencias Módil
(incorpora el Módulo de Alertas de Incidentes Institucionales)

## Problemática

En la Supervisión Escolar se identificaron dos problemas centrales que afectan la gestión educativa de la jurisdicción:

### 1. Gestión de asistencias y novedades institucionales

La información sobre asistencias del personal docente y las novedades institucionales (actos, actividades, suspensiones de clases, eventos, y cualquier otro hecho relevante del establecimiento) se encuentra distribuida entre las escuelas, comunicada por distintos canales y sin un sistema centralizado de consulta. Esto genera:

- Dificultad para obtener una visión consolidada de la jurisdicción.
- Mayor tiempo dedicado a la búsqueda y recopilación de información.
- Dependencia de consultas individuales a cada establecimiento.
- Demoras en la elaboración de informes y respuestas administrativas.
- Falta de acceso rápido a registros históricos.

### 2. Gestión de incidentes institucionales

Ante situaciones de urgencia vinculadas a infraestructura escolar (roturas edilicias, fallas en servicios básicos, filtraciones, cortes de suministro o daños estructurales), los equipos directivos recurren a un circuito de solicitud basado en notas formales en soporte papel, complementado con comunicaciones informales (llamadas, mensajes). Esto provoca:

- Dependencia del circuito físico de documentación.
- Dispersión de la información por múltiples canales de comunicación.
- Demoras en la formalización de los reclamos.
- Falta de trazabilidad y registro único de incidentes.
- Dificultad para priorizar la atención según gravedad.

## Solución propuesta

El sistema se divide en dos módulos funcionales que comparten una misma plataforma web:

### Módulo SIPNAM — Asistencias y Novedades

Aplicación web accesible desde celulares y computadoras diseñada para centralizar y organizar tanto el registro de asistencias del personal de gestión como el registro de novedades institucionales.

**Asistencias — Flujo principal:**

El sistema de asistencias se compone de dos vistas:

*Vista 1 — Formulario de asistencia (gestión de la escuela):*

El formulario es de carga masiva: el director, vice-director o preceptor registra la asistencia de TODOS los integrantes de la gestión de su escuela en un solo formulario.

1. El director, vice-director o preceptor ingresa a la vista de asistencia.
2. Selecciona su escuela mediante una caja de opciones.
3. Selecciona la fecha del registro.
4. Para cada integrante de la gestión, registra si está presente o ausente.
5. Si marca ausente en algún integrante, se desbloquea un campo de descripción para indicar el motivo.

**Roles que completan el formulario (quién lo carga):**
- **Director:** 1 por día (es único por escuela).
- **Vice-director:** 1 por día (es único por escuela).
- **Preceptores:** múltiples por día (cada uno carga el suyo).

**Roles que se registran en el formulario (a quién se le toma asistencia):**
- Director
- Vice-director
- Preceptores
- Secretarios
- Conserjes

> **Nota (futuro):** Los docentes se registrarán por separado en una vista independiente. No se incluye en el MVP actual.

*Vista 2 — Subida de fotos (preceptores):*
1. Los preceptores suben diariamente la foto de la planilla firmada de asistencia.
2. Esta vista está destinada exclusivamente a preceptores.
3. *(Por definir — se deja vacía por ahora en el MVP.)*

*Vista Supervisor:*
1. El Supervisor visualiza la información de asistencia de todas las escuelas de la jurisdicción.
2. La información está organizada por escuela, fecha y estado.

**Novedades — Flujo principal:**

*Vista 1 — Formulario de novedad:*
1. El director o vice-director ingresa a la vista de novedades.
2. Selecciona su escuela mediante una caja de opciones.
3. Selecciona la fecha de la novedad.
4. Describe la novedad en un campo de texto (acto, actividad, suspensión de clases, evento, etc.).

*Vista Supervisor:*
1. El Supervisor visualiza las novedades agrupadas por escuela.
2. Dentro de cada escuela, se listan todas las novedades registradas.

### Módulo SAI-Móvil — Alertas de Incidentes

Sistema de registro digital unificado para la notificación de incidentes escolares, con foco en situaciones de urgencia edilicia o de infraestructura.

**Incidentes — Flujo principal:**

*Vista 1 — Formulario de incidente:*
1. El director o vice-director ingresa a la vista de incidentes.
2. Selecciona su escuela mediante una caja de opciones.
3. Selecciona la fecha del incidente.
4. Describe el incidente en un campo de texto (rotura edilicia, falla de servicio, filtración, etc.).

*Vista Supervisor:*
1. El Supervisor visualiza los incidentes agrupados por escuela.
2. Dentro de cada escuela, se listan todos los incidentes registrados.
3. El Supervisor puede gestionar el estado de cada caso (en análisis, en gestión, resuelto, pendiente).

## Objetivos

### General

Desarrollar una plataforma web que permita digitalizar y centralizar la gestión de asistencias, novedades e incidentes institucionales de las escuelas de la jurisdicción, facilitando al Supervisor Escolar el acceso rápido y organizado a la información para la toma de decisiones.

### Específicos

- Centralizar el registro de asistencias del personal de gestión (directores, vice-directores, preceptores) y novedades institucionales mediante formularios simples.
- Permitir la carga diaria de asistencia con registro de motivo en caso de ausencia.
- Organizar la información por escuela, fecha y rol para facilitar la consulta del Supervisor.
- Permitir el registro de incidentes institucionales con descripción detallada.
- Proporcionar un panel de supervisión con información consolidada y priorizada.
- Facilitar la consulta de registros históricos para respuestas administrativas.
- Funcionar en condiciones de conectividad limitada (módulo de incidentes).

## Alcance (MVP)

### Incluye

| SIPNAM (Asistencias y Novedades) | SAI-Móvil (Incidentes) |
|---|---|
| Formulario de asistencia masivo (escuela, fecha, todos los de gestión) | Formulario de incidente (escuela, fecha, descripción) |
| Roles que cargan: Director, Vice, Preceptores | Panel de supervisión agrupado por escuela |
| Roles registrados: Director, Vice, Preceptores, Secretarios, Conserjes | Gestión de estado (en análisis, en gestión, resuelto, pendiente) |
| Subida de fotos de planillas firmadas (preceptores, diario) | Historial institucional de incidentes |
| Formulario de novedad (escuela, fecha, descripción) | |
| Panel de supervisión agrupado por escuela | |
| Consulta centralizada de registros históricos | |

### No incluye

- Liquidación de haberes o procesos salariales.
- Gestión integral de legajos docentes.
- Integración con sistemas ministeriales externos.
- Automatización de procesos administrativos ajenos al registro de asistencias e incidentes.
- Canales de conversación interna entre usuarios.
- Automatización de asignación de recursos externos.

## Usuarios del sistema

### Roles que completan formularios

| Rol | Descripción | Permisos principales |
|---|---|---|
| **Director de escuela** | Responsable único del establecimiento | Cargar asistencia de toda la gestión (1/día), registrar novedades, registrar incidentes, ver registros de su escuela |
| **Vice-director de escuela** | Segundo al mando del establecimiento | Cargar asistencia de toda la gestión (1/día), registrar novedades, registrar incidentes, ver registros de su escuela |
| **Preceptor** | Personal de gestión (pueden ser múltiples por escuela) | Cargar asistencia de toda la gestión (1/día), subir fotos de planillas (diario), ver registros de su escuela |

### Roles que solo son registrados (asistencia tomada por otros)

| Rol | Descripción | Observación |
|---|---|---|
| **Secretario/a** | Personal administrativo de la escuela | Se registra su asistencia en el formulario masivo del director/vice/preceptor |
| **Conserje** | Personal de maestranza de la escuela | Se registra su asistencia en el formulario masivo del director/vice/preceptor |

### Rol supervisor

| Rol | Descripción | Permisos principales |
|---|---|---|
| **Supervisor Escolar** | Responsable de la supervisión jurisdiccional | Ver asistencias, novedades e incidentes de todas las escuelas, verificar asistencias, gestionar incidentes, generar reportes |

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| Routing | React Router v7 |
| Backend / BaaS | Firebase (Firestore, Auth, Storage) |
| Estilos | CSS personalizado con variables (custom properties) |
| Formateo | Prettier + ESLint |

## Entorno de ejecución

- **Dispositivos:** Computadoras de escritorio, notebooks, celulares y tablets.
- **Navegadores:** Navegadores modernos con soporte ES2023 (Chrome, Firefox, Safari, Edge).
- **Conectividad:** Se requiere conexión a internet para sincronización. El módulo de incidentes debe funcionar en condiciones de conectividad limitada.
