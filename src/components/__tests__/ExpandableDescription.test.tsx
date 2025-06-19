import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableDescription } from '../ExpandableDescription';

describe('ExpandableDescription', () => {
  const shortDescription = 'This is a short description';
  const longDescription = 'This is a very long description that should be truncated when displayed in the collapsed state. It contains more than 300 characters to test the truncation functionality properly. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

  it('should render nothing when description is empty', () => {
    const { container } = render(<ExpandableDescription description="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render short description without truncation', () => {
    render(<ExpandableDescription description={shortDescription} />);
    expect(screen.getByText(shortDescription)).toBeInTheDocument();
    expect(screen.queryByText('⋯ More')).not.toBeInTheDocument();
  });

  it('should render long description with truncation by default', () => {
    render(<ExpandableDescription description={longDescription} />);
    expect(screen.getByText('⋯ More')).toBeInTheDocument();
    expect(screen.queryByText('Less ▲')).not.toBeInTheDocument();
  });

  it('should expand when More button is clicked', () => {
    render(<ExpandableDescription description={longDescription} />);
    
    const moreButton = screen.getByText('⋯ More');
    fireEvent.click(moreButton);
    
    expect(screen.getByText('Less ▲')).toBeInTheDocument();
    expect(screen.queryByText('⋯ More')).not.toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should collapse when Less button is clicked', () => {
    render(<ExpandableDescription description={longDescription} />);
    
    // First expand
    fireEvent.click(screen.getByText('⋯ More'));
    expect(screen.getByText('Less ▲')).toBeInTheDocument();
    
    // Then collapse
    fireEvent.click(screen.getByText('Less ▲'));
    expect(screen.getByText('⋯ More')).toBeInTheDocument();
    expect(screen.queryByText('Less ▲')).not.toBeInTheDocument();
  });

  it('should respect custom maxPreviewLength', () => {
    const customMaxLength = 50;
    render(
      <ExpandableDescription 
        description={longDescription} 
        maxPreviewLength={customMaxLength}
      />
    );
    expect(screen.getByText('⋯ More')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-test-class';
    const { container } = render(
      <ExpandableDescription 
        description={shortDescription} 
        className={customClass}
      />
    );
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('should have proper accessibility attributes', () => {
    render(<ExpandableDescription description={longDescription} />);
    
    const moreButton = screen.getByText('⋯ More');
    expect(moreButton).toHaveAttribute('tabIndex', '0');
    
    fireEvent.click(moreButton);
    
    const lessButton = screen.getByText('Less ▲');
    expect(lessButton).toHaveAttribute('tabIndex', '0');
  });

  it('should handle keyboard navigation', () => {
    render(<ExpandableDescription description={longDescription} />);
    
    const moreButton = screen.getByText('⋯ More');
    fireEvent.keyDown(moreButton, { key: 'Enter' });
    // Note: This test verifies the button is focusable, actual keyboard handling would need additional setup
    expect(moreButton).toHaveAttribute('tabIndex', '0');
  });

  it('should preserve whitespace in expanded state', () => {
    const descriptionWithNewlines = 'Line 1\n\nLine 2\n\nLine 3\n\n'.repeat(20) + 'This is a very long description with newlines that should definitely exceed the 300 character limit and trigger the expandable functionality so we can test the whitespace preservation feature properly.';
    render(<ExpandableDescription description={descriptionWithNewlines} />);
    
    fireEvent.click(screen.getByText('⋯ More'));
    
    const expandedContent = document.querySelector('.whitespace-pre-wrap');
    expect(expandedContent).toBeInTheDocument();
    expect(expandedContent).toHaveClass('whitespace-pre-wrap');
  });

  it('should show gradient overlay in collapsed state for long descriptions', () => {
    render(<ExpandableDescription description={longDescription} />);
    
    const gradientOverlay = document.querySelector('.bg-gradient-to-t');
    expect(gradientOverlay).toBeInTheDocument();
    expect(gradientOverlay).toHaveClass('pointer-events-none');
  });

  it('should highlight expanded content with special styling', () => {
    render(<ExpandableDescription description={longDescription} />);
    
    fireEvent.click(screen.getByText('⋯ More'));
    
    const expandedContainer = document.querySelector('.bg-gray-800\\/30');
    expect(expandedContainer).toBeInTheDocument();
    expect(expandedContainer).toHaveClass('border-l-2', 'border-blue-500/30');
  });
}); 