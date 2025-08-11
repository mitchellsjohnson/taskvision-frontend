import React, { useState, useEffect, useCallback } from 'react';
import { useWellnessApi } from '../services/wellness-api';

interface WellnessPromptTileProps {
  onRefresh?: () => void;
  onNavigateToWellness?: () => void;
}

interface WellnessStatus {
  completedToday: number;
  totalPractices: number;
  practices: {
    gratitude: boolean;
    reflection: boolean;
    exercise: boolean;
  };
}

interface WellnessPromptData {
  status: WellnessStatus | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export const WellnessPromptTile: React.FC<WellnessPromptTileProps> = ({ 
  onRefresh, 
  onNavigateToWellness 
}) => {
  const { getPracticeInstances, getWeekStart } = useWellnessApi();
  const [data, setData] = useState<WellnessPromptData>({
    status: null,
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });
  const [retryCount, setRetryCount] = useState(0);

  const fetchWellnessStatus = useCallback(async (attempt: number = 0) => {
    // Prevent excessive retries
    if (attempt > 3) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load wellness status after multiple attempts',
      }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
             // Get today's date and week start
       const today = new Date();
       const weekStart = getWeekStart(today, "America/New_York");
       
       // Get today's practice instances (week range)
       const weekEnd = new Date(today);
       weekEnd.setDate(today.getDate() + 6);
       const weekEndStr = weekEnd.toISOString().split('T')[0];
       const todayPractices = await getPracticeInstances(weekStart, weekEndStr);
       
       // Filter for today's practices
       const todayStr = today.toISOString().split('T')[0];
       const todaysInstances = todayPractices.filter(practice => 
         practice.date === todayStr
       );

       // Calculate completion status
       const practices = {
         gratitude: todaysInstances.some(p => p.practice === 'Gratitude' && p.completed),
         reflection: todaysInstances.some(p => p.practice === 'Savoring Reflection' && p.completed),
         exercise: todaysInstances.some(p => p.practice === 'Exercise' && p.completed),
       };

      const completedToday = Object.values(practices).filter(Boolean).length;
      const totalPractices = 3;

      const status: WellnessStatus = {
        completedToday,
        totalPractices,
        practices,
      };

      setData({
        status,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      });

      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching wellness status:', error);
      
      // Only retry if we haven't exceeded the limit
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        setRetryCount(attempt + 1);
        setTimeout(() => {
          fetchWellnessStatus(attempt + 1);
        }, delay);
      } else {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load wellness status',
        }));
        setRetryCount(0);
      }
    }
  }, [getPracticeInstances, getWeekStart]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchWellnessStatus(0);
  }, [fetchWellnessStatus]);

  const handleNavigateToWellness = useCallback(() => {
    // Trigger custom event for tab navigation
    window.dispatchEvent(new CustomEvent('navigateToWellnessTab'));
    onNavigateToWellness?.();
  }, [onNavigateToWellness]);

  // Initial load
  useEffect(() => {
    fetchWellnessStatus();
  }, []); // Empty dependency array to run only once on mount

  // Listen for dashboard refresh events with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleRefresh = () => {
      // Debounce rapid refresh calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchWellnessStatus();
      }, 500);
    };

    window.addEventListener('dashboardTabSwitch', handleRefresh);
    window.addEventListener('wellnessDataUpdated', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
      window.removeEventListener('wellnessDataUpdated', handleRefresh);
    };
  }, [fetchWellnessStatus]);

  const renderContent = () => {
    if (data.isLoading) {
      return (
        <div className="widget-loading" aria-live="polite">
          <div className="loading-spinner-small"></div>
          <span className="sr-only">Loading wellness status...</span>
        </div>
      );
    }

    if (data.error || !data.status) {
      return (
        <div className="widget-error" role="alert">
          <p className="error-message">Failed to load wellness status</p>
          <button 
            className="retry-button-small"
            onClick={handleRetry}
            aria-label="Retry loading wellness status"
          >
            Retry
          </button>
          {retryCount > 0 && (
            <p className="retry-info">Attempt {retryCount}/3</p>
          )}
        </div>
      );
    }

    const { status } = data;
    const isComplete = status.completedToday === status.totalPractices;

    return (
      <div className="wellness-prompt-content">
        <div className="wellness-status-display">
          <div className="wellness-icon" aria-hidden="true">
            {isComplete ? '🌟' : '🧘‍♀️'}
          </div>
          
          <div className="wellness-message">
            {isComplete ? (
              <p className="wellness-complete-message">
                <strong>Great job!</strong> You've completed your wellness goals today.
              </p>
            ) : (
              <p className="wellness-incomplete-message">
                You've done <strong>{status.completedToday} of {status.totalPractices}</strong> wellness practices — finish strong 💪
              </p>
            )}
          </div>
        </div>

        <div className="wellness-practices-preview">
          <div className="practices-list">
            <div className={`practice-item ${status.practices.gratitude ? 'completed' : ''}`}>
              <span className="practice-icon" aria-hidden="true">
                {status.practices.gratitude ? '✅' : '⭕'}
              </span>
              <span className="practice-name">Gratitude</span>
            </div>
            <div className={`practice-item ${status.practices.reflection ? 'completed' : ''}`}>
              <span className="practice-icon" aria-hidden="true">
                {status.practices.reflection ? '✅' : '⭕'}
              </span>
              <span className="practice-name">Reflection</span>
            </div>
            <div className={`practice-item ${status.practices.exercise ? 'completed' : ''}`}>
              <span className="practice-icon" aria-hidden="true">
                {status.practices.exercise ? '✅' : '⭕'}
              </span>
              <span className="practice-name">Exercise</span>
            </div>
          </div>
        </div>

        <div className="wellness-action">
          <button 
            className="wellness-navigate-button"
            onClick={handleNavigateToWellness}
            aria-label="Go to wellness dashboard"
          >
            {isComplete ? 'View Wellness Dashboard' : 'Complete Wellness Practices'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="widget-tile wellness-prompt-tile">
      <div className="widget-header">
        <h3 className="widget-title">Wellness Check</h3>
        <button 
          className="refresh-button"
          onClick={() => fetchWellnessStatus()}
          aria-label="Refresh wellness status"
          disabled={data.isLoading}
        >
          <span className={`refresh-icon ${data.isLoading ? 'spinning' : ''}`}>
            🔄
          </span>
        </button>
      </div>
      
      <div className="widget-content">
        {renderContent()}
      </div>
      
      {data.lastUpdated > 0 && (
        <div className="widget-footer">
          <span className="last-updated">
            Updated {new Date(data.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}; 