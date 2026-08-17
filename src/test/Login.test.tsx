import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Login from '@/pages/Login/Login';

const mockLogin = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: vi.fn(),
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
    hasRole: vi.fn(() => false),
    canAccess: vi.fn(() => false),
  }),
}));

function renderLogin() {
  const router = createMemoryRouter([{ path: '/login', element: <Login /> }], {
    initialEntries: ['/login'],
  });
  return render(<RouterProvider router={router} />);
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario de login', () => {
    renderLogin();
    expect(screen.getByText('SIPNAM')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Contraseña')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeDefined();
  });

  it('muestra el subtítulo del sistema', () => {
    renderLogin();
    expect(screen.getByText(/Sistema Integrado de Partes/)).toBeDefined();
  });

  it('el botón se deshabilita durante el envío', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');

    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('muestra texto de carga en el botón durante el envío', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'test@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ingresando...' })).toBeDefined();
    });
  });

  it('muestra error cuando el login falla', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales inválidas'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'bad@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('Credenciales inválidas')).toBeDefined();
    });
  });

  it('mapea errores de Firebase a mensajes amigables', async () => {
    mockLogin.mockRejectedValue({ code: 'auth/wrong-password', message: 'Firebase error' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'test@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('La contraseña es incorrecta.')).toBeDefined();
    });
  });

  it('los inputs tienen autocomplete correcto', () => {
    renderLogin();
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('autocomplete', 'current-password');
  });
});
