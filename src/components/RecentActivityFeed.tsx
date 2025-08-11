import React, { useState, useEffect, useCallback } from 'react';
import { useTaskApi } from '../services/task-api';

interface RecentActivityFeedProps {
  onRefresh?: () => void;
}

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

interface RecentActivityData {
  activities: ActivityEntry[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ onRefresh }) => {
  const { getRecentActivity } = useTaskApi();
  const [data, setData] = useState<RecentActivityData>({
    activities: [],
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });
  const [retryCount, setRetryCount] = useState(0);

  const fetchRecentActivity = useCallback(async (attempt: number = 0) => {
    // Prevent excessive retries
    if (attempt > 3) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load recent activity after multiple attempts',
      }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await getRecentActivity(5);
      
      // The API returns an array of activities directly
      let activities: ActivityEntry[] = [];
      if (Array.isArray(response)) {
        activities = response;
      } else {
        console.warn('Unexpected API response format:', response);
        activities = [];
      }

      setData({
        activities,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      });

      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      
      // Only retry if we haven't exceeded the limit
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        setRetryCount(attempt + 1);
        setTimeout(() => {
          fetchRecentActivity(attempt + 1);
        }, delay);
      } else {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load recent activity',
        }));
        setRetryCount(0);
      }
    }
  }, [getRecentActivity]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchRecentActivity(0);
  }, [fetchRecentActivity]);

  // Initial load
  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  // Listen for dashboard refresh events with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleRefresh = () => {
      // Debounce rapid refresh calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchRecentActivity();
      }, 500);
    };

    window.addEventListener('dashboardTabSwitch', handleRefresh);
    window.addEventListener('taskUpdated', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
      window.removeEventListener('taskUpdated', handleRefresh);
    };
  }, [fetchRecentActivity]);

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'completion':
        return '✔️';
      case 'priority_change':
        return '🟡';
      case 'creation':
        return '➕';
      default:
        return '📝';
    }
  };

  const getActivityDescription = (activity: ActivityEntry): string => {
    switch (activity.type) {
      case 'completion':
        return `Completed: ${activity.taskTitle}`;
      case 'priority_change':
        if (activity.details.newValue === 'MIT') {
          return `Moved to MIT: ${activity.taskTitle}`;
        } else if (activity.details.oldValue === 'MIT') {
          return `Moved from MIT: ${activity.taskTitle}`;
        } else {
          return `Changed priority: ${activity.taskTitle}`;
        }
      case 'creation':
        return `Created: ${activity.taskTitle}`;
      default:
        return `Updated: ${activity.taskTitle}`;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const renderContent = () => {
    if (data.isLoading) {
      return (
        <div className="widget-loading" aria-live="polite">
          <div className="loading-spinner-small"></div>
          <span className="sr-only">Loading recent activity...</span>
        </div>
      );
    }

    if (data.error) {
      return (
        <div className="widget-error" role="alert">
          <p className="error-message">Failed to load recent activity</p>
          <button 
            className="retry-button-small"
            onClick={handleRetry}
            aria-label="Retry loading recent activity"
          >
            Retry
          </button>
          {retryCount > 0 && (
            <p className="retry-info">Attempt {retryCount}/3</p>
          )}
        </div>
      );
    }

    if (data.activities.length === 0) {
      return (
        <div className="recent-activity-empty">
          <div className="empty-state-icon" aria-hidden="true">📋</div>
          <p className="empty-state-text">
            No recent activity
          </p>
        </div>
      );
    }

    return (
      <div className="recent-activity-content">
        <div className="activity-list">
          {(data.activities || []).map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon" aria-hidden="true">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-details">
                <div className="activity-description">
                  {getActivityDescription(activity)}
                </div>
                <div className="activity-timestamp">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="widget-tile recent-activity-tile">
      <div className="widget-header">
        <h3 className="widget-title">Recent Activity</h3>
        <button 
          className="refresh-button"
          onClick={() => fetchRecentActivity()}
          aria-label="Refresh recent activity"
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