import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutButton } from '../logout-button';

// Mock the useAuth0 hook
const mockLogout = jest.fn();
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    logout: mockLogout
  })
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    mockLogout.mockClear();
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:4040' },
      writable: true
    });
  });

  it('renders the logout button', () => {
    render(<LogoutButton />);
    expect(screen.getByText('Log Out')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('button__logout');
  });

  it('calls logout with correct parameters when clicked', () => {
    render(<LogoutButton />);

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledWith({
      returnTo: 'http://localhost:4040'
    });
  });
});
