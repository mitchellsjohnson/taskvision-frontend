import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { useTaskApi } from '../services/task-api';
import { EditTaskForm } from './edit-task-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { Button } from './ui/Button';
import { Icon } from './icon';
import { Tag } from './Tag';
import { DEFAULT_TAGS } from '../constants/tags';

interface TopLITTasksProps {
  onRefresh?: () => void;
}

export const TopLITTasks: React.FC<TopLITTasksProps> = ({ onRefresh }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalLitCount, setTotalLitCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  
  const { getTasks, updateTask, createTask } = useTaskApi();

  const fetchLITTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allTasks = await getTasks({ status: ['Open'] });
      const allMitTasks = allTasks.filter(t => t.isMIT && t.status !== 'Completed').sort((a, b) => a.priority - b.priority);
      const allLitTasks = allTasks.filter(t => !t.isMIT && t.status !== 'Completed').sort((a, b) => a.priority - b.priority);
      const overflowMitTasks = allMitTasks.slice(3).map(task => ({ ...task, isMIT: false }));
      const allLitWithOverflow = [...overflowMitTasks, ...allLitTasks].sort((a, b) => a.priority - b.priority);
      const litTasks = allLitWithOverflow.slice(0, 3);
      setTasks(litTasks);
      setTotalLitCount(allLitWithOverflow.length);
      setRenderKey(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching LIT tasks:', error);
      setError('Failed to load LIT tasks');
    } finally {
      setIsLoading(false);
    }
  }, [getTasks]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  }, []);

  const handleSaveTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.TaskId, taskData);
      } else {
        const newTaskData = { ...taskData, isMIT: false };
        await createTask(newTaskData);
      }
      await fetchLITTasks();
      setIsDialogOpen(false);
      setSelectedTask(null);
      onRefresh?.();
      const event = new CustomEvent('taskUpdated', { detail: { type: selectedTask ? 'update' : 'create', isMIT: false, source: 'TopLITTasks' } });
      window.dispatchEvent(event);
      setTimeout(() => {
        const refreshEvent = new CustomEvent('dashboardTabSwitch', { detail: { activeTab: 'dashboard' } });
        window.dispatchEvent(refreshEvent);
      }, 100);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }, [selectedTask, updateTask, createTask, fetchLITTasks, onRefresh]);

  useEffect(() => {
    fetchLITTasks();
  }, [fetchLITTasks]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchLITTasks();
      }, 500);
    };
    window.addEventListener('dashboardTabSwitch', handleRefresh);
    window.addEventListener('taskUpdated', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
      window.removeEventListener('taskUpdated', handleRefresh);
    };
  }, [fetchLITTasks]);

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
      <div className="lit-task-list-widget">
        <h3 className="widget-title">LIT - Less Important Tasks</h3>
        <div className="widget-content loading">
          <div className="loading-spinner"></div>
          <p>Loading LIT tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lit-task-list-widget">
        <h3 className="widget-title">LIT - Less Important Tasks</h3>
        <div className="widget-content error">
          <p className="error-message">{error}</p>
          <Button variant="outline" onClick={fetchLITTasks}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="lit-task-list-widget" key={`lit-widget-${renderKey}`}>
        <div className="widget-header">
          <h3 className="widget-title">LIT - Less Important Tasks</h3>
          <div className="header-buttons">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTask(null);
                setIsDialogOpen(true);
              }}
              title="Add new LIT task"
            >
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Add LIT
            </Button>
          </div>
        </div>
        <div className="widget-content">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No LIT tasks found. Focus on your MITs!</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div 
                  key={task.TaskId} 
                  className="task-item clickable"
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
                  <div className="task-header">
                    <h4 className="task-title">{task.title}</h4>
                    {task.dueDate && (
                      <span className={getDueDateBadgeClass(task.dueDate)}>
                        {formatDueDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  {task.tags && task.tags.length > 0 && (
                    <div className="task-tags">
                      {task.tags.map((tag, index) => (
                        <Tag
                          key={index}
                          label={tag}
                          type={DEFAULT_TAGS[tag] || DEFAULT_TAGS[tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()] ? 'default' : 'custom'}
                          className="text-xs"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="widget-footer">
            <span className="task-count">{totalLitCount} LIT{totalLitCount !== 1 ? 's' : ''}</span>
            <Button variant="ghost" size="icon" onClick={fetchLITTasks} aria-label="Refresh LIT tasks">
              <Icon name="RefreshCw" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New LIT'}</DialogTitle>
            <DialogDescription>
              {selectedTask ? 'Make changes to your task here. Click save when you are done.' : 'Add a new LIT. Click save when you are done.'}
            </DialogDescription>
          </DialogHeader>
          <EditTaskForm
            task={selectedTask}
            onSave={handleSaveTask}
            onCancel={() => setIsDialogOpen(false)}
            allTags={[]}
            mitTaskCount={0}
            litTaskCount={tasks.length}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}; 