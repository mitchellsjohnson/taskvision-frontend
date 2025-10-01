import React, { useState, useEffect, useCallback } from 'react';
import { useTaskApi } from '../services/task-api';
import { Task } from '../types';

interface MITStatusTileProps {
  onRefresh?: () => void;
}

interface MITStatusData {
  activeMITs: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export const MITStatusTile: React.FC<MITStatusTileProps> = ({ onRefresh }) => {
  const { getTasks } = useTaskApi();
  const [data, setData] = useState<MITStatusData>({
    activeMITs: 0,
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });
  const [retryCount, setRetryCount] = useState(0);

  const fetchMITData = useCallback(async (attempt: number = 0) => {
    // Prevent excessive retries
    if (attempt > 3) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load MIT data after multiple attempts',
      }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Query for MIT tasks with Open status
      const mitTasks: Task[] = await getTasks({
        status: ['Open'],
      });

      // Filter for MIT tasks (isMIT = true)
      const activeMITs = mitTasks.filter(task => task.isMIT).length;

      setData({
        activeMITs,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      });

      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching MIT data:', error);
      
      // Disable retries in test environment to prevent infinite loops
      const isTestEnv = process.env.NODE_ENV === 'test' || process.env.REACT_APP_DISABLE_RETRIES === 'true';
      
      // Only retry if we haven't exceeded the limit and not in test environment
      if (attempt < 3 && !isTestEnv) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        setRetryCount(attempt + 1);
        setTimeout(() => {
          fetchMITData(attempt + 1);
        }, delay);
      } else {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load MIT data',
        }));
        setRetryCount(0);
      }
    }
  }, [getTasks]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchMITData(0);
  }, [fetchMITData]);

  // Initial load
  useEffect(() => {
    fetchMITData();
  }, []); // Empty dependency array to run only once on mount

  // Listen for dashboard refresh events with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleRefresh = () => {
      // Debounce rapid refresh calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchMITData();
      }, 500);
    };

    window.addEventListener('dashboardTabSwitch', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
    };
  }, [fetchMITData]);

  const renderContent = () => {
    if (data.isLoading) {
      return (
        <div className="widget-loading" aria-live="polite">
          <div className="loading-spinner-small"></div>
          <span className="sr-only">Loading MIT status...</span>
        </div>
      );
    }

    if (data.error) {
      return (
        <div className="widget-error" role="alert">
          <p className="error-message">Failed to load MIT data</p>
          <button 
            className="retry-button-small"
            onClick={handleRetry}
            aria-label="Retry loading MIT data"
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
      <div className="mit-status-content">
        <div className="mit-count-display">
          <span className="mit-count" aria-label={`${data.activeMITs} active MITs`}>
            {data.activeMITs}
          </span>
        </div>
        <p className="mit-description">
          You have <strong>{data.activeMITs} MITs</strong> active
        </p>
        
        {data.activeMITs === 0 && (
          <div className="mit-warning" role="alert">
            <span className="warning-icon" aria-hidden="true">⚠️</span>
            <p className="warning-text">
              No MITs active! Consider promoting important tasks to MIT status.
            </p>
          </div>
        )}
        
        {data.activeMITs >= 3 && (
          <div className="mit-success">
            <span className="success-icon" aria-hidden="true">✅</span>
            <p className="success-text">
              Great! You have {data.activeMITs} MITs active.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="widget-tile mit-status-tile">
      <div className="widget-header">
        <h3 className="widget-title">MIT Status</h3>
        <button 
          className="refresh-button"
          onClick={() => fetchMITData()}
          aria-label="Refresh MIT status"
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