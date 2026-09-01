import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Novedades from '@/pages/Novedades/Novedades';
import * as AuthContext from '@/context/AuthContext';
import { addNews } from '@/services/api/firestore';

const firestoreMock = vi.hoisted(() => ({
  addNews: vi.fn(() => Promise.resolve('mock-id')),
}));

vi.mock('@/services/api/firestore', () => firestoreMock);

const authMock = vi.hoisted(() => ({
  profile: {
    uid: 'test-uid',
    nombre: 'Juan Pérez',
    email: 'juan@test.com',
    rol: 'director',
    escuelaId: 'escuela-1',
    cargo: 'director',
    activo: true,
  } as {
    uid: string;
    nombre: string;
    email: string;
    rol: string;
    escuelaId: string;
    cargo: string;
    activo: boolean;
  } | null,
}));

vi.mock('@/context/AuthContext', () => ({
  __setAuth: (profile: typeof authMock.profile | null) => {
    authMock.profile = profile;
  },
  useAuth: () => {
    const profile = authMock.profile;
    return {
      user: profile ? { uid: profile.uid } : null,
      profile,
      isLoading: false,
      isAuthenticated: Boolean(profile),
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(() => true),
      canAccess: vi.fn(() => true),
    };
  },
}));

const { __setAuth } = AuthContext as unknown as {
  __setAuth: (
    profile: {
      uid: string;
      nombre: string;
      email: string;
      rol: string;
      escuelaId: string;
    } | null
  ) => void;
};

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
    __setAuth({
      uid: 'test-uid',
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      rol: 'director',
      escuelaId: 'escuela-1',
    });
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

  it('avisa si el perfil no tiene escuela asignada en vez de guardar en silencio', async () => {
    __setAuth({
      uid: 'test-uid',
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      rol: 'director',
      escuelaId: '',
    });

    const user = userEvent.setup();
    renderNovedades();

    await user.selectOptions(screen.getByLabelText('Tipo de novedad'), 'otro');
    await user.type(screen.getByPlaceholderText(/Describí la novedad/), 'Novedad sin escuela');
    await user.click(screen.getByRole('button', { name: 'Guardar Novedad' }));

    await waitFor(() => {
      expect(screen.getByText(/Tu perfil no tiene una escuela asignada/)).toBeDefined();
    });
    expect(addNews).not.toHaveBeenCalled();
  });
});
