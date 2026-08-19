import { Suspense } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from '@/App';
import ErrorBoundary from '@/components/common/ErrorBoundary/ErrorBoundary';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';
import { ToastProvider } from '@/context/ToastContext';
import router from '@/routes';
import '@/styles/global.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <ToastProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
          </Suspense>
        </ErrorBoundary>
      </ToastProvider>
    </App>
  </StrictMode>
);
