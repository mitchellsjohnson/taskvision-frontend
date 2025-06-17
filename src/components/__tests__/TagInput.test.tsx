import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from '../TagInput';

const mockOnTagsChange = jest.fn();

describe('TagInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial tags', () => {
    render(<TagInput tags={['react', 'typescript']} onTagsChange={mockOnTagsChange} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('adds a new tag on Enter', () => {
    render(<TagInput tags={['react']} onTagsChange={mockOnTagsChange} />);
    const input = screen.getByPlaceholderText('Add tag...');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockOnTagsChange).toHaveBeenCalledWith(['react', 'new-tag']);
  });

  it('removes a tag when its remove button is clicked', () => {
    render(<TagInput tags={['react', 'typescript']} onTagsChange={mockOnTagsChange} />);
    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[0]); // Click remove on the 'react' tag
    expect(mockOnTagsChange).toHaveBeenCalledWith(['typescript']);
  });

  it('removes the last tag on Backspace when input is empty', () => {
    render(<TagInput tags={['react', 'typescript']} onTagsChange={mockOnTagsChange} />);
    const input = screen.getByPlaceholderText('Add tag...');
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(mockOnTagsChange).toHaveBeenCalledWith(['react']);
  });

  it('does not add a duplicate tag', () => {
    render(<TagInput tags={['react']} onTagsChange={mockOnTagsChange} />);
    const input = screen.getByPlaceholderText('Add tag...');
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });
}); 