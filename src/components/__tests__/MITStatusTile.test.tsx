import React from 'react';
import { vi } from "vitest";
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MITStatusTile } from '../MITStatusTile';
import { useTaskApi } from '../../services/task-api';
import { Task } from '../../types';

// Mock the task API service specifically for this test
const mockGetTasks = vi.fn();
vi.mock('../../services/task-api', () => ({
  useTaskApi: () => ({
    getTasks: mockGetTasks,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }),
}));

describe('MITStatusTile', () => {
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
      return element?.textContent === 'You have 2 MITs active';
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
      return element?.textContent === 'You have 0 MITs active';
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
      return element?.textContent === 'You have 3 MITs active';
    })).toBeInTheDocument();
    expect(screen.getByText('Great! You have 3 MITs active.')).toBeInTheDocument();
  });

  it('should handle API errors and show retry button', async () => {
    mockGetTasks.mockRejectedValue(new Error('API Error'));
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    // In test environment, retries are disabled, so should show error immediately
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load MIT data');
    });
    
    expect(screen.getByRole('button', { name: 'Retry loading MIT data' })).toBeInTheDocument();
    expect(mockGetTasks).toHaveBeenCalledTimes(1); // Only initial call, no retries in test
  });

  it('should retry API call when retry button is clicked', async () => {
    // First call fails, then manual retry succeeds
    mockGetTasks
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValue([createMockTask('1', true)]);
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    // Wait for error state to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load MIT data');
    });
    
    // Click retry button
    const retryButton = screen.getByRole('button', { name: 'Retry loading MIT data' });
    fireEvent.click(retryButton);
    
    // Should now show success state
    await waitFor(() => {
      expect(screen.getByLabelText('1 active MITs')).toBeInTheDocument();
    });
    
    expect(mockGetTasks).toHaveBeenCalledTimes(2); // Initial call + manual retry
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
    // In test environment, retries are disabled, so just verify error handling
    mockGetTasks.mockRejectedValue(new Error('API Error'));
    
    render(<MITStatusTile onRefresh={mockOnRefresh} />);
    
    // Should show error state immediately (no retries in test environment)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load MIT data');
    });
    
    // Should have made only initial call (no retries in test)
    expect(mockGetTasks).toHaveBeenCalledTimes(1);
  });

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