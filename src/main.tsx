import { Suspense } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'motion/react';
import '@/utils/installPrompt';
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
      {/* strict: fuerza el uso de m.* en lugar de motion.* para mantener el bundle chico */}
      <LazyMotion features={domAnimation} strict>
        <ToastProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <RouterProvider router={router} />
            </Suspense>
          </ErrorBoundary>
        </ToastProvider>
      </LazyMotion>
    </App>
  </StrictMode>
);
