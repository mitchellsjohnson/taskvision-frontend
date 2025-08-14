import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PrimaryDashboard } from './PrimaryDashboard';
import { SampleDashboard } from './SampleDashboard';

interface DashboardTabsProps {
  defaultTab?: 'dashboard' | 'wellness' | 'sample';
}

interface TabData {
  lastRefresh: number;
  data: any;
}

interface DashboardTabsState {
  activeTab: 'dashboard' | 'wellness' | 'sample';
  dashboardData: TabData | null;
  wellnessData: TabData | null;
  sampleData: TabData | null;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  defaultTab = 'dashboard' 
}) => {
  const [state, setState] = useState<DashboardTabsState>({
    activeTab: defaultTab,
    dashboardData: null,
    wellnessData: null,
    sampleData: null,
  });

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Handle tab switching
  const handleTabSwitch = useCallback((tab: 'dashboard' | 'wellness' | 'sample') => {
    if (tab === state.activeTab) return;

    setState(prevState => ({
      ...prevState,
      activeTab: tab,
    }));

    // Trigger data refresh for the newly active tab
    // This will be handled by the individual dashboard components
    setTimeout(() => {
      const event = new CustomEvent('dashboardTabSwitch', { 
        detail: { activeTab: tab } 
      });
      window.dispatchEvent(event);
    }, 0);
  }, [state.activeTab]);

  // Listen for wellness navigation events
  useEffect(() => {
    const handleNavigateToWellness = () => {
      handleTabSwitch('wellness');
    };

    window.addEventListener('navigateToWellnessTab', handleNavigateToWellness);
    return () => {
      window.removeEventListener('navigateToWellnessTab', handleNavigateToWellness);
    };
  }, [handleTabSwitch]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== tabRefs.current.dashboard && 
          event.target !== tabRefs.current.wellness) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (state.activeTab === 'wellness') {
            handleTabSwitch('dashboard');
            tabRefs.current.dashboard?.focus();
          } else if (state.activeTab === 'sample') {
            handleTabSwitch('wellness');
            tabRefs.current.wellness?.focus();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (state.activeTab === 'dashboard') {
            handleTabSwitch('wellness');
            tabRefs.current.wellness?.focus();
          } else if (state.activeTab === 'wellness') {
            handleTabSwitch('sample');
            tabRefs.current.sample?.focus();
          }
          break;
        case 'Home':
          event.preventDefault();
          handleTabSwitch('dashboard');
          tabRefs.current.dashboard?.focus();
          break;
        case 'End':
          event.preventDefault();
          handleTabSwitch('sample');
          tabRefs.current.sample?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.activeTab, handleTabSwitch]);

  // Cache management for tab data
  const updateTabData = useCallback((tab: 'dashboard' | 'wellness' | 'sample', data: any) => {
    setState(prevState => ({
      ...prevState,
      [`${tab}Data`]: {
        lastRefresh: Date.now(),
        data,
      },
    }));
  }, []);

  // Check if cached data is still fresh (5 minutes)
  const isCacheFresh = useCallback((tabData: TabData | null): boolean => {
    if (!tabData) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - tabData.lastRefresh < fiveMinutes;
  }, []);

  return (
    <div className="dashboard-tabs-container">
      {/* Tab Navigation */}
      <div className="dashboard-tabs-nav" role="tablist" aria-label="Dashboard navigation">
        <button
          ref={el => tabRefs.current.dashboard = el}
          role="tab"
          aria-selected={state.activeTab === 'dashboard'}
          aria-controls="dashboard-panel"
          id="dashboard-tab"
          className={`dashboard-tab ${state.activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('dashboard')}
          tabIndex={state.activeTab === 'dashboard' ? 0 : -1}
        >
          Dashboard
        </button>
        <button
          ref={el => tabRefs.current.wellness = el}
          role="tab"
          aria-selected={state.activeTab === 'wellness'}
          aria-controls="wellness-panel"
          id="wellness-tab"
          className={`dashboard-tab ${state.activeTab === 'wellness' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('wellness')}
          tabIndex={state.activeTab === 'wellness' ? 0 : -1}
        >
          Wellness
        </button>
        <button
          ref={el => tabRefs.current.sample = el}
          role="tab"
          aria-selected={state.activeTab === 'sample'}
          aria-controls="sample-panel"
          id="sample-tab"
          className={`dashboard-tab ${state.activeTab === 'sample' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('sample')}
          tabIndex={state.activeTab === 'sample' ? 0 : -1}
        >
          SAMPLE
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-tabs-content">
        {/* Primary Dashboard Panel */}
        <div
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby="dashboard-tab"
          className={`dashboard-tab-panel ${state.activeTab === 'dashboard' ? 'active' : 'hidden'}`}
          hidden={state.activeTab !== 'dashboard'}
        >
          {state.activeTab === 'dashboard' && (
            <PrimaryDashboard 
              onDataUpdate={(data) => updateTabData('dashboard', data)}
              cachedData={isCacheFresh(state.dashboardData) ? state.dashboardData?.data : null}
            />
          )}
        </div>

        {/* Wellness Dashboard Panel */}
        <div
          id="wellness-panel"
          role="tabpanel"
          aria-labelledby="wellness-tab"
          className={`dashboard-tab-panel ${state.activeTab === 'wellness' ? 'active' : 'hidden'}`}
          hidden={state.activeTab !== 'wellness'}
        >
          <WellnessDashboardPlaceholder 
            onDataUpdate={(data) => updateTabData('wellness', data)}
            cachedData={isCacheFresh(state.wellnessData) ? state.wellnessData?.data : null}
          />
        </div>

        {/* SAMPLE Dashboard Panel */}
        <div
          id="sample-panel"
          role="tabpanel"
          aria-labelledby="sample-tab"
          className={`dashboard-tab-panel ${state.activeTab === 'sample' ? 'active' : 'hidden'}`}
          hidden={state.activeTab !== 'sample'}
        >
          {state.activeTab === 'sample' && (
            <SampleDashboard 
              onDataUpdate={(data) => updateTabData('sample', data)}
              cachedData={isCacheFresh(state.sampleData) ? state.sampleData?.data : null}
            />
          )}
        </div>
      </div>
    </div>
  );
};



const WellnessDashboardPlaceholder: React.FC<{
  onDataUpdate: (data: any) => void;
  cachedData: any;
}> = ({ onDataUpdate, cachedData }) => {
  useEffect(() => {
    // Simulate data loading
    if (!cachedData) {
      setTimeout(() => {
        onDataUpdate({ loaded: true, timestamp: Date.now() });
      }, 100);
    }
  }, [onDataUpdate, cachedData]);

  return (
    <div className="wellness-dashboard-placeholder">
      <h2>Wellness Dashboard</h2>
      <p>This will contain the enhanced wellness dashboard with:</p>
      <ul>
        <li>Daily Practices Checklist</li>
        <li>Mini Journal Inputs</li>
        <li>Mood Score Sliders</li>
        <li>Wellness Score Bar</li>
        <li>Practices History Log</li>
        <li>General Reflection Component</li>
      </ul>
      {cachedData && (
        <p className="cache-info">Using cached data from {new Date(cachedData.timestamp).toLocaleTimeString()}</p>
      )}
    </div>
  );
};