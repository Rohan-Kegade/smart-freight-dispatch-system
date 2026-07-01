import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { palettes, type ThemeName, type ThemePalette } from '@/lib/theme';

interface ThemeState {
  theme: ThemeName;
  colors: ThemePalette;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
}

const THEME_KEY = 'freight_theme';

function getInitialTheme(): ThemeName {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function setTheme(next: ThemeName) { setThemeState(next); }
  function toggleTheme() { setThemeState(t => (t === 'dark' ? 'light' : 'dark')); }

  return (
    <ThemeContext.Provider value={{ theme, colors: palettes[theme], toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
