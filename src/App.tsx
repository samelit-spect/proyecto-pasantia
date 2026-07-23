import { AuthProvider } from '@/context/AuthContext';

const App = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default App;
