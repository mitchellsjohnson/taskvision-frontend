import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TasksPage } from './tasks-page';
import { DndContext } from '@dnd-kit/core';
import { useTaskApi } from '../services/task-api';

jest.mock('../services/task-api');
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: jest.fn().mockResolvedValue('test-token'),
  }),
}));

const mockedUseTaskApi = useTaskApi as jest.Mock;

describe('TasksPage', () => {
  const mockGetTasks = jest.fn();

  beforeEach(() => {
    mockGetTasks.mockResolvedValue([]);
    mockedUseTaskApi.mockReturnValue({
      getTasks: mockGetTasks,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the MIT and LIT columns and fetches tasks on mount', async () => {
    render(
      <DndContext>
        <TasksPage />
      </DndContext>
    );

    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalled();
    });

    expect(screen.getByText('MIT Tasks')).toBeInTheDocument();
    expect(screen.getByText('LIT Tasks')).toBeInTheDocument();
  });
}); 