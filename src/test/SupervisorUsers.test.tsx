import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import SupervisorUsers from '@/pages/Supervisor/SupervisorUsers';
import type { UserProfile, School } from '@/types';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-sup' },
    profile: {
      uid: 'uid-sup',
      nombre: 'Supervisor',
      email: 'sup@test.com',
      rol: 'supervisor',
      escuelaId: '',
    },
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: () => true,
    canAccess: () => true,
  }),
}));

vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('@/services/api/auth', () => ({
  createUserAccount: vi.fn(() => Promise.resolve('uid-nuevo')),
  sendPasswordReset: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/services/api/firestore', () => {
  const schools: School[] = [
    { id: 'esc-1', nombre: 'Escuela Norte', turno: 'Mañana', activa: true },
    { id: 'esc-2', nombre: 'Escuela Sur', turno: 'Tarde', activa: true },
  ];
  const users: UserProfile[] = [
    {
      uid: 'u-1',
      nombre: 'Zulma Ávila',
      email: 'z@test.com',
      rol: 'director',
      escuelaId: 'esc-1',
      cargo: 'director',
      activo: true,
      fechaCreacion: new Date('2026-01-02'),
    },
    {
      uid: 'u-2',
      nombre: 'Ana Brizuela',
      email: 'a@test.com',
      rol: 'preceptor',
      escuelaId: 'esc-2',
      cargo: 'preceptor',
      activo: true,
      fechaCreacion: new Date('2026-01-01'),
    },
  ];
  return {
    getSchools: vi.fn(() => Promise.resolve(schools)),
    getAllUsers: vi.fn(() => Promise.resolve(users)),
    addUserProfile: vi.fn(() => Promise.resolve('uid-nuevo')),
    setUserActive: vi.fn(() => Promise.resolve()),
    updateUserProfile: vi.fn(() => Promise.resolve()),
  };
});

function renderSupervisorUsers() {
  const router = createMemoryRouter(
    [{ path: '/supervisor/usuarios', element: <SupervisorUsers /> }],
    {
      initialEntries: ['/supervisor/usuarios'],
    }
  );
  return render(<RouterProvider router={router} />);
}

describe('SupervisorUsers — ordenamiento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ordena por nombre de forma ascendente por defecto', async () => {
    renderSupervisorUsers();
    await waitFor(() => {
      expect(screen.getByText('Ana Brizuela')).toBeDefined();
      expect(screen.getByText('Zulma Ávila')).toBeDefined();
    });
    await waitFor(() => {
      const names = screen.getAllByText(/Ávila|Brizuela/).map((el) => el.textContent ?? '');
      expect(names).toEqual(['Ana Brizuela', 'Zulma Ávila']);
    });
  });

  it('permite invertir la dirección de orden', async () => {
    const user = userEvent.setup();
    renderSupervisorUsers();
    await waitFor(() => {
      expect(screen.getByText('Ana Brizuela')).toBeDefined();
    });

    await user.click(screen.getByRole('button', { name: /Orden ascendente/ }));

    await waitFor(() => {
      const names = screen.getAllByText(/Ávila|Brizuela/).map((el) => el.textContent ?? '');
      expect(names).toEqual(['Zulma Ávila', 'Ana Brizuela']);
    });
  });

  it('ordena por escuela seleccionando el criterio', async () => {
    const user = userEvent.setup();
    renderSupervisorUsers();
    await waitFor(() => {
      expect(screen.getByText('Ana Brizuela')).toBeDefined();
    });

    await user.selectOptions(screen.getByLabelText('Ordenar'), 'escuela');

    await waitFor(() => {
      const names = screen.getAllByText(/Ávila|Brizuela/).map((el) => el.textContent ?? '');
      // Zulma -> Escuela Norte, Ana -> Escuela Sur (N < S)
      expect(names).toEqual(['Zulma Ávila', 'Ana Brizuela']);
    });
  });
});
