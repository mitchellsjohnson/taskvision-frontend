import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { useTaskApi } from '../services/task-api';
import { EditTaskModal } from './edit-task-modal';

interface MITTaskListProps {
  onRefresh?: () => void;
}

export const MITTaskList: React.FC<MITTaskListProps> = ({ onRefresh }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  
  const { getTasks, updateTask, createTask } = useTaskApi();

  const fetchMITTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allTasks = await getTasks({ status: ['Open'] });
      
      // Filter and sort MIT tasks by priority, limit to 3 (matching tasks page logic)
      const allMitTasks = allTasks
        .filter((task: Task) => task.isMIT && task.status !== 'Completed')
        .sort((a: Task, b: Task) => a.priority - b.priority);
      
      const mitTasks = allMitTasks.slice(0, 3); // Enforce MIT limit: only first 3 tasks
      
      setTasks(mitTasks);

      // Force re-render
      setRenderKey(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching MIT tasks:', error);
      setError('Failed to load MIT tasks');
    } finally {
      setIsLoading(false);
    }
  }, [getTasks]);

  const handleTaskClick = useCallback((task: Task) => {
    // Prevent event bubbling and ensure stable state
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsEditModalOpen(false);
    // Delay clearing selected task to prevent modal flickering
    setTimeout(() => setSelectedTask(null), 100);
  }, []);

  const handleSaveTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      
      if (selectedTask) {
        await updateTask(selectedTask.TaskId, taskData);
      } else {
        // For new tasks, ensure they are marked as MIT
        const newTaskData = { ...taskData, isMIT: true };
        await createTask(newTaskData);
      }
      
      // Immediate local refresh
      await fetchMITTasks();
      
      setIsEditModalOpen(false);
      setSelectedTask(null);
      onRefresh?.(); // Trigger dashboard refresh if callback provided
      
      // Dispatch custom event for immediate dashboard refresh
      const event = new CustomEvent('taskUpdated', { 
        detail: { type: selectedTask ? 'update' : 'create', isMIT: true, source: 'MITTaskList' } 
      });
      window.dispatchEvent(event);
      
      // Also dispatch a general refresh event
      setTimeout(() => {
        const refreshEvent = new CustomEvent('dashboardTabSwitch', { 
          detail: { activeTab: 'dashboard' } 
        });
        window.dispatchEvent(refreshEvent);
      }, 100);
      
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }, [selectedTask, updateTask, createTask, fetchMITTasks, onRefresh]);

  useEffect(() => {
    fetchMITTasks();
  }, [fetchMITTasks]);

  // Listen for dashboard refresh events with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleRefresh = () => {
      // Debounce rapid refresh calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchMITTasks();
      }, 500);
    };

    window.addEventListener('dashboardTabSwitch', handleRefresh);
    window.addEventListener('taskUpdated', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
      window.removeEventListener('taskUpdated', handleRefresh);
    };
  }, [fetchMITTasks]);

  const getDueDateBadgeClass = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(dueDate).toISOString().split('T')[0];
    
    if (due < today) return 'due-date-badge overdue';
    if (due === today) return 'due-date-badge today';
    return 'due-date-badge upcoming';
  };

  const formatDueDate = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(dueDate).toISOString().split('T')[0];
    
    if (due === today) return 'Today';
    if (due < today) {
      const diffTime = new Date(today).getTime() - new Date(due).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays > 1 ? 's' : ''} overdue`;
    }
    
    return new Date(dueDate).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="mit-task-list-widget">
        <h3 className="widget-title">Most Important Tasks</h3>
        <div className="widget-content loading">
          <div className="loading-spinner"></div>
          <p>Loading MIT tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mit-task-list-widget">
        <h3 className="widget-title">Most Important Tasks</h3>
        <div className="widget-content error">
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={fetchMITTasks}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mit-task-list-widget" key={`mit-widget-${renderKey}`}>
        <div className="widget-header">
          <h3 className="widget-title">Most Important Tasks</h3>
          <div className="header-buttons">
            <button 
              className="add-task-button"
              onClick={() => {
                setSelectedTask(null);
                setIsEditModalOpen(true);
              }}
              title="Add new MIT task"
            >
              + Add MIT
            </button>
          </div>
        </div>
        <div className="widget-content">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No MITs found. Great job staying organized!</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div 
                  key={task.TaskId} 
                  className="task-item clickable"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTaskClick(task);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTaskClick(task);
                    }
                  }}
                  aria-label={`Open task: ${task.title}`}
                >
                  <div className="task-header">
                    <h4 className="task-title">{task.title}</h4>
                    {task.dueDate && (
                      <span className={getDueDateBadgeClass(task.dueDate)}>
                        {formatDueDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className="task-tags">
                      {task.tags.map((tag, index) => (
                        <span key={index} className="task-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="widget-footer">
            <span className="task-count">{tasks.length} MIT{tasks.length !== 1 ? 's' : ''}</span>
            <button 
              className="refresh-button"
              onClick={fetchMITTasks}
              aria-label="Refresh MIT tasks"
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        onSave={handleSaveTask}
        allTags={[]} // We don't have all tags in this context, but the modal can handle empty array
        mitTaskCount={tasks.length}
        litTaskCount={0} // We don't track LIT count in MIT component
      />
    </>
  );
}; 