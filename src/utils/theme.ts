const STORAGE_KEY = 'sipnam-theme';

export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  primary: string;
  primaryLight: string;
  mode: ThemeMode;
}

const DARK_VARS: Record<string, string> = {
  '--background-color': '#0f172a',
  '--surface-color': '#1e293b',
  '--card-bg': '#243244',
  '--card-shadow': '0 1px 3px -1px rgba(0,0,0,0.5), 0 2px 8px -2px rgba(0,0,0,0.5)',
  '--text-color': '#f1f5f9',
  '--text-secondary': '#94a3b8',
  '--text-primary': '#f1f5f9',
  '--border-color': '#334155',
  '--accent-green-bg': '#052e16',
  '--accent-green-surface': '#14532d',
  '--accent-green-text': '#4ade80',
  '--accent-blue-bg': '#172554',
  '--accent-blue-surface': '#1e3a5f',
  '--accent-blue-text': '#60a5fa',
  '--accent-red-bg': '#450a0a',
  '--accent-red-surface': '#7f1d1d',
  '--accent-red-text': '#f87171',
  '--accent-yellow-bg': '#451a03',
  '--accent-yellow-surface': '#78350f',
  '--accent-yellow-text': '#fbbf24',
  '--accent-purple-bg': '#2e1065',
  '--accent-purple-surface': '#4c1d95',
  '--accent-purple-text': '#c4b5fd',
  '--accent-teal-bg': '#042f2e',
  '--accent-teal-surface': '#134e4a',
  '--accent-teal-text': '#5eead4',
};

const LIGHT_VARS: Record<string, string> = {
  '--background-color': '#f8fafc',
  '--surface-color': '#ffffff',
  '--card-bg': '#ffffff',
  '--card-shadow': '0 1px 2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.08)',
  '--text-color': '#1e293b',
  '--text-secondary': '#64748b',
  '--text-primary': '#1e293b',
  '--border-color': '#e2e8f0',
  '--accent-green-bg': '#f0fdf4',
  '--accent-green-surface': '#dcfce7',
  '--accent-green-text': '#166534',
  '--accent-blue-bg': '#eff6ff',
  '--accent-blue-surface': '#dbeafe',
  '--accent-blue-text': '#1e40af',
  '--accent-red-bg': '#fef2f2',
  '--accent-red-surface': '#fecaca',
  '--accent-red-text': '#dc2626',
  '--accent-yellow-bg': '#fffbeb',
  '--accent-yellow-surface': '#fde68a',
  '--accent-yellow-text': '#b45309',
  '--accent-purple-bg': '#faf5ff',
  '--accent-purple-surface': '#f3e8ff',
  '--accent-purple-text': '#7c3aed',
  '--accent-teal-bg': '#f0fdfa',
  '--accent-teal-surface': '#ccfbf1',
  '--accent-teal-text': '#0d9488',
};

export const DEFAULT_THEME: ThemeState = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  mode: 'light',
};

function transitionThemeColors() {
  const root = document.documentElement;
  root.classList.add('theme-transitioning');
  window.setTimeout(() => root.classList.remove('theme-transitioning'), 350);
}

export function applyTheme(theme: ThemeState, animate = false) {
  const root = document.documentElement;
  if (animate) transitionThemeColors();
  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--primary-light', theme.primaryLight);

  const vars = theme.mode === 'dark' ? DARK_VARS : LIGHT_VARS;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function loadTheme(): ThemeState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_THEME, ...JSON.parse(saved) };
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme: ThemeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    /* ignore */
  }
}

export function clearTheme() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  applyTheme(DEFAULT_THEME);
}
