import React from 'react';
import { render, screen } from '@testing-library/react';
import { Home } from '../home';

describe('Home', () => {
  it('renders the welcome headline', () => {
    render(<Home />);
    expect(screen.getByText('Welcome to TaskVision')).toBeInTheDocument();
  });

  it('renders the application description', () => {
    render(<Home />);

    const descriptions = screen.getAllByText(
      /AI-Powered Focus. Human-Centered Results.|TaskVision helps you cut through the noise and get the right things done.|🚀 Built on the MIT Framework \(Most Important Tasks\), TaskVision uses AI to:|Because doing less — intentionally — is how you achieve more.|TaskVision: Focused work. Powered by AI. Designed for impact./
    );
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it('applies the correct CSS classes', () => {
    const { container } = render(<Home />);
    expect(container.firstChild).toHaveClass('hero-banner hero-banner--aqua-emerald');
  });
});
