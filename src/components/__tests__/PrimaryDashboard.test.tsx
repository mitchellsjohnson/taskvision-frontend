import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PrimaryDashboard } from '../PrimaryDashboard';
import { useTaskApi } from '../../services/task-api';

// Mock the dependencies
jest.mock('../../services/task-api');
jest.mock('../MITStatusTile', () => ({
  MITStatusTile: ({ onRefresh }: { onRefresh: () => void }) => (
    <div data-testid="mit-status-tile">
      <button onClick={onRefresh}>Refresh MIT</button>
    </div>
  ),
}));
jest.mock('../OpenOverdueTile', () => ({
  OpenOverdueTile: ({ onRefresh }: { onRefresh: () => void }) => (
    <div data-testid="open-overdue-tile">
      <button onClick={onRefresh}>Refresh Tasks</button>
    </div>
  ),
}));
jest.mock('../WellnessPromptTile', () => ({
  WellnessPromptTile: () => (
    <div data-testid="wellness-prompt-tile">
      <h3>Wellness Prompt</h3>
    </div>
  ),
}));
jest.mock('../UpcomingTasksList', () => ({
  UpcomingTasksList: () => (
    <div data-testid="upcoming-tasks-list">
      <h3>Upcoming Tasks</h3>
    </div>
  ),
}));
jest.mock('../ProductivityScoreBar', () => ({
  ProductivityScoreBar: () => (
    <div data-testid="productivity-score-bar">
      <h3>Productivity Score</h3>
    </div>
  ),
}));
jest.mock('../RecentActivityFeed', () => ({
  RecentActivityFeed: () => (
    <div data-testid="recent-activity-feed">
      <h3>Recent Activity</h3>
    </div>
  ),
}));

const mockUseTaskApi = useTaskApi as jest.MockedFunction<typeof useTaskApi>;

describe('PrimaryDashboard', () => {
  const mockOnDataUpdate = jest.fn();
  const mockGetTasks = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTaskApi.mockReturnValue({
      getTasks: mockGetTasks,
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    });
  });

  it('should render dashboard widgets', () => {
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    // Test for actual widgets that exist (header was removed)
    expect(screen.getByTestId('mit-status-tile')).toBeInTheDocument();
    expect(screen.getByTestId('open-overdue-tile')).toBeInTheDocument();
  });

  it('should render dashboard widget titles', () => {
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    // Test for widget titles that are actually rendered
    expect(screen.getByText('Productivity Score')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Wellness Prompt')).toBeInTheDocument();
  });

  it('should handle data refresh from widgets', () => {
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    const mitRefreshButton = screen.getByText('Refresh MIT');
    fireEvent.click(mitRefreshButton);
    
    expect(mockOnDataUpdate).toHaveBeenCalled();
  });

  it('should listen for tab switch events', async () => {
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    // Simulate tab switch event
    const event = new CustomEvent('dashboardTabSwitch', { 
      detail: { activeTab: 'dashboard' } 
    });
    window.dispatchEvent(event);
    
    await waitFor(() => {
      expect(mockOnDataUpdate).toHaveBeenCalled();
    });
  });

  it('should use cached data when provided', () => {
    const cachedData = {
      mitCount: 2,
      openTasks: 5,
      overdueTasks: 1,
      lastRefresh: Date.now(),
    };
    
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={cachedData} />);
    
    // Should not show loading state when cached data is provided
    expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
  });

  it('should have proper responsive grid layout', () => {
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    const dashboardGrid = document.querySelector('.dashboard-grid');
    expect(dashboardGrid).toBeInTheDocument();
    
    const dashboardRows = dashboardGrid?.querySelectorAll('.dashboard-row');
    expect(dashboardRows).toHaveLength(3); // 3 rows in current design
  });

  it('should handle widget refresh callbacks', () => {
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    const taskRefreshButton = screen.getByText('Refresh Tasks');
    fireEvent.click(taskRefreshButton);
    
    expect(mockOnDataUpdate).toHaveBeenCalled();
  });

  it('should be accessible with proper headings and structure', () => {
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    // Test for actual headings that exist (Dashboard Overview was removed)
    expect(screen.getByRole('heading', { level: 3, name: 'Productivity Score' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Upcoming Tasks' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Recent Activity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Wellness Prompt' })).toBeInTheDocument();
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('dashboardTabSwitch', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  it('should trigger refresh on mount when no cached data', () => {
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={null} />);
    
    expect(mockOnDataUpdate).toHaveBeenCalled();
  });

  it('should not trigger refresh on mount when cached data exists', () => {
    const cachedData = { lastRefresh: Date.now() };
    
    render(<PrimaryDashboard onDataUpdate={mockOnDataUpdate} cachedData={cachedData} />);
    
    // Should not be called when cached data exists
    expect(mockOnDataUpdate).toHaveBeenCalledTimes(0);
  });
});