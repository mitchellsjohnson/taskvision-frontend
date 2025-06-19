import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagFilterPills } from '../TagFilterPills';
import { DEFAULT_TAGS } from '../../constants/tags';

const mockOnTagClick = jest.fn();

describe('TagFilterPills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all default tags as buttons', () => {
    render(<TagFilterPills selectedTags={[]} onTagClick={mockOnTagClick} />);
    
    Object.keys(DEFAULT_TAGS).forEach(tagName => {
      expect(screen.getByText(tagName)).toBeInTheDocument();
    });
  });

  it('calls onTagClick with the correct tag name when a tag is clicked', () => {
    render(<TagFilterPills selectedTags={[]} onTagClick={mockOnTagClick} />);
    
    const firstTagName = Object.keys(DEFAULT_TAGS)[0];
    const firstTagButton = screen.getByText(firstTagName);
    fireEvent.click(firstTagButton);
    
    expect(mockOnTagClick).toHaveBeenCalledWith(firstTagName);
  });

  it('applies selected styles to selected tags', () => {
    const selectedTagName = Object.keys(DEFAULT_TAGS)[0];
    render(<TagFilterPills selectedTags={[selectedTagName]} onTagClick={mockOnTagClick} />);
    
    const selectedTagContainer = screen.getByText(selectedTagName).closest('div');
    expect(selectedTagContainer).toHaveClass('ring-2');
  });

  it('does not apply selected styles to unselected tags', () => {
    const tagNames = Object.keys(DEFAULT_TAGS);
    const selectedTagName = tagNames[0];
    const unselectedTagName = tagNames[1];
    
    render(<TagFilterPills selectedTags={[selectedTagName]} onTagClick={mockOnTagClick} />);
    
    const unselectedTagContainer = screen.getByText(unselectedTagName).closest('div');
    expect(unselectedTagContainer).not.toHaveClass('ring-2');
  });

  it('renders tags with proper accessibility attributes', () => {
    render(<TagFilterPills selectedTags={[]} onTagClick={mockOnTagClick} />);
    
    const firstTagName = Object.keys(DEFAULT_TAGS)[0];
    const firstTag = screen.getByText(firstTagName);
    
    expect(firstTag).toHaveAttribute('aria-label', `Tag: ${firstTagName}`);
    expect(firstTag).toHaveAttribute('role', 'button');
    expect(firstTag).toHaveAttribute('tabIndex', '0');
  });

  it('renders tags with icons', () => {
    render(<TagFilterPills selectedTags={[]} onTagClick={mockOnTagClick} />);
    
    // Check that at least one tag has an icon (SVG element)
    const firstTagName = Object.keys(DEFAULT_TAGS)[0];
    const firstTagContainer = screen.getByText(firstTagName).closest('span');
    const icon = firstTagContainer?.querySelector('svg');
    
    expect(icon).toBeInTheDocument();
  });

  it('sorts tags alphabetically', () => {
    render(<TagFilterPills selectedTags={[]} onTagClick={mockOnTagClick} />);
    
    const tagNames = Object.keys(DEFAULT_TAGS).sort();
    const renderedTags = screen.getAllByRole('button');
    
    tagNames.forEach((tagName, index) => {
      expect(renderedTags[index]).toHaveTextContent(tagName);
    });
  });

  it('handles multiple selected tags', () => {
    const selectedTags = [Object.keys(DEFAULT_TAGS)[0], Object.keys(DEFAULT_TAGS)[1]];
    render(<TagFilterPills selectedTags={selectedTags} onTagClick={mockOnTagClick} />);
    
    selectedTags.forEach(tagName => {
      const tagContainer = screen.getByText(tagName).closest('div');
      expect(tagContainer).toHaveClass('ring-2');
    });
  });

  it('applies hover opacity styles correctly', () => {
    render(<TagFilterPills selectedTags={[]} onTagClick={mockOnTagClick} />);
    
    const firstTagName = Object.keys(DEFAULT_TAGS)[0];
    const firstTag = screen.getByText(firstTagName);
    
    expect(firstTag).toHaveClass('opacity-75');
  });

  it('applies full opacity for selected tags', () => {
    const selectedTagName = Object.keys(DEFAULT_TAGS)[0];
    render(<TagFilterPills selectedTags={[selectedTagName]} onTagClick={mockOnTagClick} />);
    
    const selectedTag = screen.getByText(selectedTagName);
    expect(selectedTag).toHaveClass('opacity-100');
  });
}); 