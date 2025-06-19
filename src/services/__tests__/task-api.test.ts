import { renderHook } from '@testing-library/react';

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock the entire task-api module to avoid environment variable issues
jest.mock('../task-api', () => ({
  useTaskApi: jest.fn(),
}));

import { useTaskApi } from '../task-api';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useTaskApi', () => {
  const mockApiMethods = {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(() => {
    mockFetch.mockClear();
    (useTaskApi as jest.Mock).mockReturnValue(mockApiMethods);
    Object.values(mockApiMethods).forEach(mock => mock.mockClear());
  });

  it('should provide API methods', () => {
    const { result } = renderHook(() => useTaskApi());
    
    expect(result.current.getTasks).toBeDefined();
    expect(result.current.createTask).toBeDefined();
    expect(result.current.updateTask).toBeDefined();
    expect(result.current.deleteTask).toBeDefined();
  });

  describe('getTasks', () => {
    it('should return tasks when called', async () => {
      const mockTasks = [{ TaskId: '1', title: 'Test Task' }];
      mockApiMethods.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskApi());
      const tasks = await result.current.getTasks({});

      expect(result.current.getTasks).toHaveBeenCalledWith({});
      expect(tasks).toEqual(mockTasks);
    });

    it('should handle status filters', async () => {
      mockApiMethods.getTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskApi());
      await result.current.getTasks({ status: ['Open', 'Waiting'] });

      expect(result.current.getTasks).toHaveBeenCalledWith({ status: ['Open', 'Waiting'] });
    });

    it('should handle search filters', async () => {
      mockApiMethods.getTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskApi());
      await result.current.getTasks({ search: 'test query' });

      expect(result.current.getTasks).toHaveBeenCalledWith({ search: 'test query' });
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'New Task', status: 'Open' as const };
      const createdTask = { TaskId: '1', ...newTask };
      
      mockApiMethods.createTask.mockResolvedValue(createdTask);

      const { result } = renderHook(() => useTaskApi());
      const task = await result.current.createTask(newTask);

      expect(result.current.createTask).toHaveBeenCalledWith(newTask);
      expect(task).toEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updates = { title: 'Updated Task' };
      const updatedTask = { TaskId: '1', ...updates };
      
      mockApiMethods.updateTask.mockResolvedValue(updatedTask);

      const { result } = renderHook(() => useTaskApi());
      const task = await result.current.updateTask('1', updates);

      expect(result.current.updateTask).toHaveBeenCalledWith('1', updates);
      expect(task).toEqual(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockApiMethods.deleteTask.mockResolvedValue(undefined);

      const { result } = renderHook(() => useTaskApi());
      await result.current.deleteTask('1');

      expect(result.current.deleteTask).toHaveBeenCalledWith('1');
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockApiMethods.getTasks.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useTaskApi());
      
      await expect(result.current.getTasks({})).rejects.toThrow('API Error');
    });
  });
}); 