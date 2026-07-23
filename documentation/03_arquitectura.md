# 03 - Arquitectura del Sistema

## 1. Arquitectura general

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Pages   │  │Components│  │ Context  │  │ Hooks  │  │
│  │          │  │          │  │          │  │        │  │
│  │ Home     │  │ Navbar   │  │ Auth     │  │ custom │  │
│  │ Asistencia│ │ Formularios│ │ Data    │  │        │  │
│  │ Novedades│  │ Tablas   │  │          │  │        │  │
│  │ Incidentes│ │ Cards    │  │          │  │        │  │
│  │ NotFound │  │          │  │          │  │        │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Services (Firebase)                  │   │
│  │  auth.ts  │  firestore.ts  │  storage.ts         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    FIREBASE (BaaS)                      │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Auth   │  │ Firestore│  │ Storage  │              │
│  │          │  │          │  │          │              │
│  │ Login    │  │ escuelas │  │ fotos    │              │
│  │ Roles    │  │ usuarios │  │ planillas│              │
│  │ Sesión   │  │ asistenc.│  │          │              │
│  │          │  │ novedades│  │          │              │
│  │          │  │ incident.│  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## 2. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework UI | React | ^19.2.7 | Librería de componentes |
| Tipado estático | TypeScript | ~6.0.2 | Seguridad y autocompletado |
| Bundler | Vite | ^8.1.1 | Desarrollo y empaquetado |
| Routing | React Router | ^7.18.1 | Navegación entre vistas |
| Autenticación | Firebase Auth | — | Login y control de acceso |
| Base de datos | Firestore | — | Almacenamiento NoSQL |
| Almacenamiento | Firebase Storage | — | Archivos (fotos de planillas) |
| Linting | ESLint | ^10.6.0 | Análisis estático del código |
| Formateo | Prettier | ^3.9.6 | Formato consistente del código |
| Estilos | CSS puro | — | Custom properties + BEM |

## 3. Estructura de carpetas

```
src/
├── main.tsx                    # Punto de entrada de la aplicación
├── App.tsx                     # (Code muerto — eliminar)
├── index.css                   # (Huerfano — no se importa)
│
├── components/                 # Componentes reutilizables
│   └── common/
│       └── Navbar/             # Barra de navegación
│
├── context/                    # React Context (global state)
│   └── (AuthContext)           # Autenticación y sesión
│
├── hooks/                      # Custom hooks
│   └── custom/                 # Lógica reutilizable
│
├── layouts/                    # Layouts de página
│   └── MainLayout/             # Layout principal con Navbar + Outlet
│
├── pages/                      # Componentes de ruta (1 por vista)
│   ├── Home/                   # Panel de inicio
│   ├── Asistencia/             # Formulario de asistencia masiva
│   ├── Novedades/              # Formulario de novedades
│   ├── Incidentes/             # Formulario de incidentes
│   ├── Supervisor/             # Vista del Supervisor
│   └── NotFound/               # Pagina 404
│
├── routes/                     # Definición de rutas
│   └── index.tsx               # createBrowserRouter
│
├── services/                   # Capa de acceso a Firebase
│   └── api/
│       ├── auth.ts             # Login, logout, sesión
│       ├── firestore.ts        # CRUD de colecciones
│       └── storage.ts          # Upload/download de archivos
│
├── styles/                     # Estilos globales
│   └── global.css              # Variables CSS y reset base
│
├── types/                      # Definiciones TypeScript
│   ├── interfaces/             # Interfaces de cada entidad
│   └── models/                 # Modelos de datos
│
└── utils/                      # Funciones auxiliares
```

## 4. Arquitectura de componentes

### 4.1 Pages (vistas principales)

| Página | Ruta | Rol requerido | Descripción |
|---|---|---|---|
| Home | `/` | Todos | Panel de inicio con acceso rápido a módulos |
| Asistencia | `/asistencia` | Director, Vice, Preceptor | Formulario masivo de asistencia |
| Novedades | `/novedades` | Director, Vice | Formulario de novedades institucionales |
| Incidentes | `/incidentes` | Director, Vice | Formulario de incidentes |
| Supervisor | `/supervisor` | Supervisor | Vista consolidada de toda la información |
| Supervisor/Asistencias | `/supervisor/asistencias` | Supervisor | Asistencias agrupadas por escuela |
| Supervisor/Novedades | `/supervisor/novedades` | Supervisor | Novedades agrupadas por escuela |
| Supervisor/Incidentes | `/supervisor/incidentes` | Supervisor | Incidentes agrupados por escuela |
| NotFound | `*` | Todos | Página de error 404 |

### 4.2 Components (reutilizables)

| Componente | Ubicación | Descripción |
|---|---|---|
| Navbar | `components/common/Navbar` | Barra de navegación con links según rol |
| SchoolSelect | `components/common/SchoolSelect` | Caja de opciones para seleccionar escuela |
| DatePicker | `components/common/DatePicker` | Selector de fecha |
| AttendanceForm | `components/forms/AttendanceForm` | Formulario masivo de asistencia |
| NewsForm | `components/forms/NewsForm` | Formulario de novedades |
| IncidentForm | `components/forms/IncidentForm` | Formulario de incidentes |
| RecordCard | `components/common/RecordCard` | Tarjeta para mostrar un registro |
| StatusBadge | `components/common/StatusBadge` | Badge de estado (en análisis, resuelto, etc.) |

### 4.3 Context

| Contexto | Propósito | Estado inicial |
|---|---|---|
| AuthContext | Manejar sesión del usuario, rol y datos del perfil | `{ user: null, role: null, school: null }` |

### 4.4 Services

| Servicio | Métodos principales | Descripción |
|---|---|---|
| `auth.ts` | `login()`, `logout()`, `onAuthStateChanged()` | Autenticación con Firebase Auth |
| `firestore.ts` | `getAttendances()`, `addAttendance()`, `getNews()`, `addNews()`, `getIncidents()`, `addIncident()`, `updateIncidentStatus()` | CRUD de Firestore |
| `storage.ts` | `uploadPhoto()`, `getPhotoUrl()` | Gestión de fotos en Firebase Storage |

## 5. Flujo de datos

### 5.1 Flujo de escritura (formulario → Firebase)

```
Usuario completa formulario
        │
        ▼
Componente (Page) captura datos
        │
        ▼
Service (firestore.ts) envía a Firestore
        │
        ▼
Firestore almacena el documento
        │
        ▼
Componente actualiza estado local
```

### 5.2 Flujo de lectura (Firebase → vista Supervisor)

```
Supervisor accede a la vista
        │
        ▼
Service (firestore.ts) consulta Firestore
        │
        ▼
Firestore retorna documentos
        │
        ▼
Componente renderiza información agrupada por escuela
```

### 5.3 Flujo de autenticación

```
Usuario ingresa credenciales
        │
        ▼
Firebase Auth valida y retorna token
        │
        ▼
AuthContext guarda sesión + rol
        │
        ▼
Navbar y rutas se adaptan según permisos
```

## 6. Servicios Firebase

### 6.1 Firebase Auth

| Funcionalidad | Descripción |
|---|---|
| Email/Password | Autenticación con correo y contraseña |
| onAuthStateChanged | Escuchar cambios de sesión |
| Custom claims | Asignar rol (director, vice, preceptor, supervisor) |
| Logout | Cerrar sesión |

### 6.2 Firestore (colecciones)

```
firestore/
├── escuelas/                  # Documentos de escuelas
│   └── {schoolId}
│       ├── nombre
│       ├── turno
│       └── ...
│
├── usuarios/                  # Perfiles de usuarios
│   └── {userId}
│       ├── nombre
│       ├── rol                # "director" | "vice" | "preceptor" | "supervisor"
│       ├── escuelaId          # Referencia a escuela
│       └── ...
│
├── asistencias/               # Registros de asistencia
│   └── {attendanceId}
│       ├── escuelaId
│       ├── fecha
│       ├── cargadoPor         # userId quien completó el formulario
│       ├── registros[]        # Array con cada integrante: {nombre, rol, presente, motivo?}
│       └── ...
│
├── novedades/                 # Novedades institucionales
│   └── {newsId}
│       ├── escuelaId
│       ├── fecha
│       ├── descripcion
│       ├── cargadoPor
│       └── ...
│
└── incidentes/                # Incidentes institucionales
    └── {incidentId}
        ├── escuelaId
        ├── fecha
        ├── descripcion
        ├── estado             # "en_analisis" | "en_gestion" | "resuelto" | "pendiente"
        ├── cargadoPor
        └── ...
```

### 6.3 Firebase Storage

| Ruta | Contenido |
|---|---|
| `fotos/{schoolId}/{fecha}/` | Fotos de planillas firmadas de asistencia |

## 7. Modelo de autenticación y roles

### 7.1 Roles y permisos

| Rol | Puede cargar asistencia | Puede registrar novedades | Puede registrar incidentes | Puede ver vista Supervisor |
|---|---|---|---|---|
| Director | Sí (1/día, toda la gestión) | Sí | Sí | No |
| Vice-director | Sí (1/día, toda la gestión) | Sí | Sí | No |
| Preceptor | Sí (1/día, toda la gestión) | No | No | No |
| Secretario | No | No | No | No |
| Conserje | No | No | No | No |
| Supervisor | No | No | No | Sí (todas las escuelas) |

### 7.2 Flujo de login

1. Usuario ingresa email y contraseña.
2. Firebase Auth valida las credenciales.
3. Se consulta Firestore para obtener el rol y la escuela del usuario.
4. Se guarda la información en `AuthContext`.
5. Las rutas y el Navbar se adaptan según el rol.

## 8. Enrutamiento

### 8.1 Árbol de rutas

```
/ (MainLayout)
├── / (Home)
├── /asistencia (Asistencia)         → Director, Vice, Preceptor
├── /novedades (Novedades)           → Director, Vice
├── /incidentes (Incidentes)         → Director, Vice
└── /supervisor (SupervisorLayout)
    ├── /supervisor (Dashboard)
    ├── /supervisor/asistencias
    ├── /supervisor/novedades
    └── /supervisor/incidentes

* (NotFound)                         → Sin layout
```

### 8.2 Protección de rutas

Las rutas protegidas deben verificar el rol del usuario antes de renderizar el componente. Si el usuario no tiene permisos, se redirige a `/` o se muestra un mensaje de acceso denegado.

## 9. Estrategia de estilos

### 9.1 Enfoque

- **CSS puro** con custom properties para theming.
- **BEM-like naming** para evitar conflictos de clases.
- **Co-located CSS:** cada componente tiene su archivo CSS en la misma carpeta.
- **Un solo archivo global** (`styles/global.css`) con variables y reset base.

### 9.2 Variables CSS definidas

```css
:root {
  --primary-color: #1e40af;     /* Azul institucional */
  --primary-light: #3b82f6;     /* Azul claro (hover) */
  --secondary-color: #16a34a;   /* Verde (éxito) */
  --secondary-light: #22c55e;   /* Verde claro (hover) */
  --background-color: #f8fafc;  /* Fondo gris claro */
  --surface-color: #ffffff;     /* Blanco (cards, forms) */
  --text-color: #1e293b;        /* Texto principal */
  --text-secondary: #64748b;    /* Texto secundario */
  --border-color: #e2e8f0;      /* Bordes */
}
```

### 9.3 Responsive

- Mobile-first approach.
- Breakpoints estándar:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
