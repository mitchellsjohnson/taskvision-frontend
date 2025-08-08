import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

interface TaskOverviewSummaryProps {
  onRefresh?: () => void;
}

interface TaskSummary {
  totalOpen: number;
  overdueCount: number;
  completedThisWeek: number;
}

export const TaskOverviewSummary: React.FC<TaskOverviewSummaryProps> = ({ onRefresh }) => {
  const [summary, setSummary] = useState<TaskSummary>({
    totalOpen: 0,
    overdueCount: 0,
    completedThisWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getAccessTokenSilently } = useAuth0();

  const fetchTaskSummary = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await axios.get(
        `${process.env.REACT_APP_API_SERVER_URL}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const tasks = response.data;
      const activeTasks = tasks.filter((task: any) => task.status === 'Open' || task.status === 'Waiting');
      const completedTasks = tasks.filter((task: any) => task.status === 'Completed');
      const overdueTasks = activeTasks.filter((task: any) => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < new Date();
      });

      setSummary({
        totalOpen: activeTasks.length,
        overdueCount: overdueTasks.length,
        completedThisWeek: completedTasks.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task summary');
    } finally {
      setIsLoading(false);
    }
  }, [user, getAccessTokenSilently]);

  useEffect(() => {
    fetchTaskSummary();
  }, [fetchTaskSummary]);

  if (isLoading) {
    return (
      <div className="task-overview-summary-widget">
        <h3 className="widget-title">Task Overview</h3>
        <div className="widget-content loading">
          <div className="loading-spinner"></div>
          <p>Loading task summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-overview-summary-widget">
        <h3 className="widget-title">Task Overview</h3>
        <div className="widget-content error" role="alert">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={fetchTaskSummary}
            aria-label="Retry loading task summary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-overview-summary-widget">
      <h3 className="widget-title">Task Overview</h3>
      <div className="widget-content">
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-number">{summary.totalOpen}</div>
            <div className="summary-label">Open Tasks</div>
          </div>
          
          <div className="summary-item overdue">
            <div className="summary-number">{summary.overdueCount}</div>
            <div className="summary-label">Overdue</div>
          </div>
          
          <div className="summary-item completed">
            <div className="summary-number">{summary.completedThisWeek}</div>
            <div className="summary-label">Completed This Week</div>
          </div>
        </div>
        
        <div className="widget-footer">
          <span className="last-updated">
            Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button 
            className="refresh-button"
            onClick={fetchTaskSummary}
            aria-label="Refresh task summary"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
}; 