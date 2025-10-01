import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { userSettingsApi } from '../services/user-settings-api';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: Theme; storageKey?: string }> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'taskvision-theme',
}) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading: authLoading } = useAuth0();
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      let systemTheme = 'light'; // default fallback
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        systemTheme = mediaQuery && mediaQuery.matches ? 'dark' : 'light';
      }
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (!mediaQuery) {
      return;
    }
    
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.add(newSystemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Load theme from backend when user is authenticated
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!isAuthenticated || authLoading) return;

      try {
        setIsLoading(true);
        const accessToken = await getAccessTokenSilently();
        const settings = await userSettingsApi.getSettings(accessToken);
        if (settings.theme !== theme) {
          setTheme(settings.theme);
          localStorage.setItem(storageKey, settings.theme);
        }
      } catch (error) {
        console.error('Failed to load theme from backend:', error);
        // Continue with localStorage value
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [isAuthenticated, authLoading, getAccessTokenSilently, storageKey, theme]);

  const handleSetTheme = async (newTheme: Theme) => {
    // Update local state immediately
    setTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);

    // Persist to backend if authenticated
    if (isAuthenticated) {
      try {
        const accessToken = await getAccessTokenSilently();
        await userSettingsApi.updateSettings(accessToken, { theme: newTheme });
      } catch (error) {
        console.error('Failed to save theme to backend:', error);
        // Continue with local state - user will still see the change
      }
    }
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
    isLoading,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}; 