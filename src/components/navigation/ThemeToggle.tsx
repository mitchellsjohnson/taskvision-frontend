import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/theme-context';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Listen to system theme changes
  useEffect(() => {
    // Check if window.matchMedia is available (not in test environment)
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery) {
        setSystemPrefersDark(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
          setSystemPrefersDark(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, []);

  // Determine the effective theme (what's actually being displayed)
  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return theme;
  };

  const handleToggle = () => {
    const effectiveTheme = getEffectiveTheme();
    // Simple binary toggle: light <-> dark
    setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
  };

  const getIcon = () => {
    const effectiveTheme = getEffectiveTheme();
    
    if (effectiveTheme === 'light') {
      // Currently light, show sun (click to go dark)
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
        </svg>
      );
    } else {
      // Currently dark, show moon (click to go light)
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      );
    }
  };

  const getTitle = () => {
    const effectiveTheme = getEffectiveTheme();
    return effectiveTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-center w-8 h-8 transition-colors"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
      title={getTitle()}
      aria-label={getTitle()}
    >
      {getIcon()}
    </button>
  );
};
