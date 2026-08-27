# Semana 2 — Asistencias, Historial y Reportes

> **Período:** martes 11 de agosto de 2026

**Horas acumuladas:** a completar por el pasante.

---

## Objetivo de la semana

Expandir el sistema con los módulos de **asistencia de gestión** y **asistencia de docentes**, agregar verificación de asistencias, historial, reportes CSV, fotos y endurecer las reglas de Firestore.

---

## Actividades realizadas

- **Asistencia de docentes, foto diaria y rediseño de la asistencia de gestión** (commit `9e62815`).
  - Nuevo flujo para cargar asistencia de docentes con **foto diaria**.
  - Rediseño del registro de asistencia de gestión.
- **Campos ampliados en novedades/incidentes y fotos en base64** (commit `b52b497`).
  - Se ampliaron los campos de novedades e incidentes.
  - Las **fotos se guardan en base64 comprimido directamente en Firestore** (sin Firebase Storage), para simplificar el almacenamiento.
- **Verificación de asistencias, historial, reportes CSV y reglas Firestore endurecidas** (commit `e3b0f35`).
  - Módulo de verificación y consulta de asistencias.
  - **Historial** con exportación de **reportes CSV**.
  - Reglas de seguridad de Firestore reforzadas para limitar el acceso por rol y `escuelaId`.

---

## Dificultades encontradas

- Manejo del **tamaño de las fotos** en Firestore almacenadas en base64 (se resolvió con compresión previa).
- Definición de reglas de Firestore que no rompieran las consultas filtradas por escuela (ajuste de reglas y mantenimiento de índices).

---

## Resultados y evidencias

- Asistencia de docentes con foto diaria funcional.
- Novedades e incidentes con campos ampliados y fotos.
- Historial consultable y exportable a CSV.
- 3 commits en la semana.

---

## Aprendizajes

- Almacenamiento de imágenes en Firestore como base64 comprimido.
- Escritura de reglas de seguridad de Firestore orientadas a roles.
- Exportación de datos a CSV para reportes.

---

## Pendientes / Próxima semana

- Implementar **tiempo real** (onSnapshot) en los paneles.
- Tema oscuro / apariencia.
- Home para directores y preceptores.
- Filtros, paginación y optimizaciones de rendimiento.
