import { useEffect, useState } from 'react';
import { themes, type ThemeId, type Theme } from '@/lib/themes';

const STORAGE_KEY = 'pinepomo-theme';

function applyTheme(theme: Theme) {
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
}

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return 'forest';
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ThemeId) || 'forest';
  });

  const theme = themes[themeId];

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId, theme]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  return { theme, themeId, setTheme };
}
