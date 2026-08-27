import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import type { UserProfile, UserRole } from '@/types/models/user';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  canAccess: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/': ['director', 'vice', 'preceptor', 'secretario', 'conserje', 'supervisor'],
  '/asistencia': ['director', 'vice', 'preceptor'],
  '/asistencia-docentes': ['director', 'vice', 'preceptor'],
  '/historial': ['director', 'vice', 'preceptor'],
  '/fotos': ['preceptor'],
  '/novedades': ['director', 'vice'],
  '/incidentes': ['director', 'vice'],
  '/supervisor': ['supervisor'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { uid: user.uid, ...userSnap.data() } as UserProfile;
      }
      console.warn(
        `[AuthContext] No existe documento usuarios/${user.uid}. El usuario autenticado no tiene perfil en Firestore.`
      );
      return null;
    } catch (error) {
      console.error('[AuthContext] Error al cargar el perfil desde Firestore:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await loadUserProfile(user);
        setState({
          user,
          profile,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await loadUserProfile(cred.user);
      setState({
        user: cred.user,
        profile,
        isLoading: false,
        isAuthenticated: true,
      });
    },
    [loadUserProfile]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setState({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!state.profile) return false;
      return roles.includes(state.profile.rol);
    },
    [state.profile]
  );

  useEffect(() => {
    if (!state.isAuthenticated || !state.profile) return;
    if (state.profile.rol !== 'director') return;

    const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
    let timeout: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    resetTimer();

    return () => {
      if (timeout) clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [state.isAuthenticated, state.profile, logout]);

  const canAccess = useCallback(
    (route: string) => {
      if (!state.profile) return false;
      const longestMatch = Object.keys(ROUTE_PERMISSIONS)
        .filter((key) => route === key || route.startsWith(key + '/'))
        .sort((a, b) => b.length - a.length)[0];
      if (!longestMatch) return true;
      return ROUTE_PERMISSIONS[longestMatch].includes(state.profile.rol);
    },
    [state.profile]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
