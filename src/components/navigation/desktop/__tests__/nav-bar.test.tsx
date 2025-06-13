import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavBar } from '../nav-bar';

// Mock the child components
jest.mock('../nav-bar-brand', () => ({
  NavBarBrand: () => <div data-testid="nav-bar-brand">Brand</div>
}));

jest.mock('../nav-bar-tabs', () => ({
  NavBarTabs: () => <div data-testid="nav-bar-tabs">Tabs</div>
}));

jest.mock('../nav-bar-buttons', () => ({
  NavBarButtons: () => <div data-testid="nav-bar-buttons">Buttons</div>
}));

describe('NavBar', () => {
  it('renders the navigation bar with all components', () => {
    render(<NavBar />);

    expect(screen.getByTestId('nav-bar-brand')).toBeInTheDocument();
    expect(screen.getByTestId('nav-bar-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('nav-bar-buttons')).toBeInTheDocument();
  });

  it('applies the correct CSS classes', () => {
    render(<NavBar />);

    const navBar = screen.getByTestId('nav-bar');
    expect(navBar).toHaveClass('nav-bar');

    const container = screen.getByTestId('nav-bar-container');
    expect(container).toHaveClass('nav-bar__container');
  });
});
