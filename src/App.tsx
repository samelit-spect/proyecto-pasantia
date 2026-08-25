import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { loadTheme, applyTheme } from '@/utils/theme';

const App = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    applyTheme(loadTheme());
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
};

export default App;
