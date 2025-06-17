import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditTaskModal } from '../edit-task-modal';
import { Task } from '../../types';

const mockTask: Task = {
  TaskId: 'task-1',
  title: 'Test Task',
  description: 'This is a test description.',
  status: 'Open',
  priority: 1,
  isMIT: true,
  UserId: 'user-1',
  tags: ['test', 'react'],
  creationDate: new Date().toISOString(),
  modifiedDate: new Date().toISOString(),
  completedDate: null,
  dueDate: '2023-01-01',
};

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

describe('EditTaskModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<EditTaskModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} task={null} allTags={[]} />);
    expect(screen.queryByText('Task Title')).toBeNull();
  });

  it('renders in "create" mode with empty fields', () => {
    render(<EditTaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} task={null} allTags={[]} />);
    expect(screen.getByPlaceholderText('Task Title')).toHaveValue('');
    expect(screen.getByPlaceholderText('Add task details...')).toHaveValue('');
  });

  it('renders in "edit" mode with pre-filled fields', () => {
    render(<EditTaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} task={mockTask} allTags={[]} />);
    expect(screen.getByPlaceholderText('Task Title')).toHaveValue(mockTask.title);
    expect(screen.getByPlaceholderText('Add task details...')).toHaveValue(mockTask.description);
    expect(screen.getByLabelText('Due Date')).toHaveValue('2023-01-01');
  });

  it('calls onSave with updated data when save is clicked', () => {
    render(<EditTaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} task={mockTask} allTags={[]} />);
    
    const titleInput = screen.getByPlaceholderText('Task Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Title' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<EditTaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} task={mockTask} allTags={[]} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 