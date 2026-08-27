# 11 - Validación de Formularios

> Este documento de la bitácora recopila el **sistema de validación** de los formularios, basado en **Zod** (schemas) integrado con **react-hook-form**.

---

## 1. Por qué Zod + react-hook-form

- **Zod:** define esquemas de validación **declarativos y tipados**. El mismo schema sirve para validar y para inferir el tipo TypeScript del formulario (`z.infer`).
- **react-hook-form:** maneja el estado de los campos y la integración con el DOM, con **renders mínimos** y buen rendimiento.
- **`@hookform/resolvers/zod` → `zodResolver`:** conecta ambos; la validación se ejecuta automáticamente con el schema.
- **Validación centralizada** (los mensajes y reglas viven en un solo lugar) y **tests** sobre los schemas.

---

## 2. Schemas de validación

### 2.1 Centralizados (`src/utils/validation.ts`)

#### `novedadSchema`

| Campo | Regla |
|---|---|
| `fecha` | Obligatoria y **no puede ser futura** |
| `tipo` | Obligatorio (seleccionar un tipo) |
| `hora` | Opcional |
| `descripcion` | Mínimo 5 caracteres, máximo 500 |

#### `incidenteSchema`

| Campo | Regla |
|---|---|
| `fecha` | Obligatoria y no futura |
| `categoria` | Obligatoria |
| `urgencia` | Obligatoria |
| `ubicacion` | Máximo 100 caracteres (opcional) |
| `descripcion` | Mínimo 10 caracteres, máximo 1000 |

#### Regla de fecha

- `fechaRule` valida que la fecha **no sea en el futuro**, usando `todayISO()` (fecha local del dispositivo, manejando la zona horaria).

### 2.2 Schemas locales (Supervisor)

#### Formulario de escuela (`SupervisorSchools.tsx`)

- `schoolSchema`: nombre/turno/etc. con valores obligatorios y mensajes de error.

#### Formulario de usuario (`SupervisorUsers.tsx`)

- `createUserSchema`: nombre (mín. 3), email (válido), contraseña (mín. 6), rol (enum), escuela (obligatoria).
- `editUserSchema`: igual pero sin contraseña (no se edita al modificar).

---

## 3. Cómo se integra

En cada formulario (Novedades, Incidentes, Usuarios, Escuelas):

```ts
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: defaults,
});
```

- `register` conecta los campos.
- `Controller` se usa para componentes custom (ej. `DatePicker`).
- `errors.<campo>.message` se muestra junto a cada campo.
- Se puede combinar con `useWatch` para contadores (ej. longitud de descripción).

---

## 4. Validación adicional en la asistencia

El formulario de asistencia (`AttendanceForm`) tiene su **propia lógica de validación** (fuera de Zod, de forma manual):

- El **estado** de cada integrante es obligatorio.
- Si está **ausente**, el **motivo** es obligatorio.
- En modo secciones, si hay más de un integrante con el mismo cargo, el **nombre** es obligatorio.

---

## 5. Tests de validación

- Existen tests sobre los schemas (`src/test/validation.test.ts`) que verifican casos válidos e inválidos de `novedadSchema` e `incidenteSchema` (fechas futuras, descripciones cortas, campos faltantes, etc.).

---

## 6. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Schemas de novedades e incidentes (`validation.ts`) | Semana 1-2 | ~3 h |
| Integración con react-hook-form (`zodResolver`) | Semana 1-2 | ~3 h |
| Schema de escuela (migración a react-hook-form + Zod) | Semana 3 | ~2-3 h |
| Schemas de usuario (crear/editar) | Semana 3 | ~2-3 h |
| Validación manual de asistencia (motivo si ausente) | Semana 1-2 | ~2 h |
| Tests de validación | Semana 3 | ~2 h |
| **Total aproximado** | - | **~1.5 días** |

---

## 7. Pendientes y observaciones

- Centralizar los schemas de usuario y escuela en `validation.ts` para consistencia.
- Considerar validación de tipos de imagen (ya se valida tamaño/tipo antes de subir fotos).
