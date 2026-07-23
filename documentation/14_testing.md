# 14 - Testing

## 1. Stack de testing

| Herramienta | Propósito |
|---|---|
| **Vitest** | Test runner (reemplaza Jest, nativo de Vite) |
| **Testing Library** | Tests de componentes React |
| **jsdom** | Simulación del DOM en Node.js |

## 2. Instalación

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

## 3. Configuración

### 3.1 vite.config.ts

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### 3.2 src/test/setup.ts

```typescript
import '@testing-library/jest-dom';
```

## 4. Scripts

| Script | Descripción |
|---|---|
| `npm run test` | Ejecuta todos los tests |
| `npm run test:watch` | Ejecuta tests en modo watch |
| `npm run test:coverage` | Genera reporte de cobertura |

## 5. Qué testear

### 5.1 Prioridad alta

| Componente | Tipo de test | Qué verificar |
|---|---|---|
| `useFormValidation` | Unit | Validación de esquemas Zod |
| `AuthContext` | Unit | Login, logout, cambio de estado |
| `firestore.ts` | Integration | CRUD de colecciones |
| `AttendanceForm` | Component | Submit, validación, estados |

### 5.2 Prioridad media

| Componente | Tipo de test | Qué verificar |
|---|---|---|
| `Navbar` | Component | Links según rol, estado activo |
| `SchoolSelect` | Component | Carga de escuelas, selección |
| `StatusBadge` | Unit | Renderizado según estado |
| `NewsForm` | Component | Submit, validación |

### 5.3 Prioridad baja

| Componente | Tipo de test | Qué verificar |
|---|---|---|
| `Home` | Snapshot | Renderizado correcto |
| `NotFound` | Snapshot | Renderizado correcto |
| `MainLayout` | Component | Outlet funciona |

## 6. Estructura de tests

### 6.1 Ubicación

Los tests se colocan junto a los componentes:

```
src/
├── components/
│   └── forms/
│       ├── AttendanceForm/
│       │   ├── AttendanceForm.tsx
│       │   ├── AttendanceForm.css
│       │   └── AttendanceForm.test.tsx    ← Test
```

### 6.2 Ejemplo de test

```typescript
// src/components/forms/AttendanceForm/AttendanceForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AttendanceForm from './AttendanceForm';

describe('AttendanceForm', () => {
  it('muestra error si no se selecciona escuela', async () => {
    render(<AttendanceForm />);
    fireEvent.click(screen.getByText('Guardar'));
    expect(screen.getByText('Seleccioná una escuela')).toBeInTheDocument();
  });

  it('muestra campo de motivo al marcar ausente', () => {
    render(<AttendanceForm />);
    fireEvent.click(screen.getByText('Ausente'));
    expect(screen.getByLabelText('Motivo')).toBeInTheDocument();
  });
});
```

## 7. Cobertura mínima

| Métrica | Objetivo |
|---|---|
| Lines | > 60% |
| Functions | > 60% |
| Branches | > 50% |
| Statements | > 60% |

**Nota:** Para MVP, la cobertura no es blocker. Se prioriza testear la lógica de negocio crítica (formularios, autenticación, servicios).
