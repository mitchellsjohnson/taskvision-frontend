import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { MobileNavBarButtons } from '../mobile-nav-bar-buttons';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

const mockedUseAuth0 = useAuth0 as jest.Mock;

// Mock child components
jest.mock('../../../buttons/login-button', () => ({
  LoginButton: () => <button data-testid="login-button">Log In</button>,
}));
jest.mock('../../../buttons/logout-button', () => ({
  LogoutButton: () => <button data-testid="logout-button">Log Out</button>,
}));

describe('MobileNavBarButtons', () => {
  afterEach(() => {
    mockedUseAuth0.mockClear();
  });

  describe('when unauthenticated', () => {
    it('renders the login button', () => {
      mockedUseAuth0.mockReturnValueOnce({ isAuthenticated: false });
      render(<MobileNavBarButtons />);
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
        mockedUseAuth0.mockReturnValue({ isAuthenticated: true });
    });

    it('renders the logout button', () => {
      render(<MobileNavBarButtons />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
    });
  });
}); 