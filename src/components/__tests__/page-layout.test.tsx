import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageLayout } from '../page-layout';

// Mock the navigation components
jest.mock('../navigation/desktop/nav-bar', () => ({
  NavBar: () => <div data-testid="desktop-nav">Desktop Navigation</div>,
}));

jest.mock('../navigation/mobile/mobile-nav-bar', () => ({
  MobileNavBar: () => <div data-testid="mobile-nav">Mobile Navigation</div>,
}));

describe('PageLayout', () => {
  it('renders the page layout with navigation components', () => {
    render(
      <PageLayout>
        <div>Test Content</div>
      </PageLayout>
    );

    expect(screen.getByTestId('desktop-nav')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });

  it('renders children content in the content area', () => {
    render(
      <PageLayout>
        <div>Test Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Content').parentElement).toHaveClass('page-layout__content');
  });

  it('applies the correct CSS classes', () => {
    render(
      <PageLayout>
        <div>Test Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Content').parentElement?.parentElement).toHaveClass('page-layout');
  });
}); 