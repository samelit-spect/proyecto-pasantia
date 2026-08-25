import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import MainLayout from '@/layouts/MainLayout/MainLayout';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';

const load = (importFn: () => Promise<{ default: ComponentType }>) =>
  importFn().then((m) => ({ Component: m.default }));

const router = createBrowserRouter([
  {
    path: '/login',
    HydrateFallback: LoadingScreen,
    lazy: () => load(() => import('@/pages/Login/Login')),
  },
  {
    path: '/',
    element: <MainLayout />,
    HydrateFallback: LoadingScreen,
    children: [
      {
        index: true,
        lazy: () => load(() => import('@/pages/Home/Home')),
      },
      {
        path: 'asistencia',
        lazy: () => load(() => import('@/pages/Asistencia/Asistencia')),
      },
      {
        path: 'asistencia-docentes',
        lazy: () => load(() => import('@/pages/AsistenciaDocentes/AsistenciaDocentes')),
      },
      {
        path: 'historial',
        lazy: () => load(() => import('@/pages/Historial/Historial')),
      },
      {
        path: 'fotos',
        lazy: () => load(() => import('@/pages/Fotos/Fotos')),
      },
      {
        path: 'novedades',
        lazy: () => load(() => import('@/pages/Novedades/Novedades')),
      },
      {
        path: 'incidentes',
        lazy: () => load(() => import('@/pages/Incidentes/Incidentes')),
      },
      {
        path: 'tema',
        lazy: () => load(() => import('@/pages/ThemeSettings/ThemeSettings')),
      },
      {
        path: 'perfil',
        lazy: () => load(() => import('@/pages/Profile/Profile')),
      },
      {
        path: 'ayuda',
        lazy: () => load(() => import('@/pages/Ayuda/Ayuda')),
      },
      {
        path: 'supervisor',
        lazy: () => load(() => import('@/pages/Supervisor/Supervisor')),
        children: [
          {
            index: true,
            lazy: () => load(() => import('@/pages/Supervisor/SupervisorSchools')),
          },
          {
            path: 'escuela/:schoolId',
            lazy: () => load(() => import('@/pages/Supervisor/SupervisorSchoolDetail')),
          },
          {
            path: 'usuarios',
            lazy: () => load(() => import('@/pages/Supervisor/SupervisorUsers')),
          },
        ],
      },
    ],
  },
  {
    path: '/404',
    lazy: () => load(() => import('@/pages/NotFound/NotFound')),
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);

export default router;
