# 03 - Autenticación

> Este documento de la bitácora recopila todo lo relacionado con la **autenticación del sistema**: cómo funciona, el porqué de las decisiones, el flujo de inicio de sesión, los roles y permisos, la creación de usuarios, el manejo de errores y la expiración de sesión.

---

## 1. Tecnología elegida y por qué

Se utiliza **Firebase Authentication** con el método **email + contraseña**.

### Por qué Firebase Auth

- **Ya integrado con Firestore:** comparten el mismo ecosistema de Firebase, por lo que el usuario autenticado se asocia directamente con su perfil y sus datos en la base de datos.
- **Seguridad gestionada:** el hash de contraseñas, el control de intentos y la infraestructura de autenticación la maneja Firebase, sin implementar nada de eso desde cero.
- **Sesión persistente:** Firebase mantiene la sesión del usuario incluso al recargar la página, de forma transparente.
- **Reglas de Firestore:** las reglas de seguridad validan `request.auth` y el rol/perfil del usuario, así la autenticación y la autorización van de la mano.

### Por qué email + contraseña

- Los usuarios del sistema son **cargados por el Supervisor** (no se registran por su cuenta), por lo que el alta con email y contraseña gestionada es el método más simple y controlado.

---

## 2. Cómo está organizada la autenticación

### 2.1. Inicialización de Firebase (`src/services/firebase.ts`)

- Se crea la app con `initializeApp(firebaseConfig)`.
- La configuración proviene de variables de entorno (`.env`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
- `auth = getAuth(app)` — instancia de autenticación.
- `db = initializeFirestore(...)` con caché local persistente y soporte multi-pestaña (permite offline y que varias pestañas compartan datos).

### 2.2. Estado global de autenticación (`src/context/AuthContext.tsx`)

Un **Context de React** centraliza el estado de autenticación y lo exponen todos los componentes:

| Valor | Descripción |
|---|---|
| `user` | Objeto `User` de Firebase (si hay sesión) |
| `profile` | Perfil del usuario desde Firestore (`usuarios/{uid}`) |
| `isLoading` | Si está cargando el estado inicial |
| `isAuthenticated` | Si hay sesión activa |
| `login(email, password)` | Inicia sesión |
| `logout()` | Cierra sesión |
| `hasRole(...roles)` | Comprueba si el usuario tiene alguno de esos roles |
| `canAccess(route)` | Valida si el usuario puede acceder a una ruta |

### 2.3. Flujo de inicio de sesión (`login`)

1. El usuario envía email y contraseña desde `Login.tsx`.
2. `signInWithEmailAndPassword(auth, email, password)` valida las credenciales en Firebase.
3. Se **espera a cargar el perfil** desde Firestore (`usuarios/{uid}`) antes de resolver el login. Esto evita una condición de carrera en la que la app redirigía antes de tener el perfil (provocaba doble login / errores).
4. Se actualiza el estado: usuario, perfil, `isAuthenticated = true`.
5. La vista navega a la ruta principal.

### 2.4. Restauración de sesión (`onAuthStateChanged`)

- Al cargar la app, `onAuthStateChanged` detecta si hay una sesión guardada de Firebase y **restaura el estado automáticamente** (recarga de página no desconecta al usuario).
- Si hay usuario autenticado pero **no existe su perfil** en Firestore, se muestra una advertencia (un usuario puede tener cuenta en Auth pero faltar su documento en `usuarios`).

### 2.5. Cierre de sesión (`logout`)

- `signOut(auth)` termina la sesión en Firebase y el estado vuelve a `isAuthenticated = false`.
- El usuario es redirigido al login.

---

## 3. Roles y permisos

### 3.1. Roles del sistema

```
director | vice | preceptor | secretario | conserje | supervisor
```

### 3.2. Permisos por ruta (`ROUTE_PERMISSIONS`)

| Ruta | Roles permitidos |
|---|---|
| `/` (Home) | director, vice, preceptor, secretario, conserje, supervisor |
| `/asistencia` | director, vice, preceptor |
| `/asistencia-docentes` | director, vice, preceptor |
| `/historial` | director, vice, preceptor |
| `/fotos` | preceptor |
| `/novedades` | director, vice |
| `/incidentes` | director, vice |
| `/supervisor` | supervisor |

`canAccess()` busca la coincidencia más larga de la ruta y verifica que el rol del usuario esté permitido. El **Supervisor** tiene acceso total y administra las escuelas, mientras que director/vice/preceptor acceden solo a los módulos de su escuela.

---

## 4. Creación de usuarios (Supervisor)

Los usuarios no se registran solos: **el Supervisor los crea** desde el panel de usuarios.

### 4.1. El problema con Firebase Auth

Existe el problema de que `createUserWithEmailAndPassword` **inicia sesión automáticamente** con el usuario recién creado. Si el Supervisor lo creara con la instancia de Auth principal, su sesión se vería reemplazada por la del usuario nuevo.

### 4.2. La solución: segunda app de Auth aislada

En `src/services/api/auth.ts` se crea una **segunda aplicación de Firebase** (`admin-user-creation`) con autenticación de **persistencia en memoria**:

```ts
const adminApp = initializeApp(firebaseConfig, 'admin-user-creation');
const adminAuth = initializeAuth(adminApp, { persistence: inMemoryPersistence });
```

- `createUserAccount(email, password)` crea el usuario en esa instancia aislada, captura su `uid` y **cierra la sesión temporal** al finalizar.
- Así la sesión del Supervisor en el Auth principal **queda intacta**.
- El `uid` obtenido se usa para crear el perfil del usuario en Firestore (`usuarios/{uid}`).

### 4.3. Restablecimiento de contraseña

- `sendPasswordReset(email)` envía un correo de restablecimiento de contraseña usando la instancia aislada (sin alterar la sesión del Supervisor).
- Está disponible desde el panel del Supervisor (para usuarios) y desde el perfil del usuario logueado.

---

## 5. Manejo de errores de autenticación

`src/utils/authErrors.ts` mapea los códigos de error de Firebase a **mensajes amigables en español**:

| Código Firebase | Mensaje mostrado |
|---|---|
| `auth/user-not-found` | No existe una cuenta con ese email. |
| `auth/wrong-password` | La contraseña es incorrecta. |
| `auth/invalid-email` | El email no es válido. |
| `auth/user-disabled` | Esta cuenta fue desactivada. |
| `auth/too-many-requests` | Demasiados intentos. Esperá unos minutos. |
| `auth/network-request-failed` | Error de conexión. Revisá tu internet. |
| `auth/invalid-credential` | Email o contraseña incorrectos. |
| `auth/email-already-in-use` | Ya existe una cuenta con ese email. |
| `auth/weak-password` | La contraseña debe tener al menos 6 caracteres. |
| `auth/operation-not-allowed` | Este método de inicio de sesión no está habilitado. |

Cualquier otro error se muestra de forma genérica, evitando exponer detalles técnicos al usuario final.

---

## 6. Expiración de sesión por inactividad

Se implementó un **cierre de sesión automático por inactividad** en `AuthContext.tsx`:

- **Solo aplica al rol `director`:** tras **10 minutos sin actividad** (mouse, teclado, toque, scroll o clic) se cierra la sesión.
- **El Supervisor mantiene la sesión abierta:** pensado para que permanezca logueado en el panel de supervisión.
- El temporizador se **reinicia en cada actividad** del usuario y se limpia correctamente al desmontar el efecto.

Esto responde a un requerimiento de seguridad: la sesión del director no debe quedar abierta indefinidamente en una computadora compartida.

---

## 7. Verificación y validación

- Cada cambio en la autenticación se validó con: `npx tsc -b --noEmit`, `npm run lint` y `npm run test`.
- Existen **tests de Login** que cubren el flujo de inicio de sesión, el spinner de carga y los mensajes de error.

---

## 8. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Configuración inicial de Firebase Auth (email/password) y `.env` | Semana 1 | ~1 h |
| Estado global de autenticación (`AuthContext` con login/logout/perfil) | Semana 1 | ~4 h |
| Carga del perfil desde Firestore y asociación usuario-perfil | Semana 1 | ~2 h |
| Roles y permisos por ruta (`ROUTE_PERMISSIONS`, `canAccess`) | Semana 1 | ~2-3 h |
| Pantalla de Login (MVP) | Semana 1 | ~3 h |
| Mapeo de errores Firebase a mensajes amigables | Semana 3 | ~1-2 h |
| Corrección de condición de carrera en el login (doble login) | Semana 3 | ~2 h |
| Editar usuarios y restablecer contraseña desde el Supervisor | Semana 3 | ~3 h |
| Creación de usuarios con segunda app de Auth aislada | Semanas 3-5 | ~2 h |
| Carga del perfil vía `onAuthStateChanged` y advertencias de perfil faltante | Semana 5 | ~2 h |
| Cierre de sesión por inactividad (rol director) | Semana 5 | ~1-2 h |
| Login responsive (split-screen escritorio, full-screen móvil) | Semana 5 | ~1 día |
| **Total aproximado** | - | **~4 días** |

---

## 9. Pendientes y observaciones

- Revisar la política de expiración de contraseñas si se requiere a futuro.
- Evaluar agregar **autenticación de dos factores** o validación por correo institucional si el ámbito lo requiere.
- Mantener sincronizados los permisos de rutas con las reglas de Firestore.
