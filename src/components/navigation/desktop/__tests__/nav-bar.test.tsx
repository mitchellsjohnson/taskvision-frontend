import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavBar } from '../nav-bar';
import { useAuth0 } from '@auth0/auth0-react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

const mockedUseAuth0 = useAuth0 as jest.Mock;

// Mock child components
jest.mock('../nav-bar-brand', () => ({
  NavBarBrand: () => <div data-testid="nav-bar-brand">Brand</div>,
}));
jest.mock('../nav-bar-tabs', () => ({
  NavBarTabs: () => <div data-testid="nav-bar-tabs">Tabs</div>,
}));
jest.mock('../nav-bar-buttons', () => ({
  NavBarButtons: () => <div data-testid="nav-bar-buttons">Buttons</div>,
}));
jest.mock('../../../buttons/login-button', () => ({
  LoginButton: () => <button data-testid="login-button">Log In</button>,
}));
jest.mock('../../../buttons/logout-button', () => ({
  LogoutButton: () => <button data-testid="logout-button">Log Out</button>,
}));

const renderNavBar = () => {
  return render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );
};

describe('NavBar', () => {
  afterEach(() => {
    mockedUseAuth0.mockClear();
  });

  describe('when unauthenticated', () => {
    it('renders the login button', () => {
      mockedUseAuth0.mockReturnValueOnce({ isAuthenticated: false });
      renderNavBar();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });

    it('does not render the settings button', () => {
      mockedUseAuth0.mockReturnValueOnce({ isAuthenticated: false });
      renderNavBar();
      expect(screen.queryByTitle('Settings')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockedUseAuth0.mockReturnValue({ isAuthenticated: true });
    });

    it('renders the logout button', () => {
      renderNavBar();
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
    });

    it('renders the settings button', () => {
      renderNavBar();
      expect(screen.getByTitle('Settings')).toBeInTheDocument();
    });
  });
});
