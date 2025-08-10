import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MITTaskList } from '../MITTaskList';

// Mock the useTaskApi hook
const mockGetTasks = jest.fn();
const mockCreateTask = jest.fn();
const mockUpdateTask = jest.fn();

jest.mock('../../services/task-api', () => ({
  useTaskApi: () => ({
    getTasks: mockGetTasks,
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
  }),
}));

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
  }),
}));

describe('MITTaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockGetTasks.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<MITTaskList />);
    expect(screen.getByText('Loading MIT tasks...')).toBeInTheDocument();
  });

  it('should render MIT tasks when loaded', async () => {
    const mockTasks = [
      {
        TaskId: '1',
        title: 'Important Task 1',
        description: 'A very important task',
        dueDate: '2024-01-15',
        status: 'Open',
        isMIT: true,
        priority: 1,
        creationDate: '2024-01-01T00:00:00.000Z',
        modifiedDate: '2024-01-01T00:00:00.000Z',
        completedDate: null,
        UserId: 'user1',
        tags: ['work']
      },
      {
        TaskId: '2',
        title: 'Important Task 2',
        description: 'Another important task',
        dueDate: '2024-01-20',
        status: 'Open',
        isMIT: true,
        priority: 2,
        creationDate: '2024-01-02T00:00:00.000Z',
        modifiedDate: '2024-01-02T00:00:00.000Z',
        completedDate: null,
        UserId: 'user1',
        tags: ['personal']
      }
    ];

    mockGetTasks.mockResolvedValue(mockTasks);
    render(<MITTaskList />);

    await waitFor(() => {
      expect(screen.getByText('Important Task 1')).toBeInTheDocument();
      expect(screen.getByText('Important Task 2')).toBeInTheDocument();
    });

    expect(screen.getByText('2 MITs')).toBeInTheDocument();
  });

  it('should show empty state when no MITs found', async () => {
    mockGetTasks.mockResolvedValue([
      {
        TaskId: '1',
        title: 'Regular Task',
        status: 'Open',
        isMIT: false,
        creationDate: '2024-01-01T00:00:00.000Z',
        modifiedDate: '2024-01-01T00:00:00.000Z'
      }
    ]);
    
    render(<MITTaskList />);

    await waitFor(() => {
      expect(screen.getByText('No MITs found. Great job staying organized!')).toBeInTheDocument();
    });
  });

  it('should show error state when API fails', async () => {
    mockGetTasks.mockRejectedValue(new Error('API Error'));
    render(<MITTaskList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load MIT tasks')).toBeInTheDocument();
    });
  });
}); 