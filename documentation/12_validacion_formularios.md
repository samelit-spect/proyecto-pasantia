# 12 - Validación de Formularios

## 1. Enfoque

Se recomienda usar **Zod** para definir esquemas de validación. Es type-safe, ligero y funciona bien con TypeScript.

```bash
npm install zod
```

## 2. Esquemas de validación

### 2.1 Asistencia

```typescript
import { z } from 'zod';

const AttendanceRecordSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  cargo: z.string().min(1, 'El cargo es obligatorio'),
  presente: z.boolean(),
  motivo: z.string().optional(),
}).refine(
  (data) => data.presente || (data.motivo && data.motivo.length > 0),
  { message: 'Si está ausente, el motivo es obligatorio' }
);

const AttendanceSchema = z.object({
  escuelaId: z.string().min(1, 'Seleccioná una escuela'),
  fecha: z.date({ required_error: 'Seleccioná una fecha' }),
  registros: z.array(AttendanceRecordSchema).min(1, 'Debe haber al menos un integrante'),
});
```

### 2.2 Novedad

```typescript
const NewsSchema = z.object({
  escuelaId: z.string().min(1, 'Seleccioná una escuela'),
  fecha: z.date({ required_error: 'Seleccioná una fecha' }),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
});
```

### 2.3 Incidente

```typescript
const IncidentSchema = z.object({
  escuelaId: z.string().min(1, 'Seleccioná una escuela'),
  fecha: z.date({ required_error: 'Seleccioná una fecha' }),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
});
```

### 2.4 Login

```typescript
const LoginSchema = z.object({
  email: z.string().email('El correo electrónico no es válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
```

## 3. Reglas de validación por campo

### 3.1 Campos comunes (todos los formularios)

| Campo | Tipo | Regla | Mensaje |
|---|---|---|---|
| escuelaId | select | Obligatorio | "Seleccioná una escuela" |
| fecha | date | Obligatorio, no futuro | "Seleccioná una fecha" |

### 3.2 Asistencia

| Campo | Regla | Mensaje |
|---|---|---|
| registros[] | Mínimo 1 elemento | "Debe haber al menos un integrante" |
| registros[].nombre | No vacío | "El nombre es obligatorio" |
| registros[].cargo | No vacío | "El cargo es obligatorio" |
| registros[].presente | Booleano | — |
| registros[].motivo | Obligatorio si `presente = false` | "Si está ausente, el motivo es obligatorio" |

### 3.3 Novedad / Incidente

| Campo | Regla | Mensaje |
|---|---|---|
| descripcion | Mínimo 10 caracteres | "La descripción debe tener al menos 10 caracteres" |
| descripcion | Máximo 500/1000 caracteres | "La descripción no puede exceder X caracteres" |

## 4. Validación en tiempo real

### 4.1 On blur (cuando el campo pierde foco)

Validar cada campo cuando el usuario sale del campo. Mostrar error debajo del campo.

### 4.2 On submit (al enviar)

Validar todos los campos antes de enviar. Si hay errores, mostrar todos y scrollear al primero.

## 5. Mensajes de error

### 5.1 Formato

```
┌─────────────────────────────────────┐
│  Escuela: [Seleccionar escuela ▼]   │
│  ⚠ Este campo es obligatorio       │
└─────────────────────────────────────┘
```

- Color: `#dc2626` (rojo)
- Icono: ⚠ o ▲
- Posición: Debajo del campo
- Tamaño: 12px

### 5.2 Ejemplos de mensajes

| Campo | Error | Mensaje |
|---|---|---|
| Escuela | Vacío | "Seleccioná una escuela" |
| Fecha | Vacía | "Seleccioná una fecha" |
| Fecha | Futura | "La fecha no puede ser en el futuro" |
| Descripción | Muy corta | "La descripción debe tener al menos 10 caracteres" |
| Motivo | Vacío (ausente) | "Si está ausente, el motivo es obligatorio" |

## 6. Integración con React

### 6.1 Hook personalizado

```typescript
// src/hooks/custom/useFormValidation.ts
export function useFormValidation<T>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = (data: T): boolean => {
    const result = schema.safeParse(data);
    if (!result.success) {
      // Mapear errores de Zod a objeto de errores
      return false;
    }
    setErrors({});
    return true;
  };

  return { errors, validate };
}
```

### 6.2 Uso en componentes

```typescript
const { errors, validate } = useFormValidation(NewsSchema);

const handleSubmit = (data: NewsDTO) => {
  if (!validate(data)) return;
  // Enviar a Firebase
};
```
