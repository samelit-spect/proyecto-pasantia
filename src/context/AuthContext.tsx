import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
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
      return null;
    } catch {
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

  const login = useCallback(async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await loadUserProfile(result.user);

    setState({
      user: result.user,
      profile,
      isLoading: false,
      isAuthenticated: true,
    });
  }, [loadUserProfile]);

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

  const canAccess = useCallback(
    (route: string) => {
      if (!state.profile) return false;
      const allowedRoles = ROUTE_PERMISSIONS[route];
      if (!allowedRoles) return true;
      return allowedRoles.includes(state.profile.rol);
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
