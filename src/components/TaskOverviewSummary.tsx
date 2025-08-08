import React, { useState, useEffect } from 'react';
import { useTaskApi } from '../services/task-api';

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
  const { getTasks } = useTaskApi();

  const getWeekDateRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based week
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    
    return {
      weekStart: monday.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0]
    };
  };

  const fetchTaskSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { weekStart, today } = getWeekDateRange();
      
      // Fetch all tasks to calculate summary
      const [openTasks, completedTasks] = await Promise.all([
        getTasks({ status: ['Open'] }),
        getTasks({ status: ['Completed'], startDate: weekStart })
      ]);
      
      // Calculate overdue count
      const overdueCount = openTasks.filter(task => 
        task.dueDate && task.dueDate < today
      ).length;
      
      // Calculate completed this week count
      const completedThisWeek = completedTasks.filter(task => 
        task.completedDate && task.completedDate >= weekStart + 'T00:00:00'
      ).length;
      
      setSummary({
        totalOpen: openTasks.length,
        overdueCount,
        completedThisWeek
      });
    } catch (err) {
      console.error('Error fetching task summary:', err);
      setError('Failed to load task summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps    fetchTaskSummary();
  }, []);

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