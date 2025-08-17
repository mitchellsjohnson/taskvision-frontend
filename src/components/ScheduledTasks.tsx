import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { useTaskApi } from '../services/task-api';
import { EditTaskForm } from './edit-task-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { Button } from './ui/Button';
import { Icon } from './icon';

interface ScheduledTasksProps {
  onRefresh?: () => void;
}

interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  thisWeek: Task[];
}

export const ScheduledTasks: React.FC<ScheduledTasksProps> = ({ onRefresh }) => {
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({
    overdue: [],
    today: [],
    thisWeek: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { getTasks, updateTask, createTask } = useTaskApi();

  const fetchScheduledTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allTasks = await getTasks({ status: ['Open'] });
      const tasksWithDueDates = allTasks.filter((task: Task) => task.dueDate && task.status !== 'Completed');
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      const grouped: GroupedTasks = {
        overdue: tasksWithDueDates
          .filter((task: Task) => task.dueDate! < today)
          .sort((a: Task, b: Task) => a.dueDate!.localeCompare(b.dueDate!)),
        today: tasksWithDueDates
          .filter((task: Task) => task.dueDate === today)
          .sort((a: Task, b: Task) => a.dueDate!.localeCompare(b.dueDate!)),
        thisWeek: tasksWithDueDates
          .filter((task: Task) => task.dueDate! > today && task.dueDate! <= nextWeekStr)
          .sort((a: Task, b: Task) => a.dueDate!.localeCompare(b.dueDate!)),
      };
      setGroupedTasks(grouped);
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
      setError('Failed to load scheduled tasks');
    } finally {
      setIsLoading(false);
    }
  }, [getTasks]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  }, []);

  const handleSaveTask = useCallback(
    async (taskData: Partial<Task>) => {
      try {
        if (selectedTask) {
          await updateTask(selectedTask.TaskId, taskData);
        } else {
          await createTask(taskData);
        }
        fetchScheduledTasks();
        setIsDialogOpen(false);
        setSelectedTask(null);
        onRefresh?.();
      } catch (error) {
        console.error('Error saving task:', error);
      }
    },
    [selectedTask, updateTask, createTask, fetchScheduledTasks, onRefresh]
  );

  useEffect(() => {
    fetchScheduledTasks();
  }, [fetchScheduledTasks]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchScheduledTasks();
      }, 500);
    };
    window.addEventListener('dashboardTabSwitch', handleRefresh);
    window.addEventListener('taskUpdated', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
      window.removeEventListener('taskUpdated', handleRefresh);
    };
  }, [fetchScheduledTasks]);

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

  const renderTaskGroup = (title: string, tasks: Task[], className: string) => {
    if (tasks.length === 0) return null;
    return (
      <div className={`task-group ${className}`}>
        <h4 className="group-title">{title} ({tasks.length})</h4>
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
                <h5 className="task-title">{task.title}</h5>
                <span className="task-due-date">{formatDueDate(task.dueDate!)}</span>
                {task.isMIT && <span className="mit-badge">MIT</span>}
              </div>
              {task.description && <p className="task-description">{task.description}</p>}
              {task.tags && task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="task-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="scheduled-tasks-widget">
        <h3 className="widget-title">Scheduled Tasks</h3>
        <div className="widget-content loading">
          <div className="loading-spinner"></div>
          <p>Loading scheduled tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scheduled-tasks-widget">
        <h3 className="widget-title">Scheduled Tasks</h3>
        <div className="widget-content error">
          <p className="error-message">{error}</p>
          <Button onClick={fetchScheduledTasks} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const totalTasks = groupedTasks.overdue.length + groupedTasks.today.length + groupedTasks.thisWeek.length;

  return (
    <>
      <div className="scheduled-tasks-widget">
        <h3 className="widget-title">Scheduled Tasks</h3>
        <div className="widget-content">
          {totalTasks === 0 ? (
            <div className="empty-state">
              <p>No scheduled tasks found. Great job staying on top of deadlines!</p>
            </div>
          ) : (
            <div className="task-groups">
              {renderTaskGroup('Overdue', groupedTasks.overdue, 'overdue-group')}
              {renderTaskGroup('Due Today', groupedTasks.today, 'today-group')}
              {renderTaskGroup('This Week', groupedTasks.thisWeek, 'week-group')}
            </div>
          )}
          <div className="widget-footer">
            <span className="task-count">{totalTasks} scheduled task{totalTasks !== 1 ? 's' : ''}</span>
            <Button variant="ghost" size="icon" onClick={fetchScheduledTasks} aria-label="Refresh scheduled tasks">
              <Icon name="RefreshCw" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask ? 'Make changes to your task here. Click save when you are done.' : 'Add a new task. Click save when you are done.'}
            </DialogDescription>
          </DialogHeader>
          <EditTaskForm
            task={selectedTask}
            onSave={handleSaveTask}
            onCancel={() => setIsDialogOpen(false)}
            allTags={[]}
            mitTaskCount={0}
            litTaskCount={0}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}; 