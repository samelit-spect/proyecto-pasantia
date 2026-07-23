# 13 - State Management

## 1. Enfoque

Para este proyecto se utiliza **React Context** como solución de state management. No se necesita Redux ni Zustand ya que el estado global es limitado (solo la sesión del usuario).

## 2. AuthContext

### 2.1 Estructura

```typescript
// src/context/AuthContext.tsx

interface AuthState {
  user: User | null;        // Usuario de Firebase Auth
  profile: UserProfile | null;  // Datos del usuario en Firestore
  isLoading: boolean;       // Estado de carga inicial
  isAuthenticated: boolean; // Si hay sesión activa
}

interface UserProfile {
  uid: string;
  nombre: string;
  email: string;
  rol: UserRole;
  escuelaId: string;
  cargo: string;
}

type UserRole = 'director' | 'vice' | 'preceptor' | 'secretario' | 'conserje' | 'supervisor';
```

### 2.2 Estado inicial

```typescript
const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,  // true hasta que se verifique la sesión
  isAuthenticated: false,
};
```

### 2.3 Funciones expuestas

| Función | Descripción |
|---|---|
| `login(email, password)` | Autentica y carga el perfil |
| `logout()` | Cierra la sesión |
| `hasRole(role)` | Verifica si el usuario tiene un rol específico |
| `canAccess(route)` | Verifica si el usuario puede acceder a una ruta |

## 3. Flujo de datos

### 3.1 Login

```
1. login(email, password)
        │
        ▼
2. Firebase Auth → retorna UserCredential
        │
        ▼
3. Firestore → usuarios/{uid} → retorna UserProfile
        │
        ▼
4. AuthContext actualiza estado:
   { user, profile, isLoading: false, isAuthenticated: true }
        │
        ▼
5. Navbar se re-renderiza con links según rol
6. Rutas protegidas permiten acceso
```

### 3.2 Refresh de sesión

```
1. App se monta
        │
        ▼
2. AuthContext → onAuthStateChanged()
        │
        ├── Si hay sesión → cargar perfil de Firestore → actualizar estado
        │
        └── Si no hay sesión → estado: { user: null, profile: null, isAuthenticated: false }
```

### 3.3 Logout

```
1. logout()
        │
        ▼
2. Firebase Auth → cierra sesión
        │
        ▼
3. AuthContext → estado: { user: null, profile: null, isAuthenticated: false }
        │
        ▼
4. Navbar se re-renderiza sin links
5. Rutas protegidas redirigen a /
```

## 4. Uso en componentes

### 4.1 Acceder al contexto

```typescript
import { useAuth } from '@/context/AuthContext';

function MiComponente() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Hola, {profile.nombre}</div>;
}
```

### 4.2 Verificar roles

```typescript
const { hasRole } = useAuth();

// Solo directores y vice pueden ver novedades
if (!hasRole('director') && !hasRole('vice')) {
  return <Navigate to="/" />;
}
```

### 4.3 Verificar acceso a ruta

```typescript
const { canAccess } = useAuth();

// Solo supervisor puede ver /supervisor
if (!canAccess('/supervisor')) {
  return <Navigate to="/" />;
}
```

## 5. Permisos por rol

| Rol | Acceso a rutas |
|---|---|
| Director | `/`, `/asistencia`, `/novedades`, `/incidentes` |
| Vice-director | `/`, `/asistencia`, `/novedades`, `/incidentes` |
| Preceptor | `/`, `/asistencia` |
| Secretario | `/` (solo lectura) |
| Conserje | `/` (solo lectura) |
| Supervisor | `/`, `/supervisor`, `/supervisor/*` |

## 6. Archivos a crear

```
src/context/
└── AuthContext.tsx        # Provider + Hook useAuth

src/hooks/custom/
└── useAuth.ts             # Re-export del hook
```
