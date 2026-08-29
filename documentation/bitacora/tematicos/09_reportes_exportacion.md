# 09 - Reportes y Exportación

> Este documento de la bitácora recopila el **sistema de reportes y exportación** de datos del proyecto: exportaciones a **CSV**, a **PDF** y el **respaldo jurisdiccional** del Supervisor.

---

## 1. Por qué

- El Supervisor y las escuelas necesitan **reportes** de las cargas (asistencias, novedades, incidentes) para control, seguimiento y presentaciones.
- Se exportan datos de forma **portable** (CSV abre en Excel; PDF es imprimible/compartible).

---

## 2. Exportación a CSV (`src/utils/exportCsv.ts`)

Función genérica para descargar cualquier dataset como CSV.

### `downloadCsv(filename, headers, rows)`

- Recibe un nombre de archivo, los encabezados y las filas.
- **Escapa correctamente** valores con comas, comillas, saltos de línea o punto y coma.
- Agrega **BOM UTF-8** (`\uFEFF`) para que Excel interprete bien los acentos.
- Genera un `Blob` y lo descarga con un enlace temporal (`URL.createObjectURL` + `link.click()`, `link.rel="noopener"`).
- **Compatibilidad móvil/PWA:** la URL del blob se revoca **4 s después** (`setTimeout`) y el ancla se remueve también al finalizar la descarga. Revocarla en forma síncrona justo tras `click()` cancela la descarga en iOS/Safari cuando el click ocurre fuera del gesto de usuario (por ej. después de un `await` de Firestore).

**Uso:** exportar asistencias, novedades, incidentes e historial a Excel-compatible.

---

## 3. Exportación a PDF (`src/utils/pdfExport.ts`)

Usa **jsPDF** + **jspdf-autotable** para generar reportes profesionales.

### `exportHistorialPDF(data)`

- Recibe asistencias, asistencias de docentes, novedades e incidentes (y rango de fechas opcional).
- **Encabezado:** logo/título "SIPNAM", subtítulo del sistema, título del reporte y filtros aplicados (desde/hasta).
- **Tablas:** usa `autoTable` para renderizar cada sección (asistencias, docentes, novedades, incidentes) con sus columnas.
- **Pie de página:** "SIPNAM - Exportado {fecha} - Página X/Y" en cada página.
- Convierte los valores enum a etiquetas legibles (tipo de novedad, categoría/urgencia de incidente) con los helpers de `constants.ts`.

---

## 4. Respaldo jurisdiccional del Supervisor (`src/utils/exportAll.ts`)

Permite al Supervisor **descargar todos los datos de la jurisdicción** (todas las escuelas) en CSV, en las colecciones correspondientes.

- `exportAll` (con `ExportAllOptions`):
  - Opcionalmente filtra por rango de fechas (`dateFrom`/`dateTo`).
  - **Reporta progreso** vía `onProgress` (current/total/label) para mostrar una barra de avance en la UI.
  - Genera un CSV por cada tipo de dato: asistencias, asistencias de docentes, novedades e incidentes, con detalle (ej. cada asistencia expande sus registros como "Nombre (P)" o "Nombre (A: motivo)").

### Tarjeta de respaldo de datos

- En el panel del Supervisor hay una **tarjeta de respaldo de datos** que usa `exportAll` para exportar a nivel jurisdicción.
- Complementa el **banner de advertencia de purga de datos a fin de año**, recordando al Supervisor respaldar antes de esa fecha.

---

## 5. Impresión amigable

- Se agregaron **estilos específicos de impresión** (`@media print`) para que al imprimir/guardar como PDF desde el navegador, la salida sea limpia (sin ocultar elementos de UI como barra de navegación, botones, etc.).

---

## 6. Dónde se usan

| Función | Ubicación |
|---|---|
| `downloadCsv` | Historial y panel del Supervisor (CSV) |
| `exportHistorialPDF` | Historial (exportar a PDF) |
| `exportAll` | Panel del Supervisor (respaldo jurisdiccional) |

---

## 7. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Exportación CSV (`downloadCsv`) con escape y BOM | Semana 2 | ~2-3 h |
| Exportación de historial a PDF (jsPDF + autoTable) | Semana 4 | ~4-5 h |
| Respaldo jurisdiccional (`exportAll`) con progreso | Semana 4 | ~4 h |
| Tarjeta de respaldo de datos y banner de purga | Semana 4 | ~2-3 h |
| Estilos de impresión (`@media print`) | Semana 5 | ~2 h |
| **Total aproximado** | - | **~2 días** |

---

## 8. Pendientes y observaciones

- Verificar el tamaño de PDFs muy grandes (muchas filas).
- Considerar exportar también **fotos** o generar un reporte consolidado por escuela.
- Evaluar exportación a Excel nativo (`.xlsx`) si se requiere más formato.
