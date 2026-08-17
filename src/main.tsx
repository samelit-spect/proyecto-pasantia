import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from '@/App';
import ErrorBoundary from '@/components/common/ErrorBoundary/ErrorBoundary';
import router from '@/routes';
import '@/styles/global.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </App>
  </StrictMode>
);
