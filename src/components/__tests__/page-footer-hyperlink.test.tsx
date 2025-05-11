import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageFooterHyperlink } from '../page-footer-hyperlink';

describe('PageFooterHyperlink', () => {
  it('renders the hyperlink with correct attributes', () => {
    render(
      <PageFooterHyperlink path="https://example.com">
        Test Link
      </PageFooterHyperlink>
    );

    const link = screen.getByText('Test Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies the correct CSS class', () => {
    render(
      <PageFooterHyperlink path="https://example.com">
        Test Link
      </PageFooterHyperlink>
    );

    expect(screen.getByText('Test Link')).toHaveClass('page-footer__hyperlink');
  });

  it('renders children content', () => {
    render(
      <PageFooterHyperlink path="https://example.com">
        <span>Custom Content</span>
      </PageFooterHyperlink>
    );

    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });
}); 