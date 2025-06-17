import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavBarTabs } from '../nav-bar-tabs';
import { useAuth0 } from '@auth0/auth0-react';

// Mock the useAuth0 hook
jest.mock('@auth0/auth0-react', () => ({
  __esModule: true,
  useAuth0: jest.fn(),
}));

const useAuth0Mock = useAuth0 as jest.Mock;

describe('NavBarTabs', () => {
  beforeEach(() => {
    useAuth0Mock.mockClear();
  });

  it('renders tabs when authenticated', () => {
    useAuth0Mock.mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <NavBarTabs />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('does not render tabs when not authenticated', () => {
    useAuth0Mock.mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter>
        <NavBarTabs />
      </MemoryRouter>
    );

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
  });
}); 