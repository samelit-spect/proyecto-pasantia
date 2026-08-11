import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import MainLayout from '@/layouts/MainLayout/MainLayout';

const load = (importFn: () => Promise<{ default: ComponentType }>) =>
  importFn().then((m) => ({ Component: m.default }));

const router = createBrowserRouter([
  {
    path: '/login',
    lazy: () => load(() => import('@/pages/Login/Login')),
  },
  {
    path: '/',
    element: <MainLayout />,
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
