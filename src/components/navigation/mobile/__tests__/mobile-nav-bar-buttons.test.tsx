import React from 'react';
import { render, screen } from '../../../../test-utils';
import { MobileNavBarButtons } from '../mobile-nav-bar-buttons';

// Mock Auth0 specifically for this test
const mockUseAuth0 = jest.fn();
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0(),
}));

// Mock child components
jest.mock('../../../buttons/login-button', () => ({
  LoginButton: () => <button data-testid="login-button">Log In</button>,
}));
jest.mock('../../../buttons/logout-button', () => ({
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
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        user: null,
        isLoading: false,
        getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token')
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
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        user: null,
        isLoading: false,
        getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token')
      });
      
      render(<MobileNavBarButtons />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
    });
  });
}); 