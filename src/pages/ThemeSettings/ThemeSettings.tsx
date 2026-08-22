import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Check } from 'lucide-react';
import './ThemeSettings.css';

const PRESET_COLORS = [
  { name: 'Azul', value: '#1e40af', light: '#3b82f6' },
  { name: 'Índigo', value: '#4338ca', light: '#6366f1' },
  { name: 'Violeta', value: '#6d28d9', light: '#8b5cf6' },
  { name: 'Rosa', value: '#be185d', light: '#ec4899' },
  { name: 'Rojo', value: '#b91c1c', light: '#ef4444' },
  { name: 'Naranja', value: '#c2410c', light: '#f97316' },
  { name: 'Ámbar', value: '#b45309', light: '#f59e0b' },
  { name: 'Verde', value: '#15803d', light: '#22c55e' },
  { name: 'Teal', value: '#0f766e', light: '#14b8a6' },
  { name: 'Gris', value: '#374151', light: '#6b7280' },
];

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  primary: string;
  primaryLight: string;
  mode: ThemeMode;
}

const STORAGE_KEY = 'sipnam-theme';

const loadTheme = (): ThemeState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return { primary: '#1e40af', primaryLight: '#3b82f6', mode: 'light' };
};

const applyTheme = (theme: ThemeState) => {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--primary-light', theme.primaryLight);

  if (theme.mode === 'dark') {
    root.style.setProperty('--background-color', '#0f172a');
    root.style.setProperty('--surface-color', '#1e293b');
    root.style.setProperty('--text-color', '#f1f5f9');
    root.style.setProperty('--text-secondary', '#94a3b8');
    root.style.setProperty('--border-color', '#334155');
    root.style.setProperty('--accent-green-bg', '#052e16');
    root.style.setProperty('--accent-green-surface', '#14532d');
    root.style.setProperty('--accent-green-text', '#4ade80');
    root.style.setProperty('--accent-blue-bg', '#172554');
    root.style.setProperty('--accent-blue-surface', '#1e3a5f');
    root.style.setProperty('--accent-blue-text', '#60a5fa');
    root.style.setProperty('--accent-red-bg', '#450a0a');
    root.style.setProperty('--accent-red-surface', '#7f1d1d');
    root.style.setProperty('--accent-red-text', '#f87171');
    root.style.setProperty('--accent-yellow-bg', '#451a03');
    root.style.setProperty('--accent-yellow-surface', '#78350f');
    root.style.setProperty('--accent-yellow-text', '#fbbf24');
  } else {
    root.style.setProperty('--background-color', '#f8fafc');
    root.style.setProperty('--surface-color', '#ffffff');
    root.style.setProperty('--text-color', '#1e293b');
    root.style.setProperty('--text-secondary', '#64748b');
    root.style.setProperty('--border-color', '#e2e8f0');
    root.style.setProperty('--accent-green-bg', '#f0fdf4');
    root.style.setProperty('--accent-green-surface', '#dcfce7');
    root.style.setProperty('--accent-green-text', '#166534');
    root.style.setProperty('--accent-blue-bg', '#eff6ff');
    root.style.setProperty('--accent-blue-surface', '#dbeafe');
    root.style.setProperty('--accent-blue-text', '#1e40af');
    root.style.setProperty('--accent-red-bg', '#fef2f2');
    root.style.setProperty('--accent-red-surface', '#fecaca');
    root.style.setProperty('--accent-red-text', '#dc2626');
    root.style.setProperty('--accent-yellow-bg', '#fffbeb');
    root.style.setProperty('--accent-yellow-surface', '#fde68a');
    root.style.setProperty('--accent-yellow-text', '#b45309');
  }
};

const ThemeSettings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeState>(loadTheme);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    applyTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults: ThemeState = { primary: '#1e40af', primaryLight: '#3b82f6', mode: 'light' };
    setTheme(defaults);
    localStorage.removeItem(STORAGE_KEY);
    applyTheme(defaults);
  };

  return (
    <>
      <div className="supervisor__header">
        <button className="supervisor__back" onClick={() => navigate('/')}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">Apariencia</h2>
      </div>
      <p className="supervisor__subtitle">Personalizá los colores y el tema de la aplicación.</p>

      <div className="theme-settings">
        <div className="theme-settings__section">
          <h3 className="theme-settings__section-title">
            <Palette size={16} strokeWidth={1.5} />
            Color principal
          </h3>
          <div className="theme-settings__colors">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                className={`theme-settings__color ${theme.primary === c.value ? 'theme-settings__color--active' : ''}`}
                style={{ backgroundColor: c.value }}
                onClick={() =>
                  setTheme((prev) => ({ ...prev, primary: c.value, primaryLight: c.light }))
                }
                title={c.name}
              >
                {theme.primary === c.value && <Check size={14} strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>

        <div className="theme-settings__section">
          <h3 className="theme-settings__section-title">Tema</h3>
          <div className="theme-settings__modes">
            <button
              className={`theme-settings__mode ${theme.mode === 'light' ? 'theme-settings__mode--active' : ''}`}
              onClick={() => setTheme((prev) => ({ ...prev, mode: 'light' }))}
            >
              <span className="theme-settings__mode-icon">☀️</span>
              Claro
            </button>
            <button
              className={`theme-settings__mode ${theme.mode === 'dark' ? 'theme-settings__mode--active' : ''}`}
              onClick={() => setTheme((prev) => ({ ...prev, mode: 'dark' }))}
            >
              <span className="theme-settings__mode-icon">🌙</span>
              Oscuro
            </button>
          </div>
        </div>

        <div className="theme-settings__preview">
          <h3 className="theme-settings__section-title">Vista previa</h3>
          <div className="theme-settings__preview-card">
            <div className="theme-settings__preview-btn" style={{ backgroundColor: theme.primary }}>
              Botón primario
            </div>
            <div className="theme-settings__preview-surface">Superficie de tarjeta</div>
          </div>
        </div>

        <div className="theme-settings__actions">
          <button className="theme-settings__save" onClick={handleSave}>
            {saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
          <button className="theme-settings__reset" onClick={handleReset}>
            Restablecer
          </button>
        </div>
      </div>
    </>
  );
};

export default ThemeSettings;
