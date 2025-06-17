import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskForm } from '../task-form';
import { Task } from '../../types';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const initialValues: Partial<Task> = {
  title: 'Initial Title',
  description: 'Initial Description',
  status: 'Open',
  dueDate: '2023-01-01',
};

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders in "create" mode', () => {
    render(<TaskForm onSubmit={mockOnSubmit} isEditing={false} />);
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument();
  });

  it('renders in "edit" mode with initial values', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isEditing={true} initialValues={initialValues} />);
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Initial Title');
    expect(screen.getByLabelText('Description')).toHaveValue('Initial Description');
    expect(screen.getByLabelText('Due Date')).toHaveValue('2023-01-01');
    expect(screen.getByRole('button', { name: 'Update Task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', () => {
    render(<TaskForm onSubmit={mockOnSubmit} isEditing={false} />);
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Task Title' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Task Description' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create Task' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Task Title',
      description: 'New Task Description',
      dueDate: undefined,
      status: 'Open',
    });
  });

  it('calls onCancel when cancel button is clicked in edit mode', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isEditing={true} initialValues={initialValues} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('does not show cancel button in create mode', () => {
    render(<TaskForm onSubmit={mockOnSubmit} isEditing={false} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });
}); 