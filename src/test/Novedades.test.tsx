import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Novedades from '@/pages/Novedades/Novedades';

vi.mock('@/services/api/firestore', () => ({
  addNews: vi.fn(() => Promise.resolve('mock-id')),
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

function renderNovedades() {
  const router = createMemoryRouter([{ path: '/novedades', element: <Novedades /> }], {
    initialEntries: ['/novedades'],
  });
  return render(<RouterProvider router={router} />);
}

describe('Novedades', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario correctamente', () => {
    renderNovedades();
    expect(screen.getByText('Registrar Novedad')).toBeDefined();
    expect(screen.getByText(/Completá los datos/)).toBeDefined();
    expect(screen.getByText('Tu escuela asignada')).toBeDefined();
    expect(screen.getByLabelText('Fecha')).toBeDefined();
  });

  it('renderiza los selectores de tipo y hora', () => {
    renderNovedades();
    expect(screen.getByText('Tipo de novedad')).toBeDefined();
    expect(screen.getByText('Hora (opcional)')).toBeDefined();
  });

  it('renderiza el textarea de descripción', () => {
    renderNovedades();
    expect(screen.getByPlaceholderText(/Describí la novedad/)).toBeDefined();
  });

  it('muestra el contador de caracteres', () => {
    renderNovedades();
    expect(screen.getByText('0/500')).toBeDefined();
  });

  it('tiene botón de guardar', () => {
    renderNovedades();
    expect(screen.getByRole('button', { name: 'Guardar Novedad' })).toBeDefined();
  });
});
