# 06 - API y Servicios

## 1. Consideraciones generales

Este proyecto no utiliza una API REST tradicional. La comunicación con el backend se realiza directamente mediante los SDK de Firebase en el frontend.

Todas las interacciones con Firebase están encapsuladas en la capa de servicios ubicada en `src/services/api/`:

```
src/services/api/
├── auth.ts         # Autenticación
└── firestore.ts    # Base de datos (incluye fotos como base64)
```

## 2. Servicio de Autenticación (`auth.ts`)

### 2.1 Funciones

| Función | Parámetros | Retorna | Descripción |
|---|---|---|---|
| `login` | `email: string, password: string` | `Promise<UserCredential>` | Autentica al usuario con email y contraseña |
| `logout` | — | `Promise<void>` | Cierra la sesión actual |
| `getCurrentUser` | — | `User \| null` | Retorna el usuario autenticado actualmente |
| `onAuthStateChanged` | `callback: (user: User \| null) => void` | `Unsubscribe` | Escucha cambios en el estado de autenticación |

### 2.2 Flujo de login

```
1. login(email, password)
        │
        ▼
2. Firebase Auth valida credenciales
        │
        ▼
3. Retorna UserCredential (uid, email)
        │
        ▼
4. Consultar Firestore → usuarios/{uid} → obtener rol y escuelaId
        │
        ▼
5. Guardar en AuthContext: { uid, email, rol, escuelaId, nombre }
        │
        ▼
6. Redirigir según rol:
   - Director/Vice/Preceptor → /asistencia
   - Supervisor → /supervisor
```

## 3. Servicio de Firestore (`firestore.ts`)

### 3.1 Escuelas

| Función | Parámetros | Retorna | Descripción |
|---|---|---|---|
| `getSchools` | — | `Promise<School[]>` | Obtiene todas las escuelas activas |
| `getSchoolById` | `schoolId: string` | `Promise<School \| null>` | Obtiene una escuela por su ID |

**Interface `School`:**
```typescript
interface School {
  id: string;
  nombre: string;
  turno: string;
  direccion?: string;
  activa: boolean;
}
```

### 3.2 Asistencias

| Función | Parámetros | Retorna | Descripción |
|---|---|---|---|
| `addAttendance` | `data: AddAttendanceDTO` | `Promise<string>` | Registra un nuevo formulario de asistencia (retorna el ID) |
| `getAttendancesBySchool` | `schoolId: string, startDate: Date, endDate: Date` | `Promise<Attendance[]>` | Obtiene asistencias de una escuela en un rango de fechas |
| `getAttendancesByDate` | `date: Date` | `Promise<Attendance[]>` | Obtiene todas las asistencias de una fecha específica |

**Interface `Attendance`:**
```typescript
interface Attendance {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  cargadoPor: string;
  cargadoPorNombre: string;
  registros: AttendanceRecord[];
  createdAt: Timestamp;
}

interface AttendanceRecord {
  nombre: string;
  cargo: string;
  presente: boolean;
  motivo?: string;
}
```

**DTO de creación:**
```typescript
interface AddAttendanceDTO {
  escuelaId: string;
  fecha: Date;
  cargadoPor: string;
  cargadoPorNombre: string;
  registros: AttendanceRecord[];
}
```

### 3.3 Novedades

| Función | Parámetros | Retorna | Descripción |
|---|---|---|---|
| `addNews` | `data: AddNewsDTO` | `Promise<string>` | Registra una nueva novedad (retorna el ID) |
| `getNewsBySchool` | `schoolId: string, startDate: Date, endDate: Date` | `Promise<News[]>` | Obtiene novedades de una escuela en un rango de fechas |
| `getNewsByDate` | `date: Date` | `Promise<News[]>` | Obtiene todas las novedades de una fecha específica |

**Interface `News`:**
```typescript
interface News {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
  createdAt: Timestamp;
}
```

**DTO de creación:**
```typescript
interface AddNewsDTO {
  escuelaId: string;
  fecha: Date;
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
}
```

### 3.4 Incidentes

| Función | Parámetros | Retorna | Descripción |
|---|---|---|---|
| `addIncident` | `data: AddIncidentDTO` | `Promise<string>` | Registra un nuevo incidente (retorna el ID) |
| `getIncidentsBySchool` | `schoolId: string` | `Promise<Incident[]>` | Obtiene todos los incidentes de una escuela |
| `getIncidentsByStatus` | `status: IncidentStatus` | `Promise<Incident[]>` | Obtiene incidentes filtrados por estado |
| `getAllIncidents` | — | `Promise<Incident[]>` | Obtiene todos los incidentes (vista Supervisor) |
| `updateIncidentStatus` | `incidentId: string, newStatus: IncidentStatus` | `Promise<void>` | Actualiza el estado de un incidente |

**Interface `Incident`:**
```typescript
type IncidentStatus = 'pendiente' | 'en_analisis' | 'en_gestion' | 'resuelto';

interface Incident {
  id: string;
  escuelaId: string;
  fecha: Timestamp;
  descripcion: string;
  estado: IncidentStatus;
  cargadoPor: string;
  cargadoPorNombre: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

**DTO de creación:**
```typescript
interface AddIncidentDTO {
  escuelaId: string;
  fecha: Date;
  descripcion: string;
  cargadoPor: string;
  cargadoPorNombre: string;
}
```

## 4. Utilidad de imágenes (`src/utils/image.ts`)

### 4.1 Función

| Función | Parámetros | Retorna | Descripción |
|---|---|---|---|
| `fileToCompressedDataUrl` | `file: File, maxSize?, quality?` | `Promise<string>` | Comprime la imagen en el navegador (canvas, JPEG) y retorna un data URL base64 |

> Las imágenes se guardan como base64 dentro de Firestore (colección `fotos` o campo `fotoDataUrl` del incidente), sin usar Firebase Storage. Límite por documento: 1 MiB.

## 5. Flujo de datos en la aplicación

### 5.1 Flujo de escritura (formulario → Firebase)

```
Componente (Page)
    │
    │  usuario completa formulario
    ▼
handleSubmit()
    │
    │  llama al service
    ▼
firestore.ts → addAttendance() / addNews() / addIncident()
    │
    │  envía a Firestore
    ▼
Firestore almacena el documento
    │
    │  retorna ID
    ▼
Componente muestra mensaje de éxito
```

### 5.2 Flujo de lectura (Firebase → vista)

```
Componente (Page)
    │
    │  se monta o cambia filtro
    ▼
useEffect → llama al service
    │
    ▼
firestore.ts → getAttendancesBySchool() / getNewsBySchool() / getAllIncidents()
    │
    │  consulta Firestore
    ▼
Firestore retorna documentos
    │
    │  mapea a interfaces
    ▼
Componente actualiza estado → renderiza
```

### 5.3 Flujo de autenticación (global)

```
App.tsx se monta
    │
    ▼
AuthContext → onAuthStateChanged()
    │
    │  escucha cambios
    ▼
Usuario inicia sesión → AuthContext actualiza estado
    │
    │  Navbar y rutas se adaptan
    ▼
Navbar muestra links según rol
Rutas protegidas verifican permisos
```
