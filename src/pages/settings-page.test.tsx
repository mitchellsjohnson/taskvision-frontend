import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from "vitest";
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from './settings-page';
import { ThemeProvider } from '../contexts/theme-context';
import { FontSizeProvider } from '../contexts/font-size-context';
import { AccessibilityProvider } from '../contexts/accessibility-context';
import { smsSettingsApi } from '../services/sms-settings-api';

// Mock the SMS API
vi.mock('../services/sms-settings-api', () => ({
  smsSettingsApi: {
    getSettings: vi.fn(),
    initializeSms: vi.fn(),
  },
}));

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
  beforeEach(() => {
    vi.clearAllMocks();
    (smsSettingsApi.getSettings as any).mockResolvedValue(null);
  });

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

  it('should switch to SMS tab when clicked', async () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    const smsTab = screen.getByRole('button', { name: /sms/i });
    fireEvent.click(smsTab);

    // Should show SMS settings content
    // The SmsSettingsPage component renders "SMS / Text Messages" heading
    await waitFor(() => {
      expect(screen.getByText(/SMS \/ Text Messages/i)).toBeInTheDocument();
    });
  });
}); 