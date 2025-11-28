import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useMemo } from 'react';
import { Task } from '../types';

interface ActivityEntry {
  id: string;
  type: 'completion' | 'priority_change' | 'creation';
  taskId: string;
  taskTitle: string;
  timestamp: string;
  details: {
    oldValue?: string;
    newValue?: string;
  };
}

const API_SERVER_URL = process.env.REACT_APP_API_SERVER_URL;

export const useTaskApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const authenticatedRequest = useCallback(
    async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: unknown) => {
      const accessToken = await getAccessTokenSilently();
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: body ? JSON.stringify(body) : undefined
      };

      const response = await fetch(`${API_SERVER_URL}/${endpoint}`, config);

      if (!response.ok) {
        // Try to parse error response for more specific error handling
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        const error: any = new Error(errorData.message || `API request failed: ${response.statusText}`);
        error.status = response.status;
        error.errorCode = errorData.error;
        error.details = errorData;
        throw error;
      }

      if (response.status === 204) {
        return;
      }

      return response.json();
    },
    [getAccessTokenSilently]
  );

  const getTasks = useCallback(
    async (filters: { 
      status?: string[]; 
      tags?: string[]; 
      search?: string;
      dateFilter?: string;
      startDate?: string;
      endDate?: string;
      noDueDate?: boolean;
    }): Promise<Task[]> => {
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status.length > 0) {
        queryParams.append('status', filters.status.join(','));
      }
      if (filters.tags && filters.tags.length > 0) {
        queryParams.append('tags', filters.tags.join(','));
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.dateFilter) {
        queryParams.append('dateFilter', filters.dateFilter);
      }
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      if (filters.noDueDate) {
        queryParams.append('noDueDate', 'true');
      }
      return authenticatedRequest('GET', `api/tasks?${queryParams.toString()}`);
    },
    [authenticatedRequest]
  );

  const createTask = useCallback(
    async (taskData: Partial<Task>): Promise<Task> => {
      return authenticatedRequest('POST', 'api/tasks', taskData);
    },
    [authenticatedRequest]
  );

  const updateTask = useCallback(
    async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
      return authenticatedRequest('PUT', `api/tasks/${taskId}`, taskData);
    },
    [authenticatedRequest]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      return authenticatedRequest('DELETE', `api/tasks/${taskId}`);
    },
    [authenticatedRequest]
  );

  const getRecentActivity = useCallback(
    async (limit: number = 5): Promise<ActivityEntry[]> => {
      return authenticatedRequest('GET', `api/tasks/activity?limit=${limit}`);
    },
    [authenticatedRequest]
  );

  return useMemo(
    () => ({
      getTasks,
      createTask,
      updateTask,
      deleteTask,
      getRecentActivity
    }),
    [getTasks, createTask, updateTask, deleteTask, getRecentActivity]
  );
};
