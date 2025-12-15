import React from 'react';
import { vi } from "vitest";
import { render, screen } from '../../../../test-utils';
import { MobileNavBarButtons } from '../mobile-nav-bar-buttons';

// Mock Auth0 specifically for this test
const mockUseAuth0 = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0(),
}));

// Mock child components
vi.mock('../../../buttons/login-button', () => ({
  LoginButton: () => <button data-testid="login-button">Log In</button>,
}));
vi.mock('../../../buttons/logout-button', () => ({
  LogoutButton: () => <button data-testid="logout-button">Log Out</button>,
}));

describe('MobileNavBarButtons', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseAuth0.mockClear();
  });

  describe('when unauthenticated', () => {
    it('renders the login button', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        user: null,
        isLoading: false,
        getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token')
      });
      
      render(<MobileNavBarButtons />);
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    it('renders the logout button', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: true,
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        user: null,
        isLoading: false,
        getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token')
      });
      
      render(<MobileNavBarButtons />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
    });
  });
}); 