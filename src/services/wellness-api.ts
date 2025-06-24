import { useAuth0 } from '@auth0/auth0-react';
import { useState, useCallback, useMemo } from 'react';
import { 
  PracticeInstance, 
  WeeklyWellnessScore, 
  UserWellnessSettings, 
  WellnessStatus,
  CreatePracticeInstanceInput,
  UpdatePracticeInstanceInput,
  WellnessPractice
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:6060';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const useWellnessApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const authenticatedRequest = useCallback(
    async <T>(method: string, endpoint: string, body?: any): Promise<T> => {
      try {
        setLoading(true);
        setError(null);

        const token = await getAccessTokenSilently();
        
        const config: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };

        if (body) {
          config.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        // Handle 204 No Content responses
        if (response.status === 204) {
          return {} as T;
        }

        const result: ApiResponse<T> = await response.json();
        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        // Don't set error state for duplicate practice errors (these are handled by UI logic)
        if (!(err instanceof Error && err.message.includes('already exists'))) {
          setError(errorMessage);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAccessTokenSilently]
  );

  // Utility function to get week start (Monday) in Eastern Time
  const getWeekStart = useCallback((date: Date, timezone: string = "America/New_York"): string => {
    // Convert to specified timezone (default to Eastern Time)
    const timezoneDate = new Date(date.toLocaleString("en-US", {timeZone: timezone}));
    const day = timezoneDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate how many days to subtract to get to Monday
    const diff = timezoneDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    timezoneDate.setDate(diff);
    
    // Return in YYYY-MM-DD format
    const year = timezoneDate.getFullYear();
    const month = String(timezoneDate.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(timezoneDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${dayOfMonth}`;
  }, []);

  // Get practice instances for a date range
  const getPracticeInstances = useCallback(
    async (startDate: string, endDate: string): Promise<PracticeInstance[]> => {
      return authenticatedRequest<PracticeInstance[]>(
        'GET',
        `api/wellness/practices?startDate=${startDate}&endDate=${endDate}`
      );
    },
    [authenticatedRequest]
  );

  // Create a new practice instance
  const createPracticeInstance = useCallback(
    async (practiceData: CreatePracticeInstanceInput): Promise<PracticeInstance> => {
      return authenticatedRequest<PracticeInstance>(
        'POST',
        'api/wellness/practices',
        practiceData
      );
    },
    [authenticatedRequest]
  );

  // Update a practice instance
  const updatePracticeInstance = useCallback(
    async (
      date: string, 
      practice: WellnessPractice, 
      updateData: UpdatePracticeInstanceInput
    ): Promise<PracticeInstance> => {
      return authenticatedRequest<PracticeInstance>(
        'PUT',
        `api/wellness/practices/${date}/${practice}`,
        updateData
      );
    },
    [authenticatedRequest]
  );

  // Delete a practice instance
  const deletePracticeInstance = useCallback(
    async (date: string, practice: WellnessPractice): Promise<void> => {
      return authenticatedRequest<void>(
        'DELETE',
        `api/wellness/practices/${date}/${practice}`
      );
    },
    [authenticatedRequest]
  );

  // Get weekly wellness scores
  const getWeeklyScores = useCallback(
    async (weeks: number = 12): Promise<WeeklyWellnessScore[]> => {
      return authenticatedRequest<WeeklyWellnessScore[]>(
        'GET',
        `api/wellness/scores?weeks=${weeks}`
      );
    },
    [authenticatedRequest]
  );

  // Get current wellness status
  const getWellnessStatus = useCallback(
    async (): Promise<WellnessStatus> => {
      return authenticatedRequest<WellnessStatus>(
        'GET',
        'api/wellness/status'
      );
    },
    [authenticatedRequest]
  );

  // Get user wellness settings
  const getUserWellnessSettings = useCallback(
    async (): Promise<UserWellnessSettings> => {
      return authenticatedRequest<UserWellnessSettings>(
        'GET',
        'api/wellness/settings'
      );
    },
    [authenticatedRequest]
  );

  // Update user wellness settings
  const updateUserWellnessSettings = useCallback(
    async (
      updates: Partial<Pick<UserWellnessSettings, 'wellnessCheckAwareTVAgent' | 'lastWellnessNudge' | 'preferredPractices'>>
    ): Promise<UserWellnessSettings> => {
      return authenticatedRequest<UserWellnessSettings>(
        'PUT',
        'api/wellness/settings',
        updates
      );
    },
    [authenticatedRequest]
  );

  // Get practices for current week
  const getCurrentWeekPractices = useCallback(
    async (): Promise<PracticeInstance[]> => {
      const today = new Date();
      const weekStart = getWeekStart(today);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      return getPracticeInstances(weekStart, weekEndStr);
    },
    [getPracticeInstances, getWeekStart]
  );

  return useMemo(
    () => ({
      // State
      loading,
      error,
      clearError,
      
      // Utility functions
      getWeekStart,
      authenticatedRequest,
      
      // API methods
      getPracticeInstances,
      createPracticeInstance,
      updatePracticeInstance,
      deletePracticeInstance,
      getWeeklyScores,
      getWellnessStatus,
      getUserWellnessSettings,
      updateUserWellnessSettings,
      getCurrentWeekPractices,
    }),
    [
      loading,
      error,
      clearError,
      getWeekStart,
      authenticatedRequest,
      getPracticeInstances,
      createPracticeInstance,
      updatePracticeInstance,
      deletePracticeInstance,
      getWeeklyScores,
      getWellnessStatus,
      getUserWellnessSettings,
      updateUserWellnessSettings,
      getCurrentWeekPractices,
    ]
  );
}; 