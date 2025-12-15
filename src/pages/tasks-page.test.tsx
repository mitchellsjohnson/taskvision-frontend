import React from 'react';
import { vi } from "vitest";
import { render, screen, waitFor } from '@testing-library/react';
import { TasksPage } from './tasks-page';
import { Task } from '../types';
import { DndContext } from '@dnd-kit/core';
import { useTaskApi } from '../services/task-api';
import { MemoryRouter } from 'react-router-dom';

// Mock the task API service specifically for this test
const mockGetTasks = vi.fn();
vi.mock('../services/task-api', () => ({
  useTaskApi: () => ({
    getTasks: mockGetTasks,
  }),
}));

describe('TasksPage', () => {
  beforeEach(() => {
    mockGetTasks.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the MIT and LIT columns and fetches tasks on mount', async () => {
    const mockTasks: Task[] = [
      {
        TaskId: '1',
        title: 'MIT Task 1',
        description: 'Description 1',
        status: 'Open',
        priority: 1,
        isMIT: true,
        UserId: 'user1',
        tags: [],
        creationDate: '2023-01-01T00:00:00Z',
        modifiedDate: '2023-01-01T00:00:00Z',
        completedDate: null,
      },
    ];

    (mockGetTasks as any).mockResolvedValue(mockTasks);

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalled();
    });

    // Look for the new unified layout headers instead of old column headers
    expect(screen.getByText(/MIT Tasks/)).toBeInTheDocument(); // Partial match for "MIT Tasks (0/3)" format
    expect(screen.getByText(/LIT Tasks/)).toBeInTheDocument(); // Partial match for "LIT Tasks (0)" format
  });
}); 