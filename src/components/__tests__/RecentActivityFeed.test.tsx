import React from 'react';
import { vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { RecentActivityFeed } from '../RecentActivityFeed';

describe('RecentActivityFeed', () => {
  it('should render without crashing', () => {
    render(<RecentActivityFeed />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<RecentActivityFeed />);
    expect(screen.getByText('Loading recent activity...')).toBeInTheDocument();
  });
}); 