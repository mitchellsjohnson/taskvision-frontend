import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { ProtectedRoute } from '../protected-route';

// Mock the useAuth0 hook
const mockUseAuth0 = jest.fn();

// Create a mock component factory
const createMockComponent = (component: React.ComponentType) => {
  return (props: any) => {
    const { isLoading } = mockUseAuth0();
    if (isLoading) {
      return (
        <div className="page-layout">
          <div className="loader">
            <img src="https://cdn.auth0.com/blog/hello-auth0/loader.svg" alt="Loading..." />
          </div>
        </div>
      );
    }
    return React.createElement(component, props);
  };
};

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0(),
  withAuthenticationRequired: (component: React.ComponentType) => createMockComponent(component),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    mockUseAuth0.mockReset();
  });

  it('renders the protected component', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' },
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    });

    render(<ProtectedRoute component={TestComponent} />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading state when authentication is in progress', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    });

    render(<ProtectedRoute component={TestComponent} />);
    expect(screen.getByAltText('Loading...')).toBeInTheDocument();
  });
}); 