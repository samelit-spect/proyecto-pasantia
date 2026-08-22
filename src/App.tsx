import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';

const STORAGE_KEY = 'sipnam-theme';

const applySavedTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const theme = JSON.parse(saved);
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty('--primary-color', theme.primary);
    if (theme.primaryLight) root.style.setProperty('--primary-light', theme.primaryLight);
    if (theme.mode === 'dark') {
      root.style.setProperty('--background-color', '#0f172a');
      root.style.setProperty('--surface-color', '#1e293b');
      root.style.setProperty('--text-color', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--border-color', '#334155');
    }
  } catch {
    /* ignore */
  }
};

const App = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    applySavedTheme();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
};

export default App;
