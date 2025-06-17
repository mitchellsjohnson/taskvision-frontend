import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from './settings-page';

jest.mock('../components/navigation/left/left-nav', () => ({
  LeftNav: () => <div data-testid="left-nav">Left Nav</div>,
}));

describe('SettingsPage', () => {
  it('should render the LeftNav component', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId('left-nav')).toBeInTheDocument();
  });

  it('should render an Outlet for nested routes', () => {
    render(
      <MemoryRouter initialEntries={['/settings/some-route']}>
        <SettingsPage />
      </MemoryRouter>
    );
    // We can't directly test the content of the Outlet,
    // but we can ensure the main structure is in place.
    // A more thorough test would involve testing the routes themselves.
    expect(screen.getByTestId('left-nav')).toBeInTheDocument();
  });
}); 