import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { useTaskApi } from '../services/task-api';
import { EditTaskForm } from './edit-task-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { Button } from './ui/Button';
import { Icon } from './icon';
import { Tag } from './Tag';
import { DEFAULT_TAGS } from '../constants/tags';
import { toast } from 'sonner';

interface MITTaskListProps {
  onRefresh?: () => void;
}

export const MITTaskList: React.FC<MITTaskListProps> = ({ onRefresh }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  const { getTasks, updateTask, createTask } = useTaskApi();

  const fetchMITTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allTasks = await getTasks({ status: ['Open'] });
      const allMitTasks = allTasks
        .filter((task: Task) => task.isMIT && task.status !== 'Completed')
        .sort((a: Task, b: Task) => a.priority - b.priority);
      const mitTasks = allMitTasks.slice(0, 3);
      setTasks(mitTasks);
      setRenderKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching MIT tasks:', error);
      setError('Failed to load MIT tasks');
    } finally {
      setIsLoading(false);
    }
  }, [getTasks]);

  const handleSaveTask = useCallback(
    async (taskData: Partial<Task>) => {
      const toastId = toast.loading('🚧 Saving your task...');
      try {
        if (selectedTask) {
          await updateTask(selectedTask.TaskId, taskData);
          toast.success('✓ Task updated successfully', { id: toastId });
        } else {
          const newTaskData = { ...taskData, isMIT: true };
          await createTask(newTaskData);
          toast.success('✓ Task created successfully', { id: toastId });
        }
        await fetchMITTasks();
        setIsDialogOpen(false);
        setSelectedTask(null);
        onRefresh?.();
        const event = new CustomEvent('taskUpdated', {
          detail: { type: selectedTask ? 'update' : 'create', isMIT: true, source: 'MITTaskList' },
        });
        window.dispatchEvent(event);
        setTimeout(() => {
          const refreshEvent = new CustomEvent('dashboardTabSwitch', {
            detail: { activeTab: 'dashboard' },
          });
          window.dispatchEvent(refreshEvent);
        }, 100);
      } catch (error: any) {
        console.error('Error saving task:', error);
        if (error.status === 409 || error.errorCode === 'DUPLICATE_TASK') {
          toast.error('⚠️ Duplicate task: A task with this name and due date already exists', { id: toastId, duration: 5000 });
        } else {
          toast.error('Failed to save task. Please try again.', { id: toastId });
        }
        throw error;
      }
    },
    [selectedTask, updateTask, createTask, fetchMITTasks, onRefresh]
  );

  useEffect(() => {
    fetchMITTasks();
  }, [fetchMITTasks]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleRefresh = () => {
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
        <h3 className="widget-title">MIT - Most Important Tasks</h3>
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
        <h3 className="widget-title">MIT - Most Important Tasks</h3>
        <div className="widget-content error">
          <p className="error-message">{error}</p>
          <Button onClick={fetchMITTasks} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mit-task-list-widget" key={`mit-widget-${renderKey}`}>
        <div className="widget-header">
          <h3 className="widget-title">MIT - Most Important Tasks</h3>
          <div className="header-buttons">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTask(null);
                setIsDialogOpen(true);
              }}
              title="Add new MIT task"
            >
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Add MIT
            </Button>
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
                  onClick={() => {
                    setSelectedTask(task);
                    setIsDialogOpen(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedTask(task);
                      setIsDialogOpen(true);
                    }
                  }}
                  aria-label={`Open task: ${task.title}`}
                >
                  <div className="task-header">
                    <div className="task-title-row">
                      <span className="priority-badge">{task.priority}</span>
                      <h4 className="task-title">{task.title}</h4>
                    </div>
                    {task.dueDate && <span className={getDueDateBadgeClass(task.dueDate)}>{formatDueDate(task.dueDate)}</span>}
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
            <span className="task-count">
              {tasks.length} MIT{tasks.length !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="icon" onClick={fetchMITTasks} aria-label="Refresh MIT tasks">
              <Icon name="RefreshCw" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New MIT'}</DialogTitle>
            <DialogDescription>
              {selectedTask ? 'Make changes to your task here. Click save when you are done.' : 'Add a new MIT. Click save when you are done.'}
            </DialogDescription>
          </DialogHeader>
          <EditTaskForm
            task={selectedTask}
            onSave={handleSaveTask}
            onCancel={() => setIsDialogOpen(false)}
            allTags={[]}
            mitTaskCount={tasks.length}
            litTaskCount={0}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}; 