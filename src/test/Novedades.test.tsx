import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem('sipnam-offline-writes');
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      configurable: true,
    });
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

  it('sin conexión guarda localmente y marca la sincronización pendiente', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const user = userEvent.setup();
    renderNovedades();

    await user.selectOptions(screen.getByLabelText('Tipo de novedad'), 'otro');
    await user.type(
      screen.getByPlaceholderText(/Describí la novedad/),
      'Cortó la luz en el edificio'
    );
    await user.click(screen.getByRole('button', { name: 'Guardar Novedad' }));

    await waitFor(() => {
      expect(screen.getByText(/Sin conexión: novedad guardada en el dispositivo/)).toBeDefined();
      expect(localStorage.getItem('sipnam-offline-writes')).not.toBeNull();
    });
  });
});
