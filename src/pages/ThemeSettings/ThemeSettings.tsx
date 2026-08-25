import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Check } from 'lucide-react';
import {
  loadTheme,
  saveTheme,
  clearTheme,
  applyTheme,
  type ThemeState,
} from '@/utils/theme';
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

const ThemeSettings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeState>(loadTheme);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleSave = () => {
    saveTheme(theme);
    applyTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults: ThemeState = { primary: '#1e40af', primaryLight: '#3b82f6', mode: 'light' };
    setTheme(defaults);
    clearTheme();
  };

  return (
    <>
      <div className="supervisor__header">
        <button
          className="supervisor__back"
          onClick={() => navigate('/', { viewTransition: true })}
        >
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
