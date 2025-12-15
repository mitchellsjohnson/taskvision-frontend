import React from 'react';
import { vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { MITGrid } from '../mit-grid';
import { Task } from '../../types';
import { DndContext } from '@dnd-kit/core';

vi.mock('../TaskCard', () => ({
  TaskCard: ({ task }: { task: Task }) => <div data-testid="task-card">{task.title}</div>,
}));

const mockTasks: Task[] = [
  { TaskId: '1', title: 'MIT Task 1', status: 'Open', priority: 1, isMIT: true, UserId: 'user-1', creationDate: '', modifiedDate: '', completedDate: null },
  { TaskId: '2', title: 'MIT Task 2', status: 'Open', priority: 2, isMIT: true, UserId: 'user-1', creationDate: '', modifiedDate: '', completedDate: null },
];

const mockOnOpenEditModal = vi.fn();
const mockOnUpdate = vi.fn();
const mockOnDelete = vi.fn();

const renderGrid = (tasks: Task[]) => {
    return render(
      <DndContext>
        <MITGrid 
          tasks={tasks} 
          onOpenEditModal={mockOnOpenEditModal}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      </DndContext>
    );
}

describe('MITGrid', () => {
  it('renders the grid title', () => {
    renderGrid([]);
    expect(screen.getByText('Most Important Tasks')).toBeInTheDocument();
  });

  it('renders tasks and empty slots correctly', () => {
    renderGrid(mockTasks);
    expect(screen.getByText('MIT Task 1')).toBeInTheDocument();
    expect(screen.getByText('MIT Task 2')).toBeInTheDocument();
    expect(screen.getByText('Empty MIT Slot')).toBeInTheDocument();
    
    const taskCards = screen.getAllByTestId('task-card');
    expect(taskCards.length).toBe(2);

    const emptySlots = screen.getAllByText('Empty MIT Slot');
    expect(emptySlots.length).toBe(1);
  });

  it('renders all empty slots when no tasks are provided', () => {
    renderGrid([]);
    const emptySlots = screen.getAllByText('Empty MIT Slot');
    expect(emptySlots.length).toBe(3);
  });
}); 