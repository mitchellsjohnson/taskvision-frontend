import React from 'react';
import { vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { ProfilePage } from './profile-page';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

const mockedUseAuth0 = useAuth0 as any;

describe('ProfilePage', () => {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    picture: 'https://example.com/john.doe.jpg',
  };

  afterEach(() => {
    mockedUseAuth0.mockClear();
  });

  it('should render the page title', () => {
    mockedUseAuth0.mockReturnValueOnce({ user });
    render(<ProfilePage />);
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });

  it('should render the user name and email', () => {
    mockedUseAuth0.mockReturnValueOnce({ user });
    render(<ProfilePage />);
    expect(screen.getByText(user.name)).toBeInTheDocument();
    expect(screen.getByText(user.email)).toBeInTheDocument();
  });

  it('should render the user avatar', () => {
    mockedUseAuth0.mockReturnValueOnce({ user });
    render(<ProfilePage />);
    const avatar = screen.getByAltText('Profile');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', user.picture);
  });

  it('should render the decoded ID token', () => {
    mockedUseAuth0.mockReturnValueOnce({ user });
    render(<ProfilePage />);
    const expectedJson = JSON.stringify(user, null, 2);
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && element?.textContent?.trim() === expectedJson;
    })).toBeInTheDocument();
  });

  it('should render null if user is not available', () => {
    mockedUseAuth0.mockReturnValueOnce({ user: null });
    const { container } = render(<ProfilePage />);
    expect(container.firstChild).toBeNull();
  });
}); 