import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductivityScoreBar } from '../ProductivityScoreBar';

describe('ProductivityScoreBar', () => {
  it('should render without crashing', () => {
    render(<ProductivityScoreBar />);
    expect(screen.getByText('Weekly Productivity Score')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<ProductivityScoreBar />);
    expect(screen.getByText('Loading productivity score...')).toBeInTheDocument();
  });
}); 