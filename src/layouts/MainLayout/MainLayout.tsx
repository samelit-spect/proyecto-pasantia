import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar/Navbar';
import ConnectionBanner from '@/components/common/ConnectionBanner/ConnectionBanner';
import InstallPrompt from '@/components/common/InstallPrompt/InstallPrompt';
import WelcomeTour from '@/components/common/WelcomeTour/WelcomeTour';
import SupervisorLiveAlerts from '@/components/common/SupervisorLiveAlerts/SupervisorLiveAlerts';
import RealtimeNotifications from '@/components/common/RealtimeNotifications/RealtimeNotifications';
import ChangelogModal from '@/components/common/ChangelogModal/ChangelogModal';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';
import './MainLayout.css';

const PROTECTED_ROUTES = [
  '/asistencia',
  '/asistencia-docentes',
  '/historial',
  '/fotos',
  '/novedades',
  '/incidentes',
  '/supervisor',
];

const MainLayout = () => {
  const { isAuthenticated, isLoading, canAccess } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isProtected = PROTECTED_ROUTES.some((route) => location.pathname.startsWith(route));
  if (isProtected && !canAccess(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <ConnectionBanner />
      <InstallPrompt />
      <WelcomeTour />
      <SupervisorLiveAlerts />
      <RealtimeNotifications />
      <ChangelogModal />
      <main className="main-layout__content" style={{ viewTransitionName: 'page-content' }}>
        <Outlet key={location.pathname} />
      </main>
    </>
  );
};

export default MainLayout;
