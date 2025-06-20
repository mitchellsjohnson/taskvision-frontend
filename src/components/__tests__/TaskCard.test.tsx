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
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Description is hidden by default, need to expand first
    expect(screen.getByText('Has details')).toBeInTheDocument();
    
    // Click to expand details
    const expandButton = screen.getByTitle('Show details');
    fireEvent.click(expandButton);
    
    // Now description should be visible
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('renders task tags when expanded', () => {
    renderTaskCard();
    
    // Tags are hidden by default, need to expand first
    expect(screen.getByText('Has details')).toBeInTheDocument();
    
    // Click to expand details
    const expandButton = screen.getByTitle('Show details');
    fireEvent.click(expandButton);
    
    // Now tags should be visible - but they use the Tag component, so look for the tag labels
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    renderTaskCard();

    // First expand to see the description and action buttons
    const expandButton = screen.getByTitle('Show details');
    fireEvent.click(expandButton);

    // Click the edit button to open the modal
    const editButton = screen.getByTestId('edit-task-button');
    fireEvent.click(editButton);

    // Verify that onOpenEditModal was called with the task
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
  
  it('allows expanding and collapsing task details', () => {
    renderTaskCard();

    // Initially details should be collapsed
    expect(screen.getByText('Has details')).toBeInTheDocument();
    expect(screen.queryByText('This is a test description.')).not.toBeInTheDocument();

    // Click to expand details
    const expandButton = screen.getByTitle('Show details');
    fireEvent.click(expandButton);

    // Now details should be visible
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();

    // Button should now show "Hide details"
    const hideButton = screen.getByTitle('Hide details');
    expect(hideButton).toBeInTheDocument();

    // Click to collapse details
    fireEvent.click(hideButton);

    // Details should be hidden again
    expect(screen.getByText('Has details')).toBeInTheDocument();
    expect(screen.queryByText('This is a test description.')).not.toBeInTheDocument();
  });
}); 