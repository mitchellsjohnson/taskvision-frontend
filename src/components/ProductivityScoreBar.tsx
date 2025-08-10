import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface ProductivityScoreBarProps {
  onRefresh?: () => void;
}

interface ProductivityMetrics {
  completedTasks: number;
  createdTasks: number;
  completedMITs: number;
  createdMITs: number;
  taskScore: number;
  mitScore: number;
  finalScore: number;
}

interface ProductivityScoreData {
  metrics: ProductivityMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  weekRange: string;
}

const getWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based week
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return `Week of ${formatDate(monday)}–${formatDate(sunday)}`;
};

export const ProductivityScoreBar: React.FC<ProductivityScoreBarProps> = ({ onRefresh }) => {
  const [data, setData] = useState<ProductivityScoreData>({
    metrics: null,
    isLoading: true,
    error: null,
    lastUpdated: 0,
    weekRange: getWeekRange(),
  });
  const [retryCount, setRetryCount] = useState(0);

  const fetchProductivityMetrics = useCallback(async (attempt: number = 0) => {
    // Prevent excessive retries
    if (attempt > 3) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load productivity metrics after multiple attempts',
      }));
      return;
    }

    try {
      setData(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        weekRange: getWeekRange() // Update week range on fetch
      }));
      
      const response = await axios.get('/api/tasks/metrics?days=7');
      const metrics = response.data as ProductivityMetrics;

      setData({
        metrics,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
        weekRange: getWeekRange(),
      });
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error fetching productivity metrics:', error);
      
      // Exponential backoff for retries
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      setTimeout(() => {
        fetchProductivityMetrics(attempt + 1);
      }, delay);
      
      setRetryCount(attempt + 1);
    }
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProductivityMetrics();
  }, []);

  // Listen for dashboard refresh events with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleRefresh = () => {
      // Debounce rapid refresh calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchProductivityMetrics();
      }, 500);
    };

    window.addEventListener('dashboardTabSwitch', handleRefresh);
    window.addEventListener('taskUpdated', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
      window.removeEventListener('taskUpdated', handleRefresh);
    };
  }, [fetchProductivityMetrics]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchProductivityMetrics();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (data.isLoading) {
    return (
      <div className="productivity-score-widget">
        <div className="widget-header">
          <h3 className="widget-title">Weekly Productivity Score</h3>
          <span className="week-range">{data.weekRange}</span>
        </div>
        <div className="widget-content loading">
          <div className="loading-spinner"></div>
          <p>Loading productivity score...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="productivity-score-widget">
        <div className="widget-header">
          <h3 className="widget-title">Weekly Productivity Score</h3>
          <span className="week-range">{data.weekRange}</span>
        </div>
        <div className="widget-content error" role="alert">
          <p>{data.error}</p>
          <button 
            className="retry-button"
            onClick={handleRetry}
            disabled={data.isLoading}
            aria-label="Retry loading productivity score"
          >
            {retryCount > 0 ? `Retry (${retryCount}/3)` : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (!data.metrics) {
    return (
      <div className="productivity-score-widget">
        <div className="widget-header">
          <h3 className="widget-title">Weekly Productivity Score</h3>
          <span className="week-range">{data.weekRange}</span>
        </div>
        <div className="widget-content empty">
          <p>No productivity data available</p>
        </div>
      </div>
    );
  }

  const score = data.metrics.finalScore;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className="productivity-score-widget">
      <div className="widget-header">
        <h3 className="widget-title">Weekly Productivity Score</h3>
        <span className="week-range">{data.weekRange}</span>
      </div>
      
      <div className="widget-content">
        <div className="score-display">
          <div className="score-circle">
            <svg className="score-ring" width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={scoreColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className="score-progress"
              />
            </svg>
            <div className="score-text">
              <span className="score-number" style={{ color: scoreColor }}>
                {score}
              </span>
              <span className="score-label">{scoreLabel}</span>
            </div>
          </div>
        </div>

        <div className="score-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Tasks</span>
            <span className="breakdown-value">
              {data.metrics.completedTasks}/{data.metrics.createdTasks}
            </span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">MITs</span>
            <span className="breakdown-value">
              {data.metrics.completedMITs}/{data.metrics.createdMITs}
            </span>
          </div>
        </div>

        <div className="widget-footer">
          <span className="last-updated">
            Updated {new Date(data.lastUpdated).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <button 
            className="refresh-button"
            onClick={handleRetry}
            aria-label="Refresh productivity score"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
}; 