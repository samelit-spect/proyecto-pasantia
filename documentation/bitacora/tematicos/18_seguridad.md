# 18 - Seguridad

> Este documento de la bitácora recopila las **medidas de seguridad** del proyecto: autenticación, permisos por rol, reglas de Firestore y protección del acceso.

---

## 1. Capas de seguridad

| Capa | Descripción |
|---|---|
| **Autenticación** | Firebase Auth (email/contraseña), sesión gestionada en `AuthContext` |
| **Autorización** | Permisos por rol y por escuela (`hasRole`, `canAccess`) |
| **Reglas de Firestore** | Reglas de backend que validan cada lectura/escritura |
| **Cierre de sesión por inactividad** | Protege el acceso en dispositivos compartidos |
| **Validación de entrada** | Zod + validación de imágenes (límites de tamaño) |

---

## 2. Autenticación y sesión

- Login con **email/contraseña** (se verifica el perfil en la colección `usuarios`).
- El `AuthContext` mantiene el estado de sesión y expone `user`, `profile`, `isAuthenticated`.
- **Cierre de sesión por inactividad** para el rol **director** (10 min) — protege equipos compartidos en las escuelas. El **supervisor** no tiene timeout.
- Los errores de autenticación se traducen a mensajes amigables sin exponer detalles técnicos (ver Manejo de Errores).

---

## 3. Autorización por rol

- Cada pantalla comprueba el rol del usuario antes de mostrar información sensible (`hasRole`, `canAccess` en `AuthContext`).
- El **supervisor** tiene acceso total; los roles de escuela (director, vice, preceptor) solo ven y operan sobre **su propia `escuelaId`**.
- `secretario` y `conserje` solo quedan registrados en la asistencia (no acceden a la app).

---

## 4. Reglas de Firestore (firestore.rules)

Las reglas se aplican en el **backend** (no confían solo en la UI):

### Funciones auxiliares
- `isSignedIn` / `hasProfile`: exige sesión y perfil en `usuarios/{uid}`.
- `isSupervisor()`: rol `supervisor`.
- `userBelongsToSchool(schoolId)`: el usuario pertenece a esa escuela.
- `canSeeSchool(schoolId)`: supervisor **o** pertenece a la escuela.
- `onlyChangedFields(fields)`: restringe qué campos puede modificar una actualización.

### Resumen por colección

| Colección | Crear | Leer | Actualizar | Eliminar |
|---|---|---|---|---|
| `escuelas` | Supervisor | Ver por escuela | Supervisor | Supervisor |
| `usuarios` | Supervisor | Ver según rol | Propio (solo nombre/email) o Supervisor | Supervisor |
| `asistencias` | director/vice/preceptor de su escuela | Ver por escuela | Supervisor (solo `verificada`...) | ❌ |
| `asistencia_docentes` | director/vice/preceptor de su escuela | Ver por escuela | Supervisor (solo `verificada`...) | ❌ |
| `fotos` | preceptor de su escuela | Ver por escuela | ❌ | Supervisor o propietario de la foto |
| `novedades` | director/vice | Ver por escuela | ❌ | ❌ |
| `incidentes` | director/vice | Ver por escuela | Supervisor (solo `estado`/`updatedAt`/`historialEstados`) | ❌ |
| `docentes` | Supervisor | Ver por escuela | Supervisor | Supervisor |

**Principios clave:**
- **No-supervisores solo leen su propia escuela** (`canSeeSchoolData`).
- En creaciones, se fuerza que `cargadoPor == request.auth.uid` y que la escuela coincida con la del usuario (evita suplantación).
- Las **actualizaciones** solo permiten cambiar campos específicos (`onlyChangedFields`) — ej. el supervisor no puede reescribir toda la asistencia, solo marcarla verificada; el autor no puede editar incidentes/novedades.
- **Eliminaciones** de registros de asistencia/incidentes/novedades están **prohibidas** (auditoría); las fotos solo las borra el autor o el supervisor.

---

## 5. Validación de entrada

- **Zod** valida cada formulario (mensajes claros y reglas tipadas) — ver Validación de Formularios.
- **Imágenes** (`src/utils/image.ts`): se validan tipo y tamaño (máx 20 MB) **antes** de procesar, y se comprimen a ≤900 KB (data URL) para no exceder el límite de 1 MB de Firestore; evita abusos de tamaño.

---

## 6. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Autenticación y sesión en `AuthContext` | Semana 1 | ~4 h |
| Permisos por rol (`hasRole`/`canAccess`) | Semanas 1-2 | ~2 h |
| Cierre de sesión por inactividad (director) | Semana 3 | ~2 h |
| Reglas de Firestore por colección | Semana 2 | ~6 h |
| Validación de imágenes (tipo/tamaño) | Semana 5 | ~2 h |
| **Total aproximado** | - | **~1.5-2 días** |

---

## 7. Pendientes y observaciones

- Verificar las reglas con el **emulador de Firestore** ante casos límite (campos extra, IDs).
- Considerar **verificación de email** al crear usuarios.
- Revisar que `usuario.email` no sea editable en demasía y evaluar `firestore.indexes.json` para consultas.
