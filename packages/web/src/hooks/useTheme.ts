import { useEffect, useState } from 'react';
import { themes, type ThemeId, type Theme } from '@/lib/themes';

const THEME_KEY = 'pinepomo-theme';
const MODE_KEY = 'pinepomo-mode';

export type Mode = 'light' | 'dark';

function applyTheme(theme: Theme, mode: Mode) {
  const root = document.documentElement;
  const { primary, accent } = theme.colors;

  // Apply primary colors
  root.style.setProperty('--color-primary-50', primary[50]);
  root.style.setProperty('--color-primary-100', primary[100]);
  root.style.setProperty('--color-primary-400', primary[400]);
  root.style.setProperty('--color-primary-500', primary[500]);
  root.style.setProperty('--color-primary-600', primary[600]);
  root.style.setProperty('--color-primary-700', primary[700]);

  // Apply accent colors
  root.style.setProperty('--color-accent-400', accent[400]);
  root.style.setProperty('--color-accent-500', accent[500]);
  root.style.setProperty('--color-accent-600', accent[600]);

  // Apply mode (light/dark)
  if (mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return 'forest';
    const stored = localStorage.getItem(THEME_KEY);
    return (stored as ThemeId) || 'forest';
  });

  const [mode, setModeState] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(MODE_KEY);
    return (stored as Mode) || 'dark';
  });

  const theme = themes[themeId];

  useEffect(() => {
    applyTheme(theme, mode);
    localStorage.setItem(THEME_KEY, themeId);
    localStorage.setItem(MODE_KEY, mode);
  }, [themeId, theme, mode]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  const setMode = (m: Mode) => {
    setModeState(m);
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, themeId, setTheme, mode, setMode, toggleMode };
}
