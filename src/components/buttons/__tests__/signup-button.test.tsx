import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignupButton } from '../signup-button';

// Mock the useAuth0 hook
const mockLoginWithRedirect = jest.fn();
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithRedirect: mockLoginWithRedirect
  })
}));

describe('SignupButton', () => {
  beforeEach(() => {
    mockLoginWithRedirect.mockClear();
  });

  it('renders the signup button', () => {
    render(<SignupButton />);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('button__sign-up');
  });

  it('calls loginWithRedirect with correct parameters when clicked', async () => {
    render(<SignupButton />);

    const signupButton = screen.getByText('Sign Up');
    await fireEvent.click(signupButton);

    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      appState: {
        returnTo: '/profile'
      },
      authorizationParams: {
        prompt: 'login',
        screen_hint: 'signup'
      }
    });
  });
});
