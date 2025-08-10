import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Task } from '../types';
import { EditTaskModal } from './edit-task-modal';
import { useTaskApi } from '../services/task-api';

interface UpcomingTasksListProps {
  onRefresh?: () => void;
}

interface UpcomingTasksData {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export const UpcomingTasksList: React.FC<UpcomingTasksListProps> = ({ onRefresh }) => {
  const [data, setData] = useState<UpcomingTasksData>({
    tasks: [],
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { updateTask, createTask } = useTaskApi();

  const fetchUpcomingTasks = useCallback(async (attempt: number = 0) => {
    // Prevent excessive retries
    if (attempt > 3) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load upcoming tasks after multiple attempts',
      }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await axios.get('/api/tasks/upcoming?days=7');
      const tasks = response.data as Task[];

      setData({
        tasks,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      });

      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      
      // Only retry if we haven't exceeded the limit
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        setRetryCount(attempt + 1);
        setTimeout(() => {
          fetchUpcomingTasks(attempt + 1);
        }, delay);
      } else {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load upcoming tasks',
        }));
        setRetryCount(0);
      }
    }
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchUpcomingTasks(0);
  }, [fetchUpcomingTasks]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.TaskId, taskData);
      } else {
        await createTask(taskData);
      }
      fetchUpcomingTasks(); // Refresh the upcoming tasks
      setIsEditModalOpen(false);
      setSelectedTask(null);
      onRefresh?.(); // Trigger dashboard refresh if callback provided
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }, [selectedTask, updateTask, createTask, fetchUpcomingTasks, onRefresh]);

  const handleCloseModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  }, []);

  // Initial load
  useEffect(() => {
    fetchUpcomingTasks();
  }, [fetchUpcomingTasks]);

  // Listen for dashboard refresh events with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleRefresh = () => {
      // Debounce rapid refresh calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchUpcomingTasks();
      }, 500);
    };

    window.addEventListener('dashboardTabSwitch', handleRefresh);
    window.addEventListener('taskUpdated', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
      window.removeEventListener('taskUpdated', handleRefresh);
    };
  }, [fetchUpcomingTasks]);

  const formatDueDate = (dueDate: string): { text: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const due = new Date(dueDate);
    
    // Normalize dates to start of day for comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const isOverdue = dueStart < todayStart;
    const isToday = dueStart.getTime() === todayStart.getTime();
    const isTomorrow = dueStart.getTime() === tomorrowStart.getTime();
    
    let text: string;
    if (isToday) {
      text = 'Today';
    } else if (isTomorrow) {
      text = 'Tomorrow';
    } else {
      text = due.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: due.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
    
    return { text, isOverdue, isToday, isTomorrow };
  };

  const renderContent = () => {
    if (data.isLoading) {
      return (
        <div className="widget-loading" aria-live="polite">
          <div className="loading-spinner-small"></div>
          <span className="sr-only">Loading upcoming tasks...</span>
        </div>
      );
    }

    if (data.error) {
      return (
        <div className="widget-error" role="alert">
          <p className="error-message">Failed to load upcoming tasks</p>
          <button 
            className="retry-button-small"
            onClick={handleRetry}
            aria-label="Retry loading upcoming tasks"
          >
            Retry
          </button>
          {retryCount > 0 && (
            <p className="retry-info">Attempt {retryCount}/3</p>
          )}
        </div>
      );
    }

    if (data.tasks.length === 0) {
      return (
        <div className="upcoming-tasks-empty">
          <div className="empty-state-icon" aria-hidden="true">📅</div>
          <p className="empty-state-text">
            No upcoming tasks in the next 7 days
          </p>
        </div>
      );
    }

    return (
      <div className="upcoming-tasks-content">
        <div className="upcoming-tasks-list">
          {data.tasks.slice(0, 5).map((task) => {
            const dueDateInfo = formatDueDate(task.dueDate!);
            
            return (
              <div 
                key={task.TaskId} 
                className={`upcoming-task-item clickable ${dueDateInfo.isOverdue ? 'overdue' : ''} ${dueDateInfo.isToday ? 'today' : ''}`}
                onClick={() => handleTaskClick(task)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTaskClick(task);
                  }
                }}
                aria-label={`Open task: ${task.title}`}
              >
                <div className="task-content">
                  <div className="task-title-row">
                    <span className="task-title" title={task.title}>
                      {task.title}
                    </span>
                    {task.isMIT && (
                      <span className="task-mit-badge" aria-label="Most Important Task">
                        MIT
                      </span>
                    )}
                  </div>
                  <div className="task-due-date">
                    <span 
                      className={`due-date ${dueDateInfo.isOverdue ? 'overdue' : ''} ${dueDateInfo.isToday ? 'today' : ''}`}
                      aria-label={`Due ${dueDateInfo.text}${dueDateInfo.isOverdue ? ' (overdue)' : ''}`}
                    >
                      {dueDateInfo.isOverdue && (
                        <span className="overdue-icon" aria-hidden="true">⚠️ </span>
                      )}
                      {dueDateInfo.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {data.tasks.length > 5 && (
          <div className="upcoming-tasks-footer">
            <p className="more-tasks-text">
              +{data.tasks.length - 5} more upcoming tasks
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="widget-tile upcoming-tasks-tile">
        <div className="widget-header">
          <h3 className="widget-title">Upcoming Tasks</h3>
          <button 
            className="refresh-button"
            onClick={() => fetchUpcomingTasks()}
            aria-label="Refresh upcoming tasks"
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

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        onSave={handleSaveTask}
        allTags={[]} // We don't have all tags in this context, but the modal can handle empty array
        mitTaskCount={0} // We don't track this in the dashboard context
        litTaskCount={0} // We don't track this in the dashboard context
      />
    </>
  );
}; 