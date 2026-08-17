import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Incidentes from '@/pages/Incidentes/Incidentes';

vi.mock('@/services/api/firestore', () => ({
  addIncident: vi.fn(() => Promise.resolve('mock-id')),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-uid' },
    profile: {
      uid: 'test-uid',
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      rol: 'director',
      escuelaId: 'escuela-1',
      cargo: 'director',
      activo: true,
    },
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: vi.fn(() => true),
    canAccess: vi.fn(() => true),
  }),
}));

function renderIncidentes() {
  const router = createMemoryRouter([{ path: '/incidentes', element: <Incidentes /> }], {
    initialEntries: ['/incidentes'],
  });
  return render(<RouterProvider router={router} />);
}

describe('Incidentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título y subtítulo', () => {
    renderIncidentes();
    expect(screen.getByText('Registrar Incidente')).toBeDefined();
    expect(screen.getByText(/Completá los datos/)).toBeDefined();
  });

  it('renderiza los campos del formulario', () => {
    renderIncidentes();
    expect(screen.getByText('Tu escuela asignada')).toBeDefined();
    expect(screen.getByLabelText('Fecha')).toBeDefined();
    expect(screen.getByLabelText('Categoría del incidente')).toBeDefined();
    expect(screen.getByLabelText('Urgencia')).toBeDefined();
    expect(screen.getByText('Ubicación (opcional)')).toBeDefined();
    expect(screen.getByText('Descripción del incidente')).toBeDefined();
    expect(screen.getByText('Foto del incidente (opcional)')).toBeDefined();
  });

  it('tiene botón de guardar', () => {
    renderIncidentes();
    expect(screen.getByRole('button', { name: 'Guardar Incidente' })).toBeDefined();
  });

  it('muestra el contador de caracteres para descripción', () => {
    renderIncidentes();
    expect(screen.getByText('0/1000')).toBeDefined();
  });
});
