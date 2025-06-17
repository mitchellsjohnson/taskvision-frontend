import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagFilterPills } from '../TagFilterPills';
import { RESERVED_TAGS } from '../../constants/tags';

const mockOnTagClick = jest.fn();

describe('TagFilterPills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all reserved tags as buttons', () => {
    render(<TagFilterPills selectedTags={[]} onTagClick={mockOnTagClick} />);
    RESERVED_TAGS.forEach(tag => {
      expect(screen.getByRole('button', { name: tag.name })).toBeInTheDocument();
    });
  });

  it('calls onTagClick with the correct tag name when a tag is clicked', () => {
    render(<TagFilterPills selectedTags={[]} onTagClick={mockOnTagClick} />);
    const firstTagButton = screen.getByRole('button', { name: RESERVED_TAGS[0].name });
    fireEvent.click(firstTagButton);
    expect(mockOnTagClick).toHaveBeenCalledWith(RESERVED_TAGS[0].name);
  });

  it('applies selected styles to selected tags', () => {
    const selectedTagName = RESERVED_TAGS[0].name;
    render(<TagFilterPills selectedTags={[selectedTagName]} onTagClick={mockOnTagClick} />);
    const selectedTagButton = screen.getByRole('button', { name: selectedTagName });
    // Check for a class that indicates selection
    expect(selectedTagButton).toHaveClass('ring-2');
  });

  it('does not apply selected styles to unselected tags', () => {
    const selectedTagName = RESERVED_TAGS[0].name;
    const unselectedTagName = RESERVED_TAGS[1].name;
    render(<TagFilterPills selectedTags={[selectedTagName]} onTagClick={mockOnTagClick} />);
    const unselectedTagButton = screen.getByRole('button', { name: unselectedTagName });
    expect(unselectedTagButton).not.toHaveClass('ring-2');
  });
}); 