import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tag } from '../Tag';

const mockOnClick = jest.fn();

describe('Tag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Tags', () => {
    it('renders a default tag with icon and correct styling', () => {
      render(<Tag label="Leader" type="default" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toBeInTheDocument();
      expect(tag).toHaveAttribute('aria-label', 'Tag: Leader');
      expect(screen.getByText('Leader')).toBeInTheDocument();
      
      // Check for icon presence (SVG element)
      const icon = tag.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-4', 'h-4', 'text-gray-400');
    });

    it('renders all default tags with their respective icons', () => {
      const defaultTags = ['5-min', 'Leader', 'Creative', 'Customer', 'Follow-up', 'Personal', 'Research', 'Team', 'Training', 'Work'];
      
      defaultTags.forEach(tagName => {
        const { unmount } = render(<Tag label={tagName} type="default" />);
        
        expect(screen.getByText(tagName)).toBeInTheDocument();
        expect(screen.getByRole('listitem')).toBeInTheDocument();
        
        // Each should have an icon
        const icon = screen.getByRole('listitem').querySelector('svg');
        expect(icon).toBeInTheDocument();
        
        unmount();
      });
    });

    it('applies correct border color for default tags', () => {
      render(<Tag label="Leader" type="default" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toHaveClass('border-rose-400');
    });
  });

  describe('Custom Tags', () => {
    it('renders a custom tag without icon', () => {
      render(<Tag label="CustomTag" type="custom" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toBeInTheDocument();
      expect(tag).toHaveAttribute('aria-label', 'Tag: CustomTag');
      expect(screen.getByText('CustomTag')).toBeInTheDocument();
      
      // Should not have an icon
      const icon = tag.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('applies neutral border for custom tags', () => {
      render(<Tag label="CustomTag" type="custom" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toHaveClass('border-gray-500');
    });
  });

  describe('Clickable Tags', () => {
    it('renders as button when onClick is provided', () => {
      render(<Tag label="Leader" type="default" onClick={mockOnClick} />);
      
      const tag = screen.getByRole('button');
      expect(tag).toBeInTheDocument();
      expect(tag).toHaveAttribute('aria-label', 'Tag: Leader');
      expect(tag).toHaveAttribute('tabIndex', '0');
    });

    it('calls onClick when clicked', () => {
      render(<Tag label="Leader" type="default" onClick={mockOnClick} />);
      
      const tag = screen.getByRole('button');
      fireEvent.click(tag);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Enter key is pressed', () => {
      render(<Tag label="Leader" type="default" onClick={mockOnClick} />);
      
      const tag = screen.getByRole('button');
      fireEvent.keyDown(tag, { key: 'Enter' });
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', () => {
      render(<Tag label="Leader" type="default" onClick={mockOnClick} />);
      
      const tag = screen.getByRole('button');
      fireEvent.keyDown(tag, { key: ' ' });
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick for other keys', () => {
      render(<Tag label="Leader" type="default" onClick={mockOnClick} />);
      
      const tag = screen.getByRole('button');
      fireEvent.keyDown(tag, { key: 'a' });
      fireEvent.keyDown(tag, { key: 'Escape' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('applies hover and focus styles for clickable tags', () => {
      render(<Tag label="Leader" type="default" onClick={mockOnClick} />);
      
      const tag = screen.getByRole('button');
      expect(tag).toHaveClass('cursor-pointer', 'hover:opacity-80');
    });
  });

  describe('Non-clickable Tags', () => {
    it('renders as listitem when onClick is not provided', () => {
      render(<Tag label="Leader" type="default" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toBeInTheDocument();
      expect(tag).toHaveAttribute('tabIndex', '-1');
    });

    it('applies default cursor for non-clickable tags', () => {
      render(<Tag label="Leader" type="default" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toHaveClass('cursor-default');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label', () => {
      render(<Tag label="Test Tag" type="default" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toHaveAttribute('aria-label', 'Tag: Test Tag');
    });

    it('is keyboard accessible when clickable', () => {
      render(<Tag label="Leader" type="default" onClick={mockOnClick} />);
      
      const tag = screen.getByRole('button');
      expect(tag).toHaveAttribute('tabIndex', '0');
      
      // Should be focusable
      tag.focus();
      expect(document.activeElement).toBe(tag);
    });

    it('has focus ring styles', () => {
      render(<Tag label="Leader" type="default" onClick={mockOnClick} />);
      
      const tag = screen.getByRole('button');
      expect(tag).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Tag label="Leader" type="default" className="custom-class" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toHaveClass('custom-class');
    });

    it('preserves base classes when custom className is provided', () => {
      render(<Tag label="Leader" type="default" className="custom-class" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toHaveClass('custom-class', 'inline-flex', 'items-center', 'rounded-full');
    });
  });

  describe('Dark mode compatibility', () => {
    it('applies consistent text color', () => {
      render(<Tag label="Leader" type="default" />);
      
      const tag = screen.getByRole('listitem');
      expect(tag).toHaveClass('text-white');
    });
  });
}); 