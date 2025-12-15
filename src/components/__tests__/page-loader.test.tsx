import React from 'react';
import { vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { PageLoader } from '../page-loader';

describe('PageLoader', () => {
  it('renders the loading image', () => {
    render(<PageLoader />);

    const loadingImage = screen.getByAltText('Loading...');
    expect(loadingImage).toBeInTheDocument();
    expect(loadingImage).toHaveAttribute('src', 'https://cdn.auth0.com/blog/hello-auth0/loader.svg');
  });

  it('applies the correct CSS classes', () => {
    render(<PageLoader />);

    const loaderContainer = screen.getByTestId('page-loader');
    expect(loaderContainer).toHaveClass('loader');
  });
});
