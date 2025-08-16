import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginButton } from '../login-button';

// Mock the useAuth0 hook
const mockLoginWithRedirect = jest.fn();
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithRedirect: mockLoginWithRedirect
  })
}));

describe('LoginButton', () => {
  beforeEach(() => {
    mockLoginWithRedirect.mockClear();
  });

  it('renders the login button', () => {
    render(<LoginButton />);
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('calls loginWithRedirect with correct parameters when clicked', async () => {
    render(<LoginButton />);

    const loginButton = screen.getByText('Log In');
    await fireEvent.click(loginButton);

    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      prompt: 'login',
      appState: {
        returnTo: '/dashboard'
      }
    });
  });
});
