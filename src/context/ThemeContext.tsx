import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [storedTheme, setStoredTheme] = useLocalStorage<string>(STORAGE_KEYS.THEME, 'light');
  const theme: Theme = storedTheme === 'dark' ? 'dark' : 'light';

  // Update HTML class → Tailwind dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setStoredTheme(next), [setStoredTheme]);
  const toggleTheme = useCallback(
    () => setStoredTheme(theme === 'dark' ? 'light' : 'dark'),
    [setStoredTheme, theme],
  );

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}