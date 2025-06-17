import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage', () => {
  it('should render the page title', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render the page description', () => {
    render(<DashboardPage />);
    expect(screen.getByText('This is the dashboard.')).toBeInTheDocument();
  });
}); 