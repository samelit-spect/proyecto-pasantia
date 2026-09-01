import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Incidentes from '@/pages/Incidentes/Incidentes';
import * as AuthContext from '@/context/AuthContext';
import { addIncident } from '@/services/api/firestore';

const firestoreMock = vi.hoisted(() => ({
  addIncident: vi.fn(() => Promise.resolve('mock-id')),
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

function renderIncidentes() {
  const router = createMemoryRouter([{ path: '/incidentes', element: <Incidentes /> }], {
    initialEntries: ['/incidentes'],
  });
  return render(<RouterProvider router={router} />);
}

describe('Incidentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __setAuth({
      uid: 'test-uid',
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      rol: 'director',
      escuelaId: 'escuela-1',
    });
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

  it('avisa si el perfil no tiene escuela asignada en vez de guardar en silencio', async () => {
    __setAuth({
      uid: 'test-uid',
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      rol: 'director',
      escuelaId: '',
    });

    const user = userEvent.setup();
    renderIncidentes();

    await user.selectOptions(screen.getByLabelText('Categoría del incidente'), 'rotura');
    await user.selectOptions(screen.getByLabelText('Urgencia'), 'alta');
    await user.type(screen.getByPlaceholderText(/Describí el incidente/), 'Incidente sin escuela');
    await user.click(screen.getByRole('button', { name: 'Guardar Incidente' }));

    await waitFor(() => {
      expect(screen.getByText(/Tu perfil no tiene una escuela asignada/)).toBeDefined();
    });
    expect(addIncident).not.toHaveBeenCalled();
  });
});
