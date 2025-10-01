import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from './settings-page';
import { ThemeProvider } from '../contexts/theme-context';
import { FontSizeProvider } from '../contexts/font-size-context';
import { AccessibilityProvider } from '../contexts/accessibility-context';

// No mocks needed - SettingsPage doesn't use LeftNav

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    <ThemeProvider>
      <FontSizeProvider>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </FontSizeProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe('SettingsPage', () => {
  it('should render the settings page with main heading', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });

  it('should render appearance tab content by default', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Text Size')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });
}); 