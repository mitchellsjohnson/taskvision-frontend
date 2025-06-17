import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard, TaskCardProps } from '../TaskCard';
import { Task } from '../../types';
import { DndContext } from '@dnd-kit/core';

// Mock the useSortable hook
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

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
};

const mockOnUpdate = jest.fn();
const mockOnOpenEditModal = jest.fn();
const mockOnDelete = jest.fn();

const renderTaskCard = (props: Partial<TaskCardProps> = {}) => {
  const defaultProps: TaskCardProps = {
    task: mockTask,
    onUpdate: mockOnUpdate,
    onOpenEditModal: mockOnOpenEditModal,
    onDelete: mockOnDelete,
    ...props,
  };

  return render(
    <DndContext>
      <TaskCard {...defaultProps} />
    </DndContext>
  );
};

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title, description, and priority', () => {
    renderTaskCard();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders task tags', () => {
    renderTaskCard();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('calls onOpenEditModal when edit button is clicked', () => {
    renderTaskCard();
    const editButton = screen.getByTestId('edit-task-button');
    fireEvent.click(editButton);
    expect(mockOnOpenEditModal).toHaveBeenCalledWith(mockTask);
  });

  it('calls onUpdate with "Completed" status when complete button is clicked', () => {
    renderTaskCard();
    const completeButton = screen.getByTestId('complete-task-button');
    fireEvent.click(completeButton);
    expect(mockOnUpdate).toHaveBeenCalledWith('task-1', { status: 'Completed' });
  });

  it('calls onUpdate with "Canceled" status when close button is clicked', () => {
    renderTaskCard();
    const closeButton = screen.getByTestId('cancel-task-button');
    fireEvent.click(closeButton);
    expect(mockOnUpdate).toHaveBeenCalledWith('task-1', { status: 'Canceled' });
  });
  
  it('allows inline editing of title and description', () => {
    renderTaskCard();

    // Enter editing mode
    fireEvent.click(screen.getByText('Test Task'));

    const titleInput = screen.getByDisplayValue('Test Task');
    const descriptionInput = screen.getByDisplayValue('This is a test description.');

    expect(titleInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();

    // Edit values
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

    // Save changes
    const saveButton = screen.getByTitle('Save Changes');
    fireEvent.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith('task-1', {
      title: 'Updated Title',
      description: 'Updated Description',
    });
  });
}); 