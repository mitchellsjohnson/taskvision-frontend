import React from 'react';
import { vi } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNavBar } from '../mobile-nav-bar';

// Mock the child components
vi.mock('../mobile-nav-bar-brand', () => ({
  MobileNavBarBrand: ({ handleClick }: { handleClick: () => void }) => (
    <div data-testid="mobile-nav-bar-brand" onClick={handleClick}>
      Brand
    </div>
  )
}));

vi.mock('../mobile-menu-toggle-button', () => ({
  MobileMenuToggleButton: ({ handleClick }: { handleClick: () => void }) => (
    <button data-testid="mobile-menu-toggle" onClick={handleClick}>
      Toggle
    </button>
  )
}));

vi.mock('../mobile-nav-bar-tabs', () => ({
  MobileNavBarTabs: ({ handleClick }: { handleClick: () => void }) => (
    <div data-testid="mobile-nav-bar-tabs" onClick={handleClick}>
      Tabs
    </div>
  )
}));

vi.mock('../mobile-nav-bar-buttons', () => ({
  MobileNavBarButtons: () => <div data-testid="mobile-nav-bar-buttons">Buttons</div>
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

    const navBar = screen.getByTestId('mobile-nav-bar');
    expect(navBar).toHaveClass('mobile-nav-bar');

    const container = screen.getByTestId('mobile-nav-bar-container');
    expect(container).toHaveClass('mobile-nav-bar__container');

    // Open the menu to check its class
    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggleButton);
    const menu = screen.getByTestId('mobile-nav-bar-menu');
    expect(menu).toHaveClass('mobile-nav-bar__menu');
  });
});
