import React, { useState, useEffect, useCallback } from 'react';
import { useTaskApi } from '../services/task-api';
import { Task } from '../types';

interface OpenOverdueTileProps {
  onRefresh?: () => void;
}

interface TaskCountData {
  openTasks: number;
  overdueTasks: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export const OpenOverdueTile: React.FC<OpenOverdueTileProps> = ({ onRefresh }) => {
  const { getTasks } = useTaskApi();
  const [data, setData] = useState<TaskCountData>({
    openTasks: 0,
    overdueTasks: 0,
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });
  const [retryCount, setRetryCount] = useState(0);

  const fetchTaskCounts = useCallback(async (attempt: number = 0) => {
    // Prevent excessive retries
    if (attempt > 3) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load task data after multiple attempts',
      }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Query for all open tasks
      const openTasks: Task[] = await getTasks({
        status: ['Open'],
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      // Calculate overdue tasks (dueDate < today)
      const overdueTasks = openTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length;

      setData({
        openTasks: openTasks.length,
        overdueTasks,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      });

      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching task counts:', error);
      
      // Only retry if we haven't exceeded the limit
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        setRetryCount(attempt + 1);
        setTimeout(() => {
          fetchTaskCounts(attempt + 1);
        }, delay);
      } else {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load task data',
        }));
        setRetryCount(0);
      }
    }
  }, [getTasks]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchTaskCounts(0);
  }, [fetchTaskCounts]);

  // Initial load
  useEffect(() => {
    fetchTaskCounts();
  }, []); // Empty dependency array to run only once on mount

  // Listen for dashboard refresh events with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleRefresh = () => {
      // Debounce rapid refresh calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchTaskCounts();
      }, 500);
    };

    window.addEventListener('dashboardTabSwitch', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
    };
  }, [fetchTaskCounts]);

  const renderContent = () => {
    if (data.isLoading) {
      return (
        <div className="widget-loading" aria-live="polite">
          <div className="loading-spinner-small"></div>
          <span className="sr-only">Loading task counts...</span>
        </div>
      );
    }

    if (data.error) {
      return (
        <div className="widget-error" role="alert">
          <p className="error-message">Failed to load task data</p>
          <button 
            className="retry-button-small"
            onClick={handleRetry}
            aria-label="Retry loading task data"
          >
            Retry
          </button>
          {retryCount > 0 && (
            <p className="retry-info">Attempt {retryCount}/3</p>
          )}
        </div>
      );
    }

    return (
      <div className="task-counts-content">
        <div className="task-counts-grid">
          <div className="count-item overdue-count">
            <div className="count-number" aria-label={`${data.overdueTasks} overdue tasks`}>
              {data.overdueTasks}
            </div>
            <div className="count-label">Overdue</div>
            {data.overdueTasks > 0 && (
              <div className="count-indicator overdue-indicator" aria-hidden="true">
                ⚠️
              </div>
            )}
          </div>
          
          <div className="count-item open-count">
            <div className="count-number" aria-label={`${data.openTasks} open tasks`}>
              {data.openTasks}
            </div>
            <div className="count-label">Open</div>
          </div>
        </div>

        <div className="task-summary">
          {data.overdueTasks > 0 ? (
            <p className="summary-text warning">
              <strong>{data.overdueTasks}</strong> overdue, <strong>{data.openTasks}</strong> total open
            </p>
          ) : (
            <p className="summary-text">
              <strong>{data.openTasks}</strong> open tasks, none overdue
            </p>
          )}
        </div>

        {data.overdueTasks > 0 && (
          <div className="overdue-warning" role="alert">
            <p className="warning-text">
              Focus on overdue tasks to stay on track!
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="widget-tile open-overdue-tile">
      <div className="widget-header">
        <h3 className="widget-title">Task Overview</h3>
        <button 
          className="refresh-button"
          onClick={() => fetchTaskCounts()}
          aria-label="Refresh task counts"
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