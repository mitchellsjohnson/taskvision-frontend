import React from 'react';
import { vi } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard, TaskCardProps } from '../TaskCard';
import { Task } from '../../types';
import { DndContext } from '@dnd-kit/core';

// Mock the useSortable hook
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
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

const mockOnUpdate = vi.fn();
const mockOnOpenEditModal = vi.fn();
const mockOnDelete = vi.fn();

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
    vi.clearAllMocks();
  });

  it('renders task title, description, and priority', () => {
    renderTaskCard();
    // Use getAllByText to handle both mobile and desktop versions
    expect(screen.getAllByText('Test Task')[0]).toBeInTheDocument();
    expect(screen.getAllByText('1')[0]).toBeInTheDocument();
    
    // Description is hidden by default, need to expand first
    const expandButton = screen.getByTitle('Show details');
    fireEvent.click(expandButton);
    
    // Now description should be visible
    expect(screen.getAllByText('This is a test description.')[0]).toBeInTheDocument();
  });

  it('renders task tags when expanded', () => {
    renderTaskCard();
    
    // Click to expand details
    const expandButton = screen.getByTitle('Show details');
    fireEvent.click(expandButton);
    
    // Now tags should be visible - but they use the Tag component, so look for the tag labels
    expect(screen.getAllByText('test')[0]).toBeInTheDocument();
    expect(screen.getAllByText('react')[0]).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    renderTaskCard();

    // Click the edit button to open the modal (action buttons are visible on hover)
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
    expect(screen.queryByText('This is a test description.')).not.toBeInTheDocument();

    // Click to expand details
    const expandButton = screen.getByTitle('Show details');
    fireEvent.click(expandButton);

    // Now details should be visible (may appear multiple times in mobile/desktop views)
    expect(screen.getAllByText('This is a test description.').length).toBeGreaterThan(0);

    // Button should now show "Hide details"
    const hideButton = screen.getByTitle('Hide details');
    expect(hideButton).toBeInTheDocument();

    // Click to collapse details
    fireEvent.click(hideButton);

    // Details should be hidden again
    expect(screen.queryByText('This is a test description.')).not.toBeInTheDocument();
  });
}); 