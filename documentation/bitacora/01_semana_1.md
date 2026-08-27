# Semana 1 — Instalación, Configuración y MVP

> **Período:** miércoles 23 y jueves 24 de julio de 2026

**Horas acumuladas:** a completar por el pasante.

---

## Objetivo de la semana

Poner en marcha el proyecto desde cero: instalar y configurar el stack, crear la documentación base, e implementar un **MVP funcional** con autenticación, tipos, servicios de datos y el panel del Supervisor.

---

## Actividades realizadas

### Miércoles 23 de julio

- **Instalación y configuración inicial del proyecto** (React + TypeScript + Vite).
  - Se instalaron todas las dependencias: react-router-dom, firebase, react-hook-form, zod, recharts, jspdf, lucide-react, motion, vitest, testing-library.
- **Documentación inicial del proyecto** (contexto, requerimientos, arquitectura, base de datos, API, diseño UI, setup Firebase, etc.).
- **Setup inicial completo** en el repositorio.

### Jueves 24 de julio

- **Implementación del MVP:**
  - Tipos de datos, servicios y componentes comunes y formularios (commit `c0f267e`).
  - **Panel del Supervisor completo** con sub-vistas, tabs y rutas anidadas (commit `e0d0410`).
  - Corrección de bugs críticos y warnings del análisis de código.
  - **Rediseño del panel Supervisor:** listado de escuelas + vista por escuela.
  - Sección **Usuarios** en el detalle de escuela, con contador y meta de cada usuario.
  - **Formulario para crear escuelas** desde el panel del Supervisor + `addSchool` en firestore.
  - Resumen en el **home del Supervisor:** 3 cajas (asistencias, novedades, incidentes recientes), estadísticas del día, acciones rápidas y actividad reciente.
  - Links "Gestionar Escuelas" y "Configuración de Usuarios" en el menú del Supervisor.
  - Actualización del documento de tareas pendientes.

---

## Dificultades encontradas

- Falta de un **índice compuesto** en Firestore (`orderBy` en `getSchools`). Se resolvió quitando el `orderBy` y ordenando en el cliente.
- Import CSS roto en `SupervisorSchoolDetail` tras reorganizar componentes; se corrigió el import.

---

## Resultados y evidencias

- Proyecto corriendo localmente en `http://localhost:5173`.
- Panel de Supervisor funcional: listado de escuelas, detalle por escuela, usuarios y creación de escuelas.
- 16 commits realizados en la semana (instalación, documentación y MVP).

---

## Aprendizajes

- Configuración de Firebase (Auth + Firestore) y reglas de acceso por rol.
- Uso de React Router v7 con rutas protegidas y anidadas.
- Diseño de componentes reutilizables y organización por carpetas.

---

## Pendientes / Próxima semana

- Verificación de asistencias, historial y reportes.
- Módulos de asistencia de gestión y de docentes.
- Campos ampliados en novedades/incidentes y fotos.
