import React from 'react';
import { vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { DashboardPage } from './dashboard-page';

// Mock the DashboardTabs component to avoid complex dependencies
vi.mock('../components/DashboardTabs', () => ({
  DashboardTabs: ({ defaultTab }: { defaultTab?: string }) => (
    <div data-testid="dashboard-tabs">
      <button role="tab" aria-selected={defaultTab === 'dashboard'}>
        Dashboard
      </button>
      <button role="tab" aria-selected={defaultTab === 'wellness'}>
        Wellness
      </button>
    </div>
  ),
}));

describe('DashboardPage', () => {
  it('should render the dashboard tabs', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('dashboard-tabs')).toBeInTheDocument();
  });

  it('should render dashboard tab with correct default selection', () => {
    render(<DashboardPage />);
    const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
    expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
  });
}); 