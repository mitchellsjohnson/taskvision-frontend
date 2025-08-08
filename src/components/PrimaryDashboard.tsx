import React, { useState, useEffect, useCallback } from 'react';
import { MITTaskList } from './MITTaskList';
import { TopLITTasks } from './TopLITTasks';
import { ScheduledTasks } from './ScheduledTasks';
import { WellnessStatusWidget } from './WellnessStatusWidget';
import { TaskOverviewSummary } from './TaskOverviewSummary';
import { ProductivityScoreBar } from './ProductivityScoreBar';
import { RecentActivityFeed } from './RecentActivityFeed';

interface PrimaryDashboardProps {
  onDataUpdate: (data: any) => void;
  cachedData: any;
}

interface PrimaryDashboardData {
  lastRefresh: number;
}

export const PrimaryDashboard: React.FC<PrimaryDashboardProps> = ({ 
  onDataUpdate, 
  cachedData 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataRefresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      if (onDataUpdate) {
        const refreshData = {
          lastRefresh: Date.now(),
        };
        onDataUpdate(refreshData);
      }
    }, 1000);
  }, [onDataUpdate]);

  // Auto-refresh when cached data changes
  useEffect(() => {
    if (cachedData) {
      handleDataRefresh();
    }
  }, [cachedData, handleDataRefresh]);

  return (
    <div className="primary-dashboard">
      <div className="dashboard-grid">
        {/* Row 1: MIT + LIT Tasks (side-by-side layout) */}
        <div className="dashboard-row mit-lit-row">
          <div className="dashboard-widget">
            <MITTaskList onRefresh={handleDataRefresh} />
          </div>
          <div className="dashboard-widget">
            <TopLITTasks onRefresh={handleDataRefresh} />
          </div>
        </div>

        {/* Row 2: Scheduled Tasks */}
        <div className="dashboard-row">
          <div className="dashboard-widget full-width">
            <ScheduledTasks onRefresh={handleDataRefresh} />
          </div>
        </div>

        {/* Row 3: Wellness Status (includes journal entry support) */}
        <div className="dashboard-row">
          <div className="dashboard-widget full-width">
            <WellnessStatusWidget onRefresh={handleDataRefresh} />
          </div>
        </div>

        {/* Row 4: Task Overview Summary */}
        <div className="dashboard-row">
          <div className="dashboard-widget full-width">
            <TaskOverviewSummary onRefresh={handleDataRefresh} />
          </div>
        </div>

        {/* Row 5: Weekly Productivity Score */}
        <div className="dashboard-row">
          <div className="dashboard-widget full-width">
            <ProductivityScoreBar onRefresh={handleDataRefresh} />
          </div>
        </div>

        {/* Row 6: Recent Activity Feed (bottom) */}
        <div className="dashboard-row">
          <div className="dashboard-widget full-width">
            <RecentActivityFeed onRefresh={handleDataRefresh} />
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="dashboard-loading" aria-live="polite">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}

      {error && (
        <div className="dashboard-error" role="alert">
          <p>Error loading dashboard: {error}</p>
          <button 
            className="retry-button"
            onClick={handleDataRefresh}
            aria-label="Retry loading dashboard data"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};