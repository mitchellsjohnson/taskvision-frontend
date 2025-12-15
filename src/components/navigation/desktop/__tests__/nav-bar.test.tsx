import React from 'react';
import { vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { NavBar } from '../nav-bar';
import { useAuth0 } from '@auth0/auth0-react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

const mockedUseAuth0 = useAuth0 as any;

// Mock child components
vi.mock('../nav-bar-brand', () => ({
  NavBarBrand: () => <div data-testid="nav-bar-brand">Brand</div>,
}));
vi.mock('../nav-bar-tabs', () => ({
  NavBarTabs: () => <div data-testid="nav-bar-tabs">Tabs</div>,
}));
// Create a simple mock that we can control from tests
let mockIsAuthenticated = false;

vi.mock('../nav-bar-buttons', () => ({
  NavBarButtons: () => (
    <div data-testid="nav-bar-buttons">
      {!mockIsAuthenticated && <button data-testid="login-button">Log In</button>}
      {mockIsAuthenticated && <button data-testid="logout-button">Log Out</button>}
    </div>
  ),
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
    beforeEach(() => {
      mockIsAuthenticated = false;
      mockedUseAuth0.mockReturnValue({ isAuthenticated: false });
    });

    it('renders the login button', () => {
      renderNavBar();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });

    it('does not render the settings button', () => {
      renderNavBar();
      expect(screen.queryByTitle('Settings')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockIsAuthenticated = true;
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
