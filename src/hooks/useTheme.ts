import { useState, useCallback } from 'react';
import { loadTheme, saveTheme, applyTheme, type ThemeState, type ThemeMode } from '@/utils/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeState>(loadTheme);

  const setTheme = useCallback((updater: ThemeState | ((prev: ThemeState) => ThemeState)) => {
    setThemeState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      applyTheme(next, true);
      saveTheme(next);
      return next;
    });
  }, []);

  const toggleMode = useCallback(() => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : ('dark' as ThemeMode),
    }));
  }, [setTheme]);

  return { theme, setTheme, toggleMode, isDark: theme.mode === 'dark' };
}
