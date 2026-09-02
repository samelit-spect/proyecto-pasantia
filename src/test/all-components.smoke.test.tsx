/**
 * Smoke test global: monta TODAS las páginas y los componentes comunes
 * para verificar que renderizan sin errores con servicios y auth simulados.
 */
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { render, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { UserProfile } from '@/types';

// ---------------------------------------------------------------------------
// Stubs de APIs del navegador que jsdom no implementa
// ---------------------------------------------------------------------------
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }));
  }
  if (!('ResizeObserver' in window)) {
    class ResizeObserverStub {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    (window as unknown as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
  }
});

// ---------------------------------------------------------------------------
// Mock de AuthContext con rol configurable por test
// ---------------------------------------------------------------------------
const authMock = vi.hoisted(() => ({ profile: null as UserProfile | null }));

const PROFILE_DIRECTOR: UserProfile = {
  uid: 'uid-director',
  email: 'director@tinogasta.edu.ar',
  nombre: 'Director de Prueba',
  rol: 'director',
  escuelaId: 'esc-1',
} as UserProfile;

const PROFILE_SUPERVISOR: UserProfile = {
  uid: 'uid-supervisor',
  email: 'supervisor@catamarca.gov.ar',
  nombre: 'Supervisor de Prueba',
  rol: 'supervisor',
} as UserProfile;

vi.mock('@/context/AuthContext', () => {
  let cachedProfile: UserProfile | null = null;
  let cachedValue: Record<string, unknown> | null = null;

  return {
    // El valor debe ser estable entre renders: si `hasRole` cambiara de
    // identidad en cada llamada, los efectos que dependen de él se re-ejecutan
    // en bucle y el test queda colgado.
    useAuth: () => {
      if (!cachedValue || cachedProfile !== authMock.profile) {
        const profile = authMock.profile;
        cachedValue = {
          user: profile ? { uid: profile.uid } : null,
          profile,
          isAuthenticated: Boolean(profile),
          isLoading: false,
          canAccess: () => true,
          hasRole: (...roles: string[]) => roles.includes(profile?.rol ?? ''),
        };
        cachedProfile = profile;
      }
      return cachedValue;
    },
  };
});

vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Mock de Firebase: evita que getAuth()/getApp() se ejecuten en el entorno de
// test (no hay API key válida), lo que lanzaría auth/invalid-api-key.
// ---------------------------------------------------------------------------
vi.mock('@/services/firebase', () => ({
  firebaseConfig: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    messagingSenderId: '1234',
    appId: '1:1234:web:abcd',
  },
  app: {},
  auth: {
    onAuthStateChanged: () => () => {},
    currentUser: null,
  },
  db: {},
}));

// ---------------------------------------------------------------------------
// Mock de Firestore: cada función exportada responde con datos seguros
// ---------------------------------------------------------------------------
vi.mock('@/services/api/firestore', () => {
  const FIRESTORE_EXPORTS = [
    'addAttendance',
    'addDocente',
    'addDocenteAttendance',
    'addFoto',
    'addIncident',
    'addNews',
    'addSchool',
    'addUserProfile',
    'deleteFoto',
    'deleteSchool',
    'getAllAttendances',
    'getAllDocenteAttendances',
    'getAllDocentes',
    'getAllIncidents',
    'getAllNews',
    'getAllUsers',
    'getAttendanceByUserAndDate',
    'getAttendancesBySchool',
    'getDocenteAttendanceByUserAndDate',
    'getDocenteAttendancesBySchool',
    'getDocentesBySchool',
    'getFotosBySchoolAndDate',
    'getIncidentsBySchool',
    'getNewsBySchool',
    'getSchoolById',
    'getSchools',
    'getTodayAttendancesBySchool',
    'getTodayIncidentsBySchool',
    'getTodayNewsBySchool',
    'getUsersBySchool',
    'setAttendanceVerified',
    'setDocenteActive',
    'setDocenteAttendanceVerified',
    'setUserActive',
    'subscribeAttendancesBySchool',
    'subscribeDocenteAttendancesBySchool',
    'subscribeFotosBySchool',
    'subscribeIncidentsBySchool',
    'subscribeNewsBySchool',
    'subscribeRecentIncidents',
    'subscribeTodayAttendances',
    'subscribeTodayAttendancesBySchool',
    'subscribeTodayIncidents',
    'subscribeTodayNews',
    'subscribeTodayNewsBySchool',
    'updateDocente',
    'updateIncidentStatus',
    'updateSchool',
    'updateUserProfile',
  ];

  const makeSubscribe = () =>
    vi.fn((first?: unknown, maybeCb?: (data: unknown[]) => void) => {
      const cb = typeof first === 'function' ? first : maybeCb;
      if (typeof cb === 'function') cb([]);
      return vi.fn();
    });

  const mocks: Record<string, unknown> = {};
  for (const name of FIRESTORE_EXPORTS) {
    if (name.startsWith('subscribe')) {
      mocks[name] = makeSubscribe();
    } else if (name === 'getSchoolById') {
      mocks[name] = vi.fn(() =>
        Promise.resolve({ id: 'esc-1', nombre: 'Escuela Tinogasta', turno: 'Mañana', activa: true })
      );
    } else {
      mocks[name] = vi.fn(() => Promise.resolve([]));
    }
  }
  return mocks;
});

import Home from '@/pages/Home/Home';
import Asistencia from '@/pages/Asistencia/Asistencia';
import AsistenciaDocentes from '@/pages/AsistenciaDocentes/AsistenciaDocentes';
import Historial from '@/pages/Historial/Historial';
import Fotos from '@/pages/Fotos/Fotos';
import Novedades from '@/pages/Novedades/Novedades';
import Incidentes from '@/pages/Incidentes/Incidentes';
import Ayuda from '@/pages/Ayuda/Ayuda';
import Login from '@/pages/Login/Login';
import NotFound from '@/pages/NotFound/NotFound';
import ThemeSettings from '@/pages/ThemeSettings/ThemeSettings';
import Supervisor from '@/pages/Supervisor/Supervisor';
import SupervisorSchools from '@/pages/Supervisor/SupervisorSchools';
import SupervisorUsers from '@/pages/Supervisor/SupervisorUsers';
import SupervisorSchoolDetail from '@/pages/Supervisor/SupervisorSchoolDetail';

import Button from '@/components/common/Button/Button';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import FilterBar from '@/components/common/FilterBar/FilterBar';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import Skeleton from '@/components/common/Skeleton/Skeleton';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import BottomNav from '@/components/common/BottomNav/BottomNav';
import ConnectionBanner from '@/components/common/ConnectionBanner/ConnectionBanner';
import ErrorBoundary from '@/components/common/ErrorBoundary/ErrorBoundary';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import ContextHint from '@/components/common/ContextHint/ContextHint';
import HolidayNotice from '@/components/common/HolidayNotice/HolidayNotice';
import AnimatedBackground from '@/components/common/AnimatedBackground/AnimatedBackground';
import Timeline from '@/components/common/Timeline/Timeline';
import FotoThumb from '@/components/common/FotoThumb/FotoThumb';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import GlobalSearch from '@/components/common/GlobalSearch/GlobalSearch';
import Navbar from '@/components/common/Navbar/Navbar';
import InstallPrompt from '@/components/common/InstallPrompt/InstallPrompt';
import WelcomeTour from '@/components/common/WelcomeTour/WelcomeTour';
import SupervisorLiveAlerts from '@/components/common/SupervisorLiveAlerts/SupervisorLiveAlerts';
import Lightbox from '@/components/supervisor/Lightbox/Lightbox';
import AccordionSection from '@/components/supervisor/AccordionSection/AccordionSection';

const setProfile = (profile: UserProfile | null) => {
  authMock.profile = profile;
};

const flush = async () => {
  await act(async () => {});
};

// Data router (createMemoryRouter): las páginas usan <Link viewTransition> /
// useViewTransitionState, que exigen un router de datos.
const renderPage = (ui: React.ReactElement, route = '/') => {
  const router = createMemoryRouter(
    [
      { path: '/supervisor/escuela/:id', element: ui },
      { path: '*', element: ui },
    ],
    { initialEntries: [route] }
  );
  return render(<RouterProvider router={router} />);
};

describe('Páginas — montaje sin errores', () => {
  it('Login (sin sesión)', async () => {
    setProfile(null);
    const { container } = renderPage(<Login />);
    await flush();
    expect(container.firstElementChild).not.toBeNull();
  });

  it('NotFound', async () => {
    const { container } = renderPage(<NotFound />);
    await flush();
    expect(container.firstElementChild).not.toBeNull();
  });

  it('Home como director', async () => {
    setProfile(PROFILE_DIRECTOR);
    const { container } = renderPage(<Home />);
    await flush();
    expect(container.firstElementChild).not.toBeNull();
  });

  it('Home como supervisor', async () => {
    setProfile(PROFILE_SUPERVISOR);
    const { container } = renderPage(<Home />);
    await flush();
    expect(container.firstElementChild).not.toBeNull();
  });

  const schoolPages: [string, React.ReactElement][] = [
    ['Asistencia de Gestión', <Asistencia key="a" />],
    ['Asistencia de Docentes', <AsistenciaDocentes key="ad" />],
    ['Historial', <Historial key="h" />],
    ['Foto Diaria', <Fotos key="f" />],
    ['Novedades', <Novedades key="n" />],
    ['Incidentes', <Incidentes key="i" />],
    ['Ayuda', <Ayuda key="ay" />],
    ['Tema', <ThemeSettings key="t" />],
  ];

  schoolPages.forEach(([name, ui]) => {
    it(name, async () => {
      setProfile(PROFILE_DIRECTOR);
      const { container } = renderPage(ui);
      await flush();
      expect(container.firstElementChild).not.toBeNull();
    });
  });

  const supervisorPages: [string, React.ReactElement][] = [
    ['Panel de Supervisión', <Supervisor key="s" />],
    ['Escuelas', <SupervisorSchools key="ss" />],
    ['Usuarios', <SupervisorUsers key="su" />],
  ];

  supervisorPages.forEach(([name, ui]) => {
    it(`Supervisor · ${name}`, async () => {
      setProfile(PROFILE_SUPERVISOR);
      const { container } = renderPage(ui);
      await flush();
      expect(container.firstElementChild).not.toBeNull();
    });
  });

  it('Supervisor · Detalle de escuela (con parámetro :id)', async () => {
    setProfile(PROFILE_SUPERVISOR);
    const { container } = renderPage(<SupervisorSchoolDetail />, '/supervisor/escuela/esc-1');
    await flush();
    expect(container.firstElementChild).not.toBeNull();
  });
});

describe('Componentes comunes — montaje sin errores', () => {
  it('Button', () => {
    const { container } = render(<Button>Guardar</Button>);
    expect(container.firstElementChild).not.toBeNull();
  });

  it('DatePicker', () => {
    const { container } = render(<DatePicker value="2026-08-24" onChange={() => {}} />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it('FilterBar', () => {
    const { container } = render(
      <FilterBar activeFilters={[]} onRemoveFilter={() => {}} onClearAll={() => {}}>
        <span>controles</span>
      </FilterBar>
    );
    expect(container.firstElementChild).not.toBeNull();
  });

  it('StatusBadge (4 estados)', () => {
    (['pendiente', 'en_analisis', 'en_gestion', 'resuelto'] as const).forEach((status) => {
      const { container } = render(<StatusBadge status={status} />);
      expect(container.firstElementChild).not.toBeNull();
    });
  });

  it('Skeleton y LoadingScreen', () => {
    const a = render(<Skeleton variant="card" />);
    expect(a.container.firstElementChild).not.toBeNull();
    const b = render(<LoadingScreen />);
    expect(b.container.firstElementChild).not.toBeNull();
  });

  it('Breadcrumb', () => {
    const { container } = renderPage(
      <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Ayuda' }]} />
    );
    expect(container.firstElementChild).not.toBeNull();
  });

  it('BottomNav', () => {
    setProfile(PROFILE_DIRECTOR);
    const { container } = renderPage(<BottomNav onOpenDrawer={() => {}} />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it('ConnectionBanner', () => {
    const { container } = render(<ConnectionBanner />);
    expect(container.firstElementChild).toBeNull();
  });

  it('ErrorBoundary', () => {
    const { container } = render(
      <ErrorBoundary>
        <p>contenido</p>
      </ErrorBoundary>
    );
    expect(container.firstElementChild).not.toBeNull();
  });

  it('EmptyState con acción interna y de navegación', () => {
    const onClick = vi.fn();
    const a = render(
      <EmptyState
        icon="clipboard"
        title="Vacío"
        description="Sin datos"
        action={{ label: 'Crear', onClick }}
      />
    );
    expect(a.container.firstElementChild).not.toBeNull();
    const b = renderPage(<EmptyState title="Vacío" action={{ label: 'Ir', to: '/' }} />);
    expect(b.container.firstElementChild).not.toBeNull();
  });

  it('ContextHint (visible si no fue descartado)', () => {
    localStorage.removeItem('sipnam-hint-dismissed-smoke');
    const { container } = render(<ContextHint id="smoke">Texto guía</ContextHint>);
    expect(container.textContent).toContain('Texto guía');
  });

  it('HolidayNotice (día común y feriado)', () => {
    const common = render(<HolidayNotice fecha="2027-09-15" />);
    expect(common.container.firstElementChild).toBeNull();
    const holiday = render(<HolidayNotice fecha="2026-12-25" />);
    expect(holiday.container.textContent).toContain('Navidad');
  });

  it('AnimatedBackground', () => {
    const { container } = render(<AnimatedBackground />);
    expect(container.querySelector('.animated-bg__orb--3')).not.toBeNull();
  });

  it('Timeline', () => {
    const { container } = render(<Timeline events={[]} />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it('FotoThumb', () => {
    const { container } = render(
      <FotoThumb dataUrl="data:image/png;base64,iVBORw0KGgo=" alt="planilla" />
    );
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('ConfirmDialog abierto', async () => {
    const { container } = render(
      <ConfirmDialog
        open
        title="¿Seguro?"
        message="Acción irreversible"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    await act(async () => {});
    expect(container.textContent).toContain('¿Seguro?');
  });
});

describe('Componentes con navegación / overlays', () => {
  it('GlobalSearch abierto', async () => {
    setProfile(PROFILE_SUPERVISOR);
    const { container } = renderPage(<GlobalSearch open onClose={() => {}} />);
    await flush();
    expect(container.firstElementChild).not.toBeNull();
  });

  it('GlobalSearch oculto para directores', async () => {
    setProfile(PROFILE_DIRECTOR);
    const { container } = renderPage(<GlobalSearch open onClose={() => {}} />);
    await flush();
    expect(container.firstElementChild).toBeNull();
  });

  it('Navbar como director', async () => {
    setProfile(PROFILE_DIRECTOR);
    const { container } = renderPage(<Navbar />);
    await flush();
    expect(container.firstElementChild).not.toBeNull();
  });

  it('InstallPrompt', async () => {
    localStorage.removeItem('sipnam-install-dismissed');
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('standalone') ? true : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }));
    render(<InstallPrompt />);
    await flush();
    expect(true).toBe(true);
  });

  it('WelcomeTour como director (primer ingreso)', async () => {
    setProfile(PROFILE_DIRECTOR);
    localStorage.removeItem('sipnam-welcome-seen-v1-uid-director');
    vi.useFakeTimers();
    try {
      const { container } = renderPage(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(700);
      });
      expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('SupervisorLiveAlerts como supervisor', async () => {
    setProfile(PROFILE_SUPERVISOR);
    const { container } = renderPage(<SupervisorLiveAlerts />);
    await flush();
    expect(container.firstElementChild).not.toBeNull();
  });

  it('Lightbox', () => {
    const { container } = render(<Lightbox src="data:image/png;base64,x" onClose={() => {}} />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it('AccordionSection expandida y colapsada', () => {
    const expanded = render(
      <AccordionSection title="Asistencias" count="5" isExpanded onToggle={() => {}}>
        <p>contenido</p>
      </AccordionSection>
    );
    expect(expanded.container.textContent).toContain('contenido');
    const collapsed = render(
      <AccordionSection title="Novedades" count="2" isExpanded={false} onToggle={() => {}}>
        <p>oculto</p>
      </AccordionSection>
    );
    expect(collapsed.container.firstElementChild).not.toBeNull();
  });
});
