import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types/models/user';

const { signInMock, signOutMock, onAuthStateChangedMock, getDocMock, docMock } = vi.hoisted(() => {
  return {
    signInMock: vi.fn(),
    signOutMock: vi.fn(),
    onAuthStateChangedMock: vi.fn(),
    getDocMock: vi.fn(),
    docMock: vi.fn((db: unknown, collection: string, id: string) => ({ db, collection, id })),
  };
});

const firebaseUser = { uid: 'uid-1', email: 'd@test.com' } as unknown as User;
const profile: UserProfile = {
  uid: 'uid-1',
  nombre: 'Directora',
  email: 'd@test.com',
  rol: 'director',
  escuelaId: 'esc-1',
  cargo: 'directora',
  activo: true,
  fechaCreacion: new Date('2026-01-01'),
};

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: signInMock,
  signOut: signOutMock,
  onAuthStateChanged: onAuthStateChangedMock,
}));

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  getDoc: getDocMock,
}));

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

function Probe({ children }: { children?: ReactNode }) {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="isLoading">{String(auth.isLoading)}</span>
      <span data-testid="user">{auth.user ? auth.user.uid : 'null'}</span>
      <span data-testid="profile">
        {auth.profile ? `${auth.profile.nombre}|${auth.profile.rol}` : 'null'}
      </span>
      <span data-testid="hasRoleDirector">{String(auth.hasRole('director'))}</span>
      <span data-testid="hasRolePreceptor">{String(auth.hasRole('preceptor'))}</span>
      <span data-testid="canAccesoAsistencia">{String(auth.canAccess('/asistencia'))}</span>
      <span data-testid="canAccesoSupervisor">{String(auth.canAccess('/supervisor'))}</span>
      {children}
    </div>
  );
}

function mountTestHooks() {
  const Hooks = () => {
    const { login, logout } = useAuth();
    return (
      <>
        <button onClick={() => void login('d@test.com', 'pass123')}>login</button>
        <button onClick={() => void logout()}>logout</button>
      </>
    );
  };
  render(
    <AuthProvider>
      <Probe>
        <Hooks />
      </Probe>
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  onAuthStateChangedMock.mockImplementation((_auth, cb: (u: User | null) => void) => {
    cb(null);
    return vi.fn();
  });
  signInMock.mockResolvedValue({ user: firebaseUser });
  signOutMock.mockResolvedValue(undefined);
  getDocMock.mockResolvedValue({
    exists: () => true,
    data: () => profile,
    id: 'uid-1',
  });
});

describe('AuthContext', () => {
  it('arranca sin sesión cuando no hay usuario autenticado', async () => {
    mountTestHooks();
    await waitFor(() => {
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('profile').textContent).toBe('null');
    });
    expect(onAuthStateChangedMock).toHaveBeenCalled();
  });

  it('al iniciar sesión con onAuthStateChanged carga el perfil', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, cb: (u: User | null) => void) => {
      cb(firebaseUser);
      return vi.fn();
    });
    mountTestHooks();
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(screen.getByTestId('profile').textContent).toBe('Directora|director');
    });
    expect(getDocMock).toHaveBeenCalled();
    expect(docMock).toHaveBeenCalledWith(expect.anything(), 'usuarios', 'uid-1');
  });

  it('login() autentica, carga perfil y habilita hasRole/canAccess', async () => {
    mountTestHooks();
    await waitFor(() => {
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
    });
    await userEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('uid-1');
      expect(screen.getByTestId('hasRoleDirector').textContent).toBe('true');
      expect(screen.getByTestId('hasRolePreceptor').textContent).toBe('false');
      expect(screen.getByTestId('canAccesoAsistencia').textContent).toBe('true');
      expect(screen.getByTestId('canAccesoSupervisor').textContent).toBe('false');
    });
    expect(signInMock).toHaveBeenCalledWith(expect.anything(), 'd@test.com', 'pass123');
  });

  it('logout() cierra sesión y limpia el estado', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, cb: (u: User | null) => void) => {
      cb(firebaseUser);
      return vi.fn();
    });
    mountTestHooks();
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    });

    await userEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('profile').textContent).toBe('null');
    });
    expect(signOutMock).toHaveBeenCalled();
  });

  it('si no existe el perfil, queda autenticado pero sin perfil', async () => {
    getDocMock.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
      id: 'uid-1',
    });
    onAuthStateChangedMock.mockImplementation((_auth, cb: (u: User | null) => void) => {
      cb(firebaseUser);
      return vi.fn();
    });
    mountTestHooks();
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(screen.getByTestId('profile').textContent).toBe('null');
      expect(screen.getByTestId('hasRoleDirector').textContent).toBe('false');
    });
  });
});
