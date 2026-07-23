# 11 - Manejo de Errores

## 1. Tipos de errores

### 1.1 Errores de autenticación

| Error | Causa | Mensaje al usuario |
|---|---|---|
| `auth/user-not-found` | Email no registrado | "No existe una cuenta con ese correo electrónico" |
| `auth/wrong-password` | Contraseña incorrecta | "La contraseña es incorrecta" |
| `auth/invalid-email` | Email con formato inválido | "El correo electrónico no es válido" |
| `auth/too-many-requests` | Demasiados intentos | "Demasiados intentos. Intentá de nuevo en unos minutos" |
| `auth/network-request-failed` | Sin conexión | "Error de conexión. Verificá tu internet" |

### 1.2 Errores de Firestore

| Error | Causa | Mensaje al usuario |
|---|---|---|
| `permission-denied` | Sin permisos | "No tenés permisos para realizar esta acción" |
| `not-found` | Documento no existe | "El registro solicitado no fue encontrado" |
| `already-exists` | Duplicado | "Este registro ya existe" |
| `unavailable` | Sin conexión | "El servicio no está disponible. Intentá más tarde" |
| `deadline-exceeded` | Timeout | "La operación tardó demasiado. Intentá de nuevo" |

### 1.3 Errores de Storage

| Error | Causa | Mensaje al usuario |
|---|---|---|
| `storage/unauthorized` | Sin permisos | "No tenés permisos para subir archivos" |
| `storage/canceled` | Upload cancelado | "La subida fue cancelada" |
| `storage/quota-exceeded` | Cuota llena | "Se agotó el espacio de almacenamiento" |
| `storage/invalid-format` | Formato inválido | "El formato del archivo no es soportado" |

## 2. Estrategia de notificación

### 2.1 Toast notifications

Mensajes breves que aparecen en la esquina superior derecha y se ocultan automáticamente.

```
┌─────────────────────────────────────┐
│ ✅ Asistencia guardada exitosamente │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ❌ Error al guardar. Intentá de nuevo│
└─────────────────────────────────────┘
```

**Duración:**
- Éxito: 3 segundos
- Error: 5 segundos (o hasta que el usuario lo cierre)
- Advertencia: 4 segundos

### 2.2 Mensajes inline

Errores de validación dentro de los formularios, debajo del campo con error.

```
┌─────────────────────────────────────┐
│  Escuela: [Seleccionar escuela ▼]   │
│  ⚠ Este campo es obligatorio       │
└─────────────────────────────────────┘
```

### 2.3 Página de error

Para errores críticos (500, sin conexión total), mostrar una página de error con opción de reintentar.

```
┌─────────────────────────────────────┐
│          ⚠ Algo salió mal           │
│                                     │
│  No se pudo conectar con el         │
│  servidor. Verificá tu conexión     │
│  a internet.                        │
│                                     │
│        [ Reintentar ]               │
└─────────────────────────────────────┘
```

## 3. Flujo de manejo de errores

### 3.1 En formularios

```
Usuario envía formulario
        │
        ▼
Service llama a Firebase
        │
        ├── Éxito → Toast de éxito → Limpiar formulario → Redirigir
        │
        └── Error → Mapear error → Toast de error → Mantener formulario
```

### 3.2 En lectura de datos

```
Componente se monta
        │
        ▼
useEffect llama a Service
        │
        ├── Éxito → Actualizar estado → Renderizar datos
        │
        └── Error → Actualizar estado de error → Mostrar mensaje
```

## 4. Implementación sugerida

### 4.1 Toast component

```typescript
// src/components/common/Toast/Toast.tsx
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}
```

### 4.2 Error boundary

Para errores de renderizado no capturados:

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  // Captura errores de renderizado
  // Muestra UI de fallback
}
```

### 4.3 Hook de errores

```typescript
// src/hooks/custom/useErrorHandler.ts
export function useErrorHandler() {
  const handleError = (error: FirebaseError) => {
    const message = mapFirebaseError(error.code);
    showToast(message, 'error');
  };

  return { handleError };
}
```
