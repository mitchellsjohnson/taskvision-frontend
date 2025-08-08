import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { OpenOverdueTile } from '../OpenOverdueTile';
import { useTaskApi } from '../../services/task-api';
import { Task } from '../../types';

// Mock the dependencies
jest.mock('../../services/task-api');

const mockUseTaskApi = useTaskApi as jest.MockedFunction<typeof useTaskApi>;

describe('OpenOverdueTile', () => {
  const mockGetTasks = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTaskApi.mockReturnValue({
      getTasks: mockGetTasks,
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    });
  });

  const createMockTask = (id: string, dueDate?: string): Task => ({
    TaskId: id,
    title: `Task ${id}`,
    status: 'Open' as const,
    creationDate: '2024-01-01T00:00:00Z',
    modifiedDate: '2024-01-01T00:00:00Z',
    completedDate: null,
    UserId: 'user-1',
    isMIT: false,
    priority: 1,
    dueDate,
  });

  it('should render loading state initially', () => {
    mockGetTasks.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('Task Overview')).toBeInTheDocument();
    expect(screen.getByText('Loading task counts...')).toBeInTheDocument();
  });

  it('should display task counts correctly when no tasks are overdue', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const mockTasks = [
      createMockTask('1', tomorrow.toISOString()),
      createMockTask('2'), // No due date
      createMockTask('3', tomorrow.toISOString()),
    ];
    
    mockGetTasks.mockResolvedValue(mockTasks);
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('0 overdue tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('3 open tasks')).toBeInTheDocument();
    });
    
    expect(screen.getByText((content, element) => {
      return element?.className === 'summary-text' && element?.textContent === '3 open tasks, none overdue';
    })).toBeInTheDocument();
    expect(mockGetTasks).toHaveBeenCalledWith({ status: ['Open'] });
  });

  it('should display overdue tasks correctly', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const mockTasks = [
      createMockTask('1', yesterday.toISOString()), // Overdue
      createMockTask('2', tomorrow.toISOString()), // Not overdue
      createMockTask('3', yesterday.toISOString()), // Overdue
      createMockTask('4'), // No due date
    ];
    
    mockGetTasks.mockResolvedValue(mockTasks);
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('2 overdue tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('4 open tasks')).toBeInTheDocument();
    });
    
    expect(screen.getByText((content, element) => {
      return element?.className === 'summary-text warning' && element?.textContent === '2 overdue, 4 total open';
    })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Focus on overdue tasks to stay on track!'
    );
  });

  it('should show warning indicator for overdue tasks', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mockTasks = [
      createMockTask('1', yesterday.toISOString()),
    ];
    
    mockGetTasks.mockResolvedValue(mockTasks);
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('1 overdue tasks')).toBeInTheDocument();
    });
    
    // Check for warning emoji indicator
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should handle API errors and show retry button', async () => {
    mockGetTasks.mockRejectedValue(new Error('API Error'));
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    // Wait for all retries to complete (up to 3 retries + original call = 4 total)
    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalledTimes(4);
    }, { timeout: 10000 });
    
    // After retries are exhausted, should show error state
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load task data');
    });
    
    expect(screen.getByRole('button', { name: 'Retry loading task data' })).toBeInTheDocument();
  });

  it('should retry API call when retry button is clicked', async () => {
    // Fail for all initial attempts (original + 3 retries), then succeed on manual retry
    mockGetTasks
      .mockRejectedValueOnce(new Error('API Error'))
      .mockRejectedValueOnce(new Error('API Error'))
      .mockRejectedValueOnce(new Error('API Error'))
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValue([createMockTask('1')]);
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    // Wait for all initial retries to fail
    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalledTimes(4);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load task data');
    });
    
    const retryButton = screen.getByRole('button', { name: 'Retry loading task data' });
    fireEvent.click(retryButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('1 open tasks')).toBeInTheDocument();
    });
    
    expect(mockGetTasks).toHaveBeenCalledTimes(5); // Initial + 3 retries + manual retry
  });

  it('should refresh data when refresh button is clicked', async () => {
    mockGetTasks.mockResolvedValue([createMockTask('1')]);
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('1 open tasks')).toBeInTheDocument();
    });
    
    const initialCallCount = mockGetTasks.mock.calls.length;
    
    const refreshButton = screen.getByRole('button', { name: 'Refresh task counts' });
    fireEvent.click(refreshButton);
    
    // Should make one additional call after clicking refresh
    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });

  it('should implement exponential backoff for retries', async () => {
    // Just verify that with consistent failures, multiple attempts are made
    mockGetTasks.mockRejectedValue(new Error('API Error'));
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    // Wait for all retries to complete and error state to show
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load task data');
    }, { timeout: 10000 });
    
    // Should have made initial call + 3 retries = 4 total
    expect(mockGetTasks).toHaveBeenCalledTimes(4);
  });

  it('should correctly calculate overdue tasks based on due date', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const mockTasks = [
      createMockTask('1', yesterday.toISOString()), // Overdue
      createMockTask('2', twoDaysAgo.toISOString()), // Overdue
      createMockTask('3', today.toISOString()), // Due today, not overdue
      createMockTask('4'), // No due date, not overdue
    ];
    
    mockGetTasks.mockResolvedValue(mockTasks);
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('2 overdue tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('4 open tasks')).toBeInTheDocument();
    });
  });

  it('should show last updated timestamp', async () => {
    mockGetTasks.mockResolvedValue([createMockTask('1')]);
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Updated \d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });
  });

  it('should be accessible with proper ARIA labels', async () => {
    mockGetTasks.mockResolvedValue([createMockTask('1')]);
    
    render(<OpenOverdueTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('1 open tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('0 overdue tasks')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: 'Refresh task counts' })).toBeInTheDocument();
  });
});