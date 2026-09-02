# Semana 8 — Auditoría de la capa de datos y 4 correcciones

> **Período:** miércoles 2 de septiembre de 2026

**Horas acumuladas:** a completar por el pasante.

---

## Objetivo de la semana

Auditar **de punta a punta** la capa de base de datos de cara a la entrega: cotejar
cada consulta de `src/services/api/firestore.ts` contra los **índices compuestos
realmente desplegados** en producción y contra las **reglas de seguridad**, y
corregir las fallas encontradas (buscador, `fechaCreacion` de usuarios, desfase de
fecha en los gráficos de 7/30 días y un borde en el historial de estados de
incidentes). Es una auditoría **estática** (sin datos reales: el supervisor aún no
cargó las 17 escuelas).

---

## Actividades realizadas

### Miércoles 2 de septiembre

- **Auditoría de índices — verificación con la CLI real:** con
  `npx firebase firestore:indexes --project sipnam-proyecto` se listaron los índices
  compuestos **realmente desplegados** en producción y se compararon con
  `firestore.indexes.json` (coinciden exactamente):

  | Colección | Campos | Para qué consulta |
  |---|---|---|
  | `asistencias` | `escuelaId` asc + `fecha` desc | getAttendancesBySchool / subscribeToday |
  | `asistencia_docentes` | `escuelaId` asc + `fecha` desc | getDocenteAttendancesBySchool |
  | `novedades` | `escuelaId` asc + `fecha` desc | getNewsBySchool |
  | `incidentes` | `escuelaId` asc + `fecha` desc | getIncidentsBySchool |
  | `incidentes` | `estado` asc + `fecha` desc | subscribeIncidentsByStatus |
  | `fotos` | `escuelaId` asc + `fecha` asc + `createdAt` desc | fotos del día |
  | `fotos` | `escuelaId` asc + `createdAt` desc | getFotosBySchool / subscribeFotosBySchool |

- **Auditoría de las 52 funciones exportadas** de `firestore.ts`, una por una,
  contra índices y reglas. **Veredicto: NO faltan índices** — todas las
  combinaciones `where + orderBy` están cubiertas por compuestos ya desplegados;
  `getSchools()` y `getDocentesBySchool()` ordenan **en memoria** (no requieren
  compuesto). Se eliminó de la documentación la referencia a compuestos que **no
  existen** (`docentes: escuelaId+activo`, `getSchools: activa+nombre`).
- **Hallazgo #2 — Buscador global roto en silencio para no-supervisores:**
  `GlobalSearch` (botón de la Navbar visible para TODOS + atajo `Ctrl+K`) llamaba
  `getSchools()`, `getAllUsers()` y `getAllDocentes()` — queries de colección que
  las reglas **deniegan para cualquier rol distinto de supervisor** → los
  `catch` capturaban `PERMISSION_DENIED` y el panel quedaba vacío sin avisar.
  **Fix (`fd988aa`):** el buscador ahora solo está disponible para `supervisor`
  (button desktop, drawer y atajo `Ctrl+K` gateados por `isSupervisor` + guard
  `if (!open || !hasRole('supervisor')) return null;` en el componente).
- **Hallazgo #3 — `fechaCreacion` nunca se escribía:** `Profile` y
  `SupervisorUsers` leen `fechaCreacion`, pero `addUserProfile` solo escribía
  `createdAt` → los usuarios creados en producción no tenían el campo. **Fix
  (`0b9e895`):** `addUserProfile` escribe `fechaCreacion: Timestamp.now()`; se
  agregaron los helpers `asDate`/`toUserProfile` y `getUsersBySchool`/`getAllUsers`
  lo exponen con **fallback a `createdAt`** para los perfiles viejos (mismo criterio
  en `AuthContext`).
- **Hallazgo #4 — Gráficos de 7/30 días desfasados de noche:** los ejes y los
  buckets de `subscribeLast7DaysCounts`/`subscribeLast30DaysAttendance` usaban
  `toISOString().split('T')[0]` (día **UTC**), mientras `fecha` se guarda como
  medianoche local → el día "hoy" podía caer fuera del rango 21:00-23:59 (UTC-3).
  **Fix (`87d74b2`):** helper `localISODate()` (misma convención que `todayISO()`)
  aplicado al eje y a las claves de los buckets.
- **Hallazgo #5 — Borde en `updateIncidentStatus`:** `estadoAnterior` salía de
  `incidents.find(...)?.estado`, que puede ser `undefined`; hacer
  `arrayUnion({ ..., estadoAnterior: undefined })` lanza "Unsupported field value"
  en Firestore. **Fix (`3f54d64`):** la entrada de `historialEstados` se construye
  de forma condicional y **omite** `estadoAnterior` cuando no existe.
- **Verificado como correcto (sin cambios):** escrituras de incidentes/asistencias
  apiúnicamente con los campos permitidos por las reglas (`onlyChangedFields`),
  `updateUserProfile`/`setUserActive` solo llamados por el Supervisor,
  `SchoolSelect` solo en `SupervisorUsers`, `getSchoolById` para directores, y
  `addSchool` respetando las reglas de supervisor.
- **Tests nuevos (+3):** `getAllUsers` expone `fechaCreacion` (fallback a
  `createdAt`), `updateIncidentStatus` sin estado anterior omite el campo, y el
  smoke test verifica que `GlobalSearch` no se renderiza para un director.
  Ajustados: aserción de `fechaCreacion` en `addUserProfile` y la fecha local en
  el test de `subscribeLast7DaysCounts`.

**Verificación completa:** `tsc -b --noEmit` sin errores, `vitest run` →
**179/179 en verde** (eran 176), `vite build` OK (PWA v1.3.0), lint en baseline
(16 errores pre-existentes + 667 warnings prettier, sin problemas nuevos).

---

## Dificultades encontradas

- **Tres de los cuatro hallazgos eran fallas silenciosas:** el buscador vacío, el
  `PERMISSION_DENIED` tragado por un `catch` y el `fechaCreacion` ausente nunca
  mostraban error al usuario; solo la auditoría consulta-por-consulta los destapó.
- **Dividir los fixes en 4 commits limpios:** los cambios tocaban el mismo archivo
  (`firestore.ts`), así que se generaron parches por hunk
  (`C:/Users/Usuario/AppData/Local/Temp/opencode/patches/p2-p5.diff`) para
  commitear una mejora por commit sin mezclar alcances.
- **La documentación técnica estaba desalineada con producción:** una tabla crucial
  (`CONSULTAS QUE REQUIEREN ÍNDICES`) citaba compuestos que no existen y omitía los
  reales de `incidentes`/`fotos`; se corrigió con el listado verificado por CLI.

---

## Resultados y evidencias

- **Auditoría completa y documentada** de índices + reglas sobre producción real.
- **4 correcciones aplicadas**, cada una con su commit y su test:
  - `fd988aa` — `fix(ui)`: buscar (Ctrl+K) solo para supervisores
  - `0b9e895` — `fix(db)`: escribir `fechaCreacion` y normalizarla (fallback a `createdAt`)
  - `87d74b2` — `fix(db)`: gráficos de 7/30 días usan fecha local, no UTC
  - `3f54d64` — `fix(db)`: `updateIncidentStatus` omite `estadoAnterior` cuando no existe
- **Suite ampliada a 179/179 tests en verde** y build PWA OK.
- Commits de la sesión (4 + 1 de documentación): los 4 fixes + docs de la bitácora.

---

## Aprendizajes

- **Revisar contra producción, no contra la teoría:** el listado real de índices
  (`firebase firestore:indexes`) desmintió dos compuestos que la documentación daba
  por existentes; la doc debe reflejar lo desplegado.
- **Un `catch` que traga errores esconde bugs:** el mismo patrón del
  "permission-denied silencioso" de la semana 6 volvió a aparecer en el buscador.
- **Normalizar las fechas en un solo lugar:** mezclar día local (`todayISO`) con día
  UTC (`toISOString`) ya había roto formularios en la semana 7; el mismo error
  estaba en los gráficos. La convención local ahora es única.

---

## Pendientes / Próxima semana

- ⚠️ **Desplegar `firestore.rules`** a Firebase Console (foto diaria para director/vice).
- ⚠️ Esperar los **datos reales del supervisor** (17 escuelas + direcciones + 1
  supervisor) para el **seed inicial** y la prueba piloto.
- Revisar la **deuda de lint** (16 errores pre-existentes: 11 setState síncrono en
  effects + 3 `any` en pdfExport + 1 purity + 1 memoization; detalle en
  `08_tareas_pendientes.md`).
- Preparación de la entrega final (incluye pasar las semanas 7 y 8 a Word).