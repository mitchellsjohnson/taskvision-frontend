import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardTabs } from '../DashboardTabs';

// Mock the custom event dispatch
const mockDispatchEvent = jest.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
});

describe('DashboardTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render with dashboard tab active by default', () => {
      render(<DashboardTabs />);
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      
      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      expect(wellnessTab).toHaveAttribute('aria-selected', 'false');
      expect(dashboardTab).toHaveClass('active');
      expect(wellnessTab).not.toHaveClass('active');
    });

    it('should render with wellness tab active when defaultTab is wellness', () => {
      render(<DashboardTabs defaultTab="wellness" />);
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      
      expect(dashboardTab).toHaveAttribute('aria-selected', 'false');
      expect(wellnessTab).toHaveAttribute('aria-selected', 'true');
      expect(dashboardTab).not.toHaveClass('active');
      expect(wellnessTab).toHaveClass('active');
    });

    it('should render both tab panels with correct visibility', () => {
      render(<DashboardTabs />);
      
      const dashboardPanel = screen.getByRole('tabpanel', { name: /dashboard/i });
      const wellnessPanel = document.getElementById('wellness-panel');
      
      expect(dashboardPanel).toHaveClass('active');
      expect(dashboardPanel).not.toHaveAttribute('hidden');
      expect(wellnessPanel).toHaveClass('hidden');
      expect(wellnessPanel).toHaveAttribute('hidden');
    });
  });

  describe('Tab Switching', () => {
    it('should switch to wellness tab when clicked', async () => {
      render(<DashboardTabs />);
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      
      await userEvent.click(wellnessTab);
      
      expect(wellnessTab).toHaveAttribute('aria-selected', 'true');
      expect(wellnessTab).toHaveClass('active');
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      expect(dashboardTab).toHaveAttribute('aria-selected', 'false');
      expect(dashboardTab).not.toHaveClass('active');
    });

    it('should switch to dashboard tab when clicked', async () => {
      render(<DashboardTabs defaultTab="wellness" />);
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      
      await userEvent.click(dashboardTab);
      
      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      expect(dashboardTab).toHaveClass('active');
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      expect(wellnessTab).toHaveAttribute('aria-selected', 'false');
      expect(wellnessTab).not.toHaveClass('active');
    });

    it('should update panel visibility when switching tabs', async () => {
      render(<DashboardTabs />);
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      await userEvent.click(wellnessTab);
      
      const dashboardPanel = document.getElementById('dashboard-panel');
      const wellnessPanel = screen.getByRole('tabpanel', { name: /wellness/i });
      
      expect(dashboardPanel).toHaveClass('hidden');
      expect(dashboardPanel).toHaveAttribute('hidden');
      expect(wellnessPanel).toHaveClass('active');
      expect(wellnessPanel).not.toHaveAttribute('hidden');
    });

    it('should not switch when clicking the already active tab', async () => {
      render(<DashboardTabs />);
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      
      await userEvent.click(dashboardTab);
      
      // Should remain active
      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      expect(dashboardTab).toHaveClass('active');
    });

    it('should dispatch custom event when tab switches', async () => {
      render(<DashboardTabs />);
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      
      await userEvent.click(wellnessTab);
      
      await waitFor(() => {
        expect(mockDispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'dashboardTabSwitch',
            detail: { activeTab: 'wellness' }
          })
        );
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should switch to wellness tab with right arrow key', async () => {
      render(<DashboardTabs />);
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      dashboardTab.focus();
      
      fireEvent.keyDown(dashboardTab, { key: 'ArrowRight' });
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      expect(wellnessTab).toHaveAttribute('aria-selected', 'true');
      expect(wellnessTab).toHaveFocus();
    });

    it('should switch to dashboard tab with left arrow key', async () => {
      render(<DashboardTabs defaultTab="wellness" />);
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      wellnessTab.focus();
      
      fireEvent.keyDown(wellnessTab, { key: 'ArrowLeft' });
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      expect(dashboardTab).toHaveFocus();
    });

    it('should go to dashboard tab with Home key', async () => {
      render(<DashboardTabs defaultTab="wellness" />);
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      wellnessTab.focus();
      
      fireEvent.keyDown(wellnessTab, { key: 'Home' });
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      expect(dashboardTab).toHaveFocus();
    });

    it('should go to wellness tab with End key', async () => {
      render(<DashboardTabs />);
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      dashboardTab.focus();
      
      fireEvent.keyDown(dashboardTab, { key: 'End' });
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      expect(wellnessTab).toHaveAttribute('aria-selected', 'true');
      expect(wellnessTab).toHaveFocus();
    });

    it('should not respond to keyboard events when tabs are not focused', async () => {
      render(<DashboardTabs />);
      
      // Focus on something else
      document.body.focus();
      
      fireEvent.keyDown(document.body, { key: 'ArrowRight' });
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      
      // Should remain on dashboard tab
      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      expect(wellnessTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DashboardTabs />);
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Dashboard navigation');
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      
      expect(dashboardTab).toHaveAttribute('aria-controls', 'dashboard-panel');
      expect(dashboardTab).toHaveAttribute('id', 'dashboard-tab');
      expect(wellnessTab).toHaveAttribute('aria-controls', 'wellness-panel');
      expect(wellnessTab).toHaveAttribute('id', 'wellness-tab');
      
      const dashboardPanel = screen.getByRole('tabpanel', { name: /dashboard/i });
      const wellnessPanel = document.getElementById('wellness-panel');
      
      expect(dashboardPanel).toHaveAttribute('aria-labelledby', 'dashboard-tab');
      expect(dashboardPanel).toHaveAttribute('id', 'dashboard-panel');
      expect(wellnessPanel).toHaveAttribute('aria-labelledby', 'wellness-tab');
      expect(wellnessPanel).toHaveAttribute('id', 'wellness-panel');
    });

    it('should have correct tabindex values', () => {
      render(<DashboardTabs />);
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      
      expect(dashboardTab).toHaveAttribute('tabindex', '0');
      expect(wellnessTab).toHaveAttribute('tabindex', '-1');
    });

    it('should update tabindex when switching tabs', async () => {
      render(<DashboardTabs />);
      
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      await userEvent.click(wellnessTab);
      
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      
      expect(dashboardTab).toHaveAttribute('tabindex', '-1');
      expect(wellnessTab).toHaveAttribute('tabindex', '0');
    });
  });

  describe('State Preservation', () => {
    it('should render placeholder components with data update callbacks', () => {
      render(<DashboardTabs />);
      
      // Check that dashboard widgets are rendered
      expect(screen.getByText('MIT Status')).toBeInTheDocument();
      expect(screen.getByText('Productivity Score')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should show cached data information when available', async () => {
      render(<DashboardTabs />);
      
      // Wait for initial data to load on dashboard tab
      await waitFor(() => {
        expect(screen.getByText(/Using cached data from/)).toBeInTheDocument();
      });
      
      // Switch to wellness tab
      const wellnessTab = screen.getByRole('tab', { name: /wellness/i });
      await userEvent.click(wellnessTab);
      
      // Wait for wellness data to load
      await waitFor(() => {
        expect(screen.getByText(/Using cached data from/)).toBeInTheDocument();
      });
      
      // Switch back to dashboard tab
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      await userEvent.click(dashboardTab);
      
      // Should still show cached data
      expect(screen.getByText(/Using cached data from/)).toBeInTheDocument();
    });
  });
});