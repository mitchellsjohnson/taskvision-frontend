import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNavBar } from '../mobile-nav-bar';

// Mock the child components
jest.mock('../mobile-nav-bar-brand', () => ({
  MobileNavBarBrand: ({ handleClick }: { handleClick: () => void }) => (
    <div data-testid="mobile-nav-bar-brand" onClick={handleClick}>Brand</div>
  ),
}));

jest.mock('../mobile-menu-toggle-button', () => ({
  MobileMenuToggleButton: ({ handleClick }: { handleClick: () => void }) => (
    <button data-testid="mobile-menu-toggle" onClick={handleClick}>Toggle</button>
  ),
}));

jest.mock('../mobile-nav-bar-tabs', () => ({
  MobileNavBarTabs: ({ handleClick }: { handleClick: () => void }) => (
    <div data-testid="mobile-nav-bar-tabs" onClick={handleClick}>Tabs</div>
  ),
}));

jest.mock('../mobile-nav-bar-buttons', () => ({
  MobileNavBarButtons: () => <div data-testid="mobile-nav-bar-buttons">Buttons</div>,
}));

describe('MobileNavBar', () => {
  beforeEach(() => {
    // Reset body class before each test
    document.body.classList.remove('mobile-scroll-lock');
  });

  it('renders the mobile navigation bar with initial closed state', () => {
    render(<MobileNavBar />);

    expect(screen.getByTestId('mobile-nav-bar-brand')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-nav-bar-tabs')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-nav-bar-buttons')).not.toBeInTheDocument();
  });

  it('opens the mobile menu when toggle button is clicked', () => {
    render(<MobileNavBar />);

    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('mobile-nav-bar-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-nav-bar-buttons')).toBeInTheDocument();
    expect(document.body).toHaveClass('mobile-scroll-lock');
  });

  it('closes the mobile menu when brand is clicked', () => {
    render(<MobileNavBar />);

    // Open menu first
    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggleButton);

    // Then click brand to close
    const brand = screen.getByTestId('mobile-nav-bar-brand');
    fireEvent.click(brand);

    expect(screen.queryByTestId('mobile-nav-bar-tabs')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-nav-bar-buttons')).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass('mobile-scroll-lock');
  });

  it('applies the correct CSS classes', () => {
    render(<MobileNavBar />);

    const container = screen.getByTestId('mobile-nav-bar-brand').parentElement?.parentElement;
    expect(container).toHaveClass('mobile-nav-bar__container');

    const nav = screen.getByTestId('mobile-nav-bar-brand').parentElement;
    expect(nav).toHaveClass('mobile-nav-bar');
  });
}); 