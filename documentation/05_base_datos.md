# 05 - Base de Datos

## 1. Tecnología

**Firestore** — Base de datos NoSQL en la nube de Firebase.
- Modelo de documentos y colecciones.
- Consultas por campos, rangos de fechas y subcolecciones.
- Soporte para offline (escritura local + sincronización automática).

## 2. Colecciones

```
firestore/
├── escuelas/                  # Una documento por escuela
├── usuarios/                  # Un documento por usuario
├── docentes/                  # Un documento por docente (cargados por el Supervisor)
├── asistencias/               # Un documento por cada carga de formulario (gestión)
├── asistencia_docentes/       # Un documento por cada carga de asistencia de docentes
├── novedades/                 # Un documento por cada novedad registrada
├── incidentes/                # Un documento por cada incidente registrado
└── fotos/                     # Un documento por cada foto subida de planilla
```

## 3. Estructura de documentos

### 3.1 `escuelas/{schoolId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `nombre` | string | Nombre de la escuela | Sí |
| `turno` | string | Turno (mañana, tarde, noche) | Sí |
| `direccion` | string | Dirección de la escuela | No |
| `activa` | boolean | Si la escuela está activa en el sistema | Sí |

**Ejemplo:**
```json
{
  "nombre": "Escuela N° 123",
  "turno": "mañana",
  "direccion": "Calle Falsa 123",
  "activa": true
}
```

### 3.2 `usuarios/{userId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `nombre` | string | Nombre completo del usuario | Sí |
| `email` | string | Correo electrónico (usado para login) | Sí |
| `rol` | string | Rol del usuario en el sistema | Sí |
| `escuelaId` | string | Referencia al documento de escuela | Sí |
| `cargo` | string | Cargo específico (director, vice, preceptor, secretario, conserje) | Sí |
| `activo` | boolean | Si el usuario está activo (ausente = inactivo; se asume `true` si falta) | Sí |
| `createdAt` | timestamp | Fecha de creación del usuario | Sí |

**Valores permitidos para `rol`:**
- `"director"`
- `"vice"`
- `"preceptor"`
- `"secretario"`
- `"conserje"`
- `"supervisor"`

**Ejemplo:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@escuela123.edu.ar",
  "rol": "director",
  "escuelaId": "abc123",
  "cargo": "director",
  "activo": true,
  "createdAt": "2026-07-23T08:00:00Z"
}
```

### 3.3 `asistencias/{attendanceId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia al documento de escuela | Sí |
| `fecha` | timestamp | Fecha del registro de asistencia | Sí |
| `cargadoPor` | string | UID del usuario que completó el formulario | Sí |
| `cargadoPorNombre` | string | Nombre del usuario que cargó (para vista) | Sí |
| `registros` | array | Array con la asistencia de cada integrante | Sí |
| `createdAt` | timestamp | Fecha de creación del documento | Sí |

**Estructura de cada elemento en `registros[]`:**

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `nombre` | string | Nombre del integrante | Sí |
| `cargo` | string | Cargo del integrante | Sí |
| `presente` | boolean | `true` = presente, `false` = ausente | Sí |
| `motivo` | string | Motivo de ausencia (solo si `presente = false`) | No |

**Ejemplo:**
```json
{
  "escuelaId": "abc123",
  "fecha": "2026-07-23T00:00:00Z",
  "cargadoPor": "user123",
  "cargadoPorNombre": "Juan Pérez",
  "registros": [
    { "nombre": "Juan Pérez", "cargo": "director", "presente": true },
    { "nombre": "María López", "cargo": "vice", "presente": true },
    { "nombre": "Carlos García", "cargo": "preceptor", "presente": false, "motivo": "Enfermedad" },
    { "nombre": "Ana Martínez", "cargo": "secretario", "presente": true },
    { "nombre": "Pedro Ruiz", "cargo": "conserje", "presente": true }
  ],
  "createdAt": "2026-07-23T08:30:00Z"
}
```

### 3.4 `novedades/{newsId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia al documento de escuela | Sí |
| `fecha` | timestamp | Fecha de la novedad | Sí |
| `tipo` | string | Tipo de novedad: `acto`, `actividad`, `suspension`, `evento`, `otro` | Sí |
| `hora` | string | Hora de la actividad (formato `HH:MM`) | No |
| `descripcion` | string | Descripción de la novedad | Sí |
| `cargadoPor` | string | UID del usuario que registró la novedad | Sí |
| `cargadoPorNombre` | string | Nombre del usuario que cargó | Sí |
| `createdAt` | timestamp | Fecha de creación del documento | Sí |

**Ejemplo:**
```json
{
  "escuelaId": "abc123",
  "fecha": "2026-07-23T00:00:00Z",
  "tipo": "acto",
  "hora": "10:00",
  "descripcion": "Se realizó el acto de inauguración del nuevo espacio de informática.",
  "cargadoPor": "user123",
  "cargadoPorNombre": "Juan Pérez",
  "createdAt": "2026-07-23T09:00:00Z"
}
```

### 3.5 `incidentes/{incidentId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia al documento de escuela | Sí |
| `fecha` | timestamp | Fecha del incidente | Sí |
| `categoria` | string | Categoría: `rotura`, `filtracion`, `falla_servicio`, `urgencia`, `seguridad`, `otro` | Sí |
| `urgencia` | string | Urgencia: `baja`, `media`, `alta` | Sí |
| `ubicacion` | string | Lugar dentro de la escuela (aula, patio, etc.) | No |
| `fotoDataUrl` | string | Imagen comprimida en base64 (data URL JPEG, ~1024px máx) | No |
| `descripcion` | string | Descripción del incidente | Sí |
| `estado` | string | Estado actual del incidente | Sí |
| `cargadoPor` | string | UID del usuario que registró el incidente | Sí |
| `cargadoPorNombre` | string | Nombre del usuario que cargó | Sí |
| `createdAt` | timestamp | Fecha de creación del documento | Sí |
| `updatedAt` | timestamp | Última actualización de estado | No |

**Valores permitidos para `estado`:**
- `"pendiente"` — Estado inicial por defecto
- `"en_analisis"` — En revisión por el Supervisor
- `"en_gestion"` — Acción en curso
- `"resuelto"` — Caso cerrado

**Ejemplo:**
```json
{
  "escuelaId": "abc123",
  "fecha": "2026-07-23T00:00:00Z",
  "descripcion": "Filtración de agua en el techo del aula 3.",
  "estado": "pendiente",
  "cargadoPor": "user456",
  "cargadoPorNombre": "María López",
  "createdAt": "2026-07-23T10:15:00Z",
  "updatedAt": "2026-07-23T10:15:00Z"
}
```

### 3.6 `docentes/{docenteId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `nombre` | string | Nombre del docente | Sí |
| `materia` | string | Materia o área que dicta (opcional) | No |
| `escuelaId` | string | Referencia al documento de escuela | Sí |
| `activo` | boolean | Si el docente está activo (ausente = inactivo; solo los activos aparecen en el formulario de asistencia) | Sí |
| `createdAt` | timestamp | Fecha de creación del documento | Sí |

**Ejemplo:**
```json
{
  "nombre": "Laura Díaz",
  "materia": "Matemática",
  "escuelaId": "abc123",
  "activo": true,
  "createdAt": "2026-07-23T08:00:00Z"
}
```

### 3.7 `asistencia_docentes/{attendanceId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia al documento de escuela | Sí |
| `fecha` | timestamp | Fecha del registro de asistencia | Sí |
| `cargadoPor` | string | UID del usuario que completó el formulario | Sí |
| `cargadoPorNombre` | string | Nombre del usuario que cargó (para vista) | Sí |
| `registros` | array | Array con la asistencia de cada docente | Sí |
| `createdAt` | timestamp | Fecha de creación del documento | Sí |

**Estructura de cada elemento en `registros[]`:**

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `nombre` | string | Nombre del docente | Sí |
| `materia` | string | Materia del docente (si tiene) | No |
| `presente` | boolean | `true` = presente, `false` = ausente | Sí |
| `motivo` | string | Motivo de ausencia (solo si `presente = false`) | No |

**Ejemplo:**
```json
{
  "escuelaId": "abc123",
  "fecha": "2026-07-23T00:00:00Z",
  "cargadoPor": "user123",
  "cargadoPorNombre": "Juan Pérez",
  "registros": [
    { "nombre": "Laura Díaz", "materia": "Matemática", "presente": true },
    { "nombre": "Sergio Ríos", "materia": "Lengua", "presente": false, "motivo": "Licencia médica" }
  ],
  "createdAt": "2026-07-23T08:30:00Z"
}
```

### 3.8 `fotos/{fotoId}`

| Campo | Tipo | Descripción | Obligatorio |
|---|---|---|---|
| `escuelaId` | string | Referencia al documento de escuela | Sí |
| `fecha` | string | Fecha en formato `YYYY-MM-DD` | Sí |
| `dataUrl` | string | Imagen comprimida en base64 (data URL JPEG, ~1024px máx) | Sí |
| `nombreArchivo` | string | Nombre original del archivo | Sí |
| `subidoPor` | string | UID del preceptor que subió la foto | Sí |
| `subidoPorNombre` | string | Nombre del preceptor que subió | Sí |
| `createdAt` | timestamp | Fecha de creación del documento | Sí |

> **Nota:** las imágenes se guardan comprimidas como base64 dentro del documento (sin Firebase Storage). Límite por documento: 1 MiB. `src/utils/image.ts` redimensiona a ~1024px y calidad ~0.6.

**Ejemplo:**
```json
{
  "escuelaId": "abc123",
  "fecha": "2026-07-23",
  "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "nombreArchivo": "planilla_firmada.jpg",
  "subidoPor": "user789",
  "subidoPorNombre": "Carlos García",
  "createdAt": "2026-07-23T08:00:00Z"
}
```

## 4. Relaciones entre colecciones

```
escuelas ←──── usuarios.escuelaId
escuelas ←──── docentes.escuelaId
escuelas ←──── asistencias.escuelaId
escuelas ←──── asistencia_docentes.escuelaId
escuelas ←──── novedades.escuelaId
escuelas ←──── incidentes.escuelaId
escuelas ←──── fotos.escuelaId

usuarios ←──── asistencias.cargadoPor
usuarios ←──── asistencia_docentes.cargadoPor
usuarios ←──── novedades.cargadoPor
usuarios ←──── incidentes.cargadoPor
usuarios ←──── fotos.subidoPor
```

**Nota:** Firestore no tiene joins nativos. Las referencias se resuelven en el frontend mediante consultas separadas o al momento de carga.

## 5. Índices recomendados

| Colección | Campos indexados | Motivo |
|---|---|---|
| `asistencias` | `escuelaId` + `fecha` | Consultar asistencias de una escuela en un rango de fechas |
| `asistencia_docentes` | `escuelaId` + `fecha` | Consultar asistencias docentes de una escuela |
| `novedades` | `escuelaId` + `fecha` | Consultar novedades de una escuela en un rango de fechas |
| `incidentes` | `escuelaId` + `fecha` | Consultar incidentes de una escuela en un rango de fechas |
| `incidentes` | `estado` + `fecha` | Filtrar incidentes por estado |
| `usuarios` | `escuelaId` + `rol` | Obtener todos los usuarios de una escuela por rol |
| `fotos` | `escuelaId` + `fecha` | Consultar fotos de una escuela por fecha |
| `fotos` | `escuelaId` + `createdAt` | Listar fotos de una escuela (ordenadas por subida) |

## 6. Reglas de seguridad (Firestore Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Escuelas - solo lectura autenticada
    match /escuelas/{schoolId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo se crean desde Firebase Console o admin
    }

    // Usuarios - cada usuario lee su propio perfil, admin escribe
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Asistencias - solo autenticados pueden leer/escribir
    match /asistencias/{attendanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }

    // Novedades - solo autenticados pueden leer/escribir
    match /novedades/{newsId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }

    // Incidentes - lectura autenticada, escritura autenticada
    match /incidentes/{incidentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null; // Supervisor cambia estado
      allow delete: if false;
    }
  }
}
```

**Nota:** Estas son reglas básicas para MVP. En producción se recomienda validar el rol del usuario en las reglas de Firestore para mayor seguridad.
