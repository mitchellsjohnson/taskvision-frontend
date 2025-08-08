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

// Removed unused PrimaryDashboardData interface

export const PrimaryDashboard: React.FC<PrimaryDashboardProps> = ({ 
  onDataUpdate, 
  cachedData 
}) => {
  // Removed unused data state - now using cachedData directly
  const [isLoading, setIsLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);

  // Handle data refresh from individual widgets
  const handleDataRefresh = useCallback(() => {
    const refreshData = {
      lastRefresh: Date.now(),
    };
    
    // Clear loading state after data is updated
    setIsLoading(false);
    setError(null);
    
    onDataUpdate?.(refreshData);
  }, [onDataUpdate]);

  // Listen for tab switch events to trigger refresh with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleTabSwitch = (event: CustomEvent) => {
      if (event.detail.activeTab === 'dashboard') {
        // Debounce rapid tab switches
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleDataRefresh();
        }, 300);
      }
    };

    window.addEventListener('dashboardTabSwitch', handleTabSwitch as EventListener);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleTabSwitch as EventListener);
    };
  }, [handleDataRefresh]);

  // Initial data load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!cachedData) {
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