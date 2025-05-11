import { render, screen } from '@testing-library/react';
import { PageFooter } from '../page-footer';

describe('PageFooter', () => {
  it('renders the footer with Auth0 branding', () => {
    render(<PageFooter />);
    
    // Check for Auth0 branding
    expect(screen.getByAltText('Auth0')).toBeInTheDocument();
    expect(screen.getByText('Auth0 Inc')).toBeInTheDocument();
  });

  it('renders all resource links', () => {
    render(<PageFooter />);
    
    // Check for all resource links
    expect(screen.getByText('Why Auth0')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Developer Blog')).toBeInTheDocument();
    expect(screen.getByText('Contact an Expert')).toBeInTheDocument();
  });

  it('renders the create account button', () => {
    render(<PageFooter />);
    
    const createAccountButton = screen.getByText('Create Free Auth0 Account');
    expect(createAccountButton).toBeInTheDocument();
    expect(createAccountButton).toHaveAttribute('href', 'https://auth0.com/signup');
    expect(createAccountButton).toHaveAttribute('target', '_blank');
    expect(createAccountButton).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('renders the main message and description', () => {
    render(<PageFooter />);
    
    expect(screen.getByText(/This sample application is brought to you by/)).toBeInTheDocument();
    expect(screen.getByText(/Securely implement authentication using Auth0 on any stack and any device/)).toBeInTheDocument();
  });
}); 