import React from 'react';
import { render, screen } from '@testing-library/react';
import { UpcomingTasksList } from '../UpcomingTasksList';

// Mock the task API and edit modal
jest.mock('../../services/task-api', () => ({
  useTaskApi: () => ({
    getTasks: jest.fn(),
  }),
}));

jest.mock('../edit-task-modal', () => ({
  EditTaskModal: ({ isOpen, task, onClose }: any) => 
    isOpen ? <div data-testid="edit-task-modal">Edit Modal for {task?.title || 'New Task'}</div> : null,
}));

describe('UpcomingTasksList', () => {
  it('should render without crashing', () => {
    render(<UpcomingTasksList />);
    expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<UpcomingTasksList />);
    expect(screen.getByText('Loading upcoming tasks...')).toBeInTheDocument();
  });
}); 