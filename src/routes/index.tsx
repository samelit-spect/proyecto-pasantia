import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout/MainLayout';
import Home from '@/pages/Home/Home';
import Login from '@/pages/Login/Login';
import Asistencia from '@/pages/Asistencia/Asistencia';
import Novedades from '@/pages/Novedades/Novedades';
import Incidentes from '@/pages/Incidentes/Incidentes';
import Supervisor from '@/pages/Supervisor/Supervisor';
import NotFound from '@/pages/NotFound/NotFound';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'asistencia',
        element: <Asistencia />,
      },
      {
        path: 'novedades',
        element: <Novedades />,
      },
      {
        path: 'incidentes',
        element: <Incidentes />,
      },
      {
        path: 'supervisor',
        element: <Supervisor />,
      },
      {
        path: 'supervisor/*',
        element: <Supervisor />,
      },
    ],
  },
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);

export default router;
