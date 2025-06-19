import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '../TagInput';

const mockOnTagsChange = jest.fn();

describe('TagInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders initial tags using Tag component', () => {
      render(<TagInput tags={['Leader', 'Custom']} onTagsChange={mockOnTagsChange} />);
      
      expect(screen.getByText('Leader')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
      
      // Check that tags are rendered as Tag components (with proper roles)
      const tags = screen.getAllByRole('listitem');
      expect(tags).toHaveLength(2);
    });

    it('adds a new tag on Enter', async () => {
      render(<TagInput tags={['Leader']} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'new-tag');
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnTagsChange).toHaveBeenCalledWith(['Leader', 'new-tag']);
    });

    it('adds a new tag on comma', async () => {
      render(<TagInput tags={['Leader']} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'new-tag,');
      
      expect(mockOnTagsChange).toHaveBeenCalledWith(['Leader', 'new-tag']);
    });

    it('removes a tag when its remove button is clicked', async () => {
      render(<TagInput tags={['Leader', 'Custom']} onTagsChange={mockOnTagsChange} />);
      
      const removeButtons = screen.getAllByText('×');
      fireEvent.click(removeButtons[0]);
      
      expect(mockOnTagsChange).toHaveBeenCalledWith(['Custom']);
    });

    it('removes the last tag on Backspace when input is empty', () => {
      render(<TagInput tags={['Leader', 'Custom']} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.keyDown(input, { key: 'Backspace' });
      
      expect(mockOnTagsChange).toHaveBeenCalledWith(['Leader']);
    });

    it('does not add a duplicate tag', async () => {
      render(<TagInput tags={['Leader']} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'Leader');
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnTagsChange).not.toHaveBeenCalled();
    });

    it('trims whitespace from tags', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, '  spaced-tag  ');
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnTagsChange).toHaveBeenCalledWith(['spaced-tag']);
    });
  });

  describe('Autocomplete Functionality', () => {
    it('shows suggestions when typing a partial match', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
      });
    });

    it('shows multiple suggestions for partial matches', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'c');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
        expect(screen.getByText('Customer')).toBeInTheDocument();
      });
    });

    it('filters out already selected tags from suggestions', async () => {
      render(<TagInput tags={['Creative']} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        expect(screen.queryByText('Creative')).not.toBeInTheDocument();
      });
    });

    it('hides suggestions when input is cleared', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
      });
      
      await userEvent.clear(input);
      
      await waitFor(() => {
        expect(screen.queryByText('Creative')).not.toBeInTheDocument();
      });
    });

    it('adds suggested tag when clicked', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Creative'));
      
      expect(mockOnTagsChange).toHaveBeenCalledWith(['Creative']);
    });

    it('navigates suggestions with arrow keys', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'c');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
      });
      
      // Arrow down should highlight first suggestion
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      const firstSuggestion = screen.getByText('Creative').closest('div');
      expect(firstSuggestion).toHaveClass('bg-blue-600');
    });

    it('selects highlighted suggestion with Enter', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnTagsChange).toHaveBeenCalledWith(['Creative']);
    });

    it('closes suggestions on Escape', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(input, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Creative')).not.toBeInTheDocument();
      });
    });

    it('handles case-insensitive matching', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'LEADER');
      
      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<TagInput tags={['Leader']} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      expect(input).toHaveAttribute('role', 'combobox');
      expect(input).toHaveAttribute('aria-label', 'Add new tag');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('updates aria-expanded when suggestions are shown', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('has proper ARIA attributes on suggestions', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        const suggestionsContainer = screen.getByRole('listbox');
        expect(suggestionsContainer).toHaveAttribute('aria-label', 'Tag suggestions');
        
        const suggestions = screen.getAllByRole('option');
        expect(suggestions[0]).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('updates aria-selected when navigating suggestions', async () => {
      render(<TagInput tags={[]} onTagsChange={mockOnTagsChange} />);
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'c');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      const suggestions = screen.getAllByRole('option');
      expect(suggestions[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('has accessible remove buttons', () => {
      render(<TagInput tags={['Leader', 'Custom']} onTagsChange={mockOnTagsChange} />);
      
      const removeButtons = screen.getAllByLabelText(/Remove .* tag/);
      expect(removeButtons).toHaveLength(2);
      expect(removeButtons[0]).toHaveAttribute('aria-label', 'Remove Leader tag');
      expect(removeButtons[1]).toHaveAttribute('aria-label', 'Remove Custom tag');
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes suggestions when clicking outside', async () => {
      render(
        <div>
          <TagInput tags={[]} onTagsChange={mockOnTagsChange} />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      const input = screen.getByPlaceholderText('Add tag...');
      await userEvent.type(input, 'cr');
      
      await waitFor(() => {
        expect(screen.getByText('Creative')).toBeInTheDocument();
      });
      
      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);
      
      await waitFor(() => {
        expect(screen.queryByText('Creative')).not.toBeInTheDocument();
      });
    });
  });
}); 