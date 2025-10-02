import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { userSettingsApi } from '../services/user-settings-api';

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  alwaysShowFocus: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  isLoading: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading: authLoading } = useAuth0();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    alwaysShowFocus: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load from localStorage first
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved accessibility settings:', error);
      }
    }

    // Respect OS reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery && mediaQuery.matches && !savedSettings) {
        setSettings(prev => ({ ...prev, reducedMotion: true }));
      }
    }
    return undefined;
  }, []);

  // Load accessibility settings from backend when user is authenticated
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!isAuthenticated || authLoading) return;

      try {
        setIsLoading(true);
        const accessToken = await getAccessTokenSilently();
        const userSettings = await userSettingsApi.getSettings(accessToken);
        if (userSettings.accessibility) {
          setSettings(userSettings.accessibility);
          localStorage.setItem('accessibilitySettings', JSON.stringify(userSettings.accessibility));
        }
      } catch (error) {
        console.error('Failed to load accessibility settings from backend:', error);
        // Continue with localStorage value
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [isAuthenticated, authLoading, getAccessTokenSilently]);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply always show focus
    if (settings.alwaysShowFocus) {
      root.classList.add('always-show-focus');
    } else {
      root.classList.remove('always-show-focus');
    }
  }, [settings]);

  const updateSetting = async (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    
    // Update local state immediately
    setSettings(newSettings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));

    // Persist to backend if authenticated
    if (isAuthenticated) {
      try {
        const accessToken = await getAccessTokenSilently();
        await userSettingsApi.updateSettings(accessToken, { accessibility: newSettings });
      } catch (error) {
        console.error('Failed to save accessibility settings to backend:', error);
        // Continue with local state - user will still see the change
      }
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, isLoading }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

