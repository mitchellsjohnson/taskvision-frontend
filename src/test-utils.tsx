import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/theme-context';
import { FontSizeProvider } from './contexts/font-size-context';
import { AccessibilityProvider } from './contexts/accessibility-context';

// Custom render function with all providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
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
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
