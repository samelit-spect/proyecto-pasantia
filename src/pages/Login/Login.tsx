import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/utils/authErrors';
import Button from '@/components/common/Button/Button';
import AnimatedBackground from '@/components/common/AnimatedBackground/AnimatedBackground';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/', { viewTransition: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <AnimatedBackground />
      <div className="login__card">
        <h1 className="login__title">SIPNAM</h1>
        <p className="login__subtitle">
          Sistema Integrado de Partes de Novedades y Asistencias Móvil
        </p>

        <form onSubmit={handleSubmit} className="login__form">
          <div className="login__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="login__field">
            <label htmlFor="password">Contraseña</label>
            <div className="login__password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login__password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff size={16} strokeWidth={1.5} />
                ) : (
                  <Eye size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="login__error" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" loading={isLoading} className="login__button">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
