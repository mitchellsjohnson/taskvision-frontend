// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Auth0 with more complete mock
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token')
  }),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock ThemeContext to prevent "useTheme must be used within a ThemeProvider" errors
vi.mock('./contexts/theme-context', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    isLoading: false
  })
}));

// Mock FontSizeContext
vi.mock('./contexts/font-size-context', () => ({
  FontSizeProvider: ({ children }: { children: React.ReactNode }) => children,
  useFontSize: () => ({
    fontSize: 'medium',
    setFontSize: vi.fn()
  })
}));

// Mock AccessibilityContext
vi.mock('./contexts/accessibility-context', () => ({
  AccessibilityProvider: ({ children }: { children: React.ReactNode }) => children,
  useAccessibility: () => ({
    settings: {
      reducedMotion: false,
      highContrast: false,
      alwaysShowFocus: false,
    },
    updateSetting: vi.fn(),
    isLoading: false,
  })
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' })
  };
});

// API mocks removed - individual test files handle their own mocks to avoid conflicts

// Wellness API mock removed - individual test files handle their own mocks

vi.mock('./services/tvagent-api', () => ({
  sendMessage: vi.fn().mockResolvedValue({ response: 'Mock response' })
}));

vi.mock('./services/tvagent-v2-api', () => ({
  sendMessage: vi.fn().mockResolvedValue({ response: 'Mock response' })
}));

// Set test environment variables to disable retry logic
process.env.NODE_ENV = 'test';
process.env.REACT_APP_DISABLE_RETRIES = 'true';

// Mock axios to catch any unmocked API calls
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })),
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} })
  }
}));
