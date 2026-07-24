import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar/Navbar';

const PROTECTED_ROUTES = ['/asistencia', '/novedades', '/incidentes', '/supervisor'];

const MainLayout = () => {
  const { isAuthenticated, isLoading, canAccess } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <p>Cargando...</p>
      </div>
    );
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
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 1rem 2rem',
        }}
      >
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
