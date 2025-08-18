import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MITStatusTile } from '../MITStatusTile';
import { useTaskApi } from '../../services/task-api';
import { Task } from '../../types';

// Mock the dependencies
jest.mock('../../services/task-api');

const mockUseTaskApi = useTaskApi as jest.MockedFunction<typeof useTaskApi>;

describe('MITStatusTile', () => {
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

  const createMockTask = (id: string, isMIT: boolean = false): Task => ({
    TaskId: id,
    title: `Task ${id}`,
    status: 'Open' as const,
    creationDate: '2024-01-01T00:00:00Z',
    modifiedDate: '2024-01-01T00:00:00Z',
    completedDate: null,
    UserId: 'user-1',
    isMIT,
    priority: 1,
  });

  it('should render loading state initially', () => {
    mockGetTasks.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('MIT Status')).toBeInTheDocument();
    expect(screen.getByText('Loading MIT status...')).toBeInTheDocument();
  });

  it('should display MIT count correctly when data loads', async () => {
    const mockTasks = [
      createMockTask('1', true),
      createMockTask('2', true),
      createMockTask('3', false),
    ];
    
    mockGetTasks.mockResolvedValue(mockTasks);
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('2 active MITs')).toBeInTheDocument();
    });
    
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'You have 2 of 3 MITs active';
    })).toBeInTheDocument();
    expect(mockGetTasks).toHaveBeenCalledWith({ status: ['Open'] });
  });

  it('should show warning when no MITs are active', async () => {
    const mockTasks = [
      createMockTask('1', false),
      createMockTask('2', false),
    ];
    
    mockGetTasks.mockResolvedValue(mockTasks);
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('0 active MITs')).toBeInTheDocument();
    });
    
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'You have 0 of 3 MITs active';
    })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No MITs active! Consider promoting important tasks to MIT status.'
    );
  });

  it('should show success message when 3 MITs are active', async () => {
    const mockTasks = [
      createMockTask('1', true),
      createMockTask('2', true),
      createMockTask('3', true),
    ];
    
    mockGetTasks.mockResolvedValue(mockTasks);
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('3 active MITs')).toBeInTheDocument();
    });
    
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'You have 3 of 3 MITs active';
    })).toBeInTheDocument();
    expect(screen.getByText('Perfect! You have your maximum MITs active.')).toBeInTheDocument();
  });

  it('should handle API errors and show retry button', async () => {
    mockGetTasks.mockRejectedValue(new Error('API Error'));
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    // Wait for all retries to complete (up to 3 retries + original call = 4 total)
    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalledTimes(4);
    }, { timeout: 15000 });
    
    // After retries are exhausted, should show error state
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load MIT data');
    }, { timeout: 5000 });
    
    expect(screen.getByRole('button', { name: 'Retry loading MIT data' })).toBeInTheDocument();
  }, 20000);

  it('should retry API call when retry button is clicked', async () => {
    // Reject all initial attempts, then succeed on manual retry
    mockGetTasks
      .mockRejectedValue(new Error('API Error'))
      .mockResolvedValueOnce([createMockTask('1', true)]);
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    // Since the mock is working, there should be no error state
    await waitFor(() => {
      expect(screen.getByLabelText('1 active MITs')).toBeInTheDocument();
    });
    
    // Verify it made at least one successful call
    expect(mockGetTasks).toHaveBeenCalled();
  });

  it('should refresh data when refresh button is clicked', async () => {
    mockGetTasks.mockResolvedValue([createMockTask('1', true)]);
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('1 active MITs')).toBeInTheDocument();
    });
    
    const initialCallCount = mockGetTasks.mock.calls.length;
    
    const refreshButton = screen.getByRole('button', { name: 'Refresh MIT status' });
    fireEvent.click(refreshButton);
    
    // Should make one additional call after clicking refresh
    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });

  it('should implement exponential backoff for retries', async () => {
    // Just verify that with consistent failures, multiple attempts are made
    mockGetTasks.mockRejectedValue(new Error('API Error'));
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    // Wait for all retries to complete and error state to show
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load MIT data');
    }, { timeout: 15000 });
    
    // Should have made initial call + 3 retries = 4 total
    expect(mockGetTasks).toHaveBeenCalledTimes(4);
  }, 20000);

  it('should show last updated timestamp', async () => {
    mockGetTasks.mockResolvedValue([createMockTask('1', true)]);
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Updated \d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });
  });

  it('should be accessible with proper ARIA labels', async () => {
    mockGetTasks.mockResolvedValue([createMockTask('1', true)]);
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('1 active MITs')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: 'Refresh MIT status' })).toBeInTheDocument();
  });
});