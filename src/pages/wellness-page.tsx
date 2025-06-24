import React, { useState, useEffect } from 'react';
import { useWellnessApi } from '../services/wellness-api';
import WellnessScoreChart from '../components/wellness/WellnessScoreChart';
import WellnessTrackerGrid from '../components/wellness/WellnessTrackerGrid';
import { EditTaskModal } from '../components/edit-task-modal';
import { useTaskApi } from '../services/task-api';
import { PracticeInstance, WeeklyWellnessScore, WellnessPractice, Task } from '../types';

const WellnessPage: React.FC = () => {
  const {
    error,
    clearError,
    getWeekStart,
    getPracticeInstances,
    createPracticeInstance,
    updatePracticeInstance,
    getWeeklyScores,
    getWellnessStatus,
  } = useWellnessApi();

  const { getTasks, createTask, updateTask } = useTaskApi();

  // State
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const [currentWeekPractices, setCurrentWeekPractices] = useState<PracticeInstance[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<WeeklyWellnessScore[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [lastWeekScore, setLastWeekScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pendingWellnessLink, setPendingWellnessLink] = useState<{
    date: string;
    practice: WellnessPractice;
  } | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [mitTaskCount, setMitTaskCount] = useState<number>(0);
  const [litTaskCount, setLitTaskCount] = useState<number>(0);

  // Initialize current week
  useEffect(() => {
    // Get current date in Eastern Time
    const today = new Date();
    const weekStart = getWeekStart(today);
    setCurrentWeek(weekStart);
  }, [getWeekStart]);

  // Load data when current week changes
  useEffect(() => {
    if (currentWeek) {
      loadWellnessData();
    }
  }, [currentWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadWellnessData = async () => {
    if (!currentWeek) {
      return;
    }
    
    // Clear any previous errors
    clearError();
    setIsLoading(true);
    
    try {
      // Load current week practices
      const weekEnd = new Date(currentWeek + 'T00:00:00');
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      const [practices, scores, status] = await Promise.all([
        getPracticeInstances(currentWeek, weekEndStr),
        getWeeklyScores(12),
        getWellnessStatus(),
      ]);

      setCurrentWeekPractices(practices);
      setWeeklyScores(scores);
      setCurrentScore(status.currentScore);

      // Calculate last week score
      const currentWeekStart = new Date(currentWeek + 'T00:00:00');
      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0];
      
      const lastWeekScoreData = scores.find(s => s.weekStart === lastWeekStartStr);
      setLastWeekScore(lastWeekScoreData?.score || 0);

      // Load tasks to get available tags and counts
      const allTasks = await getTasks({ status: ['Open', 'Completed', 'Canceled', 'Waiting'] });
      const activeTasks = allTasks.filter(task => task.status === 'Open' || task.status === 'Waiting');
      
      const tags = new Set<string>();
      let mitCount = 0;
      let litCount = 0;
      
      allTasks.forEach(task => {
        task.tags?.forEach(tag => tags.add(tag));
      });
      
      // Apply MIT limit logic (only first 3 MIT tasks by priority count as MIT)
      const allMitTasks = activeTasks.filter(task => task.isMIT).sort((a, b) => a.priority - b.priority);
      const allLitTasks = activeTasks.filter(task => !task.isMIT);
      
      // Enforce MIT limit: only first 3 tasks can be MIT
      const actualMitTasks = allMitTasks.slice(0, 3);
      const overflowMitTasks = allMitTasks.slice(3);
      
      mitCount = actualMitTasks.length;
      litCount = allLitTasks.length + overflowMitTasks.length;
      
      setAllTags(Array.from(tags).sort());
      setMitTaskCount(mitCount);
      setLitTaskCount(litCount);
      
    } catch (err) {
      console.error('Failed to load wellness data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle practice update
  const handlePracticeUpdate = async (date: string, practice: WellnessPractice, completed: boolean) => {
    const existingPractice = currentWeekPractices.find(
      p => p.date === date && p.practice === practice
    );

    if (existingPractice) {
      // Update existing practice
      const updated = await updatePracticeInstance(date, practice, { completed });
      
      setCurrentWeekPractices(prev =>
        prev.map(p => p.id === updated.id ? updated : p)
      );
    } else {
      // Try to create new practice
      try {
        const newPractice = await createPracticeInstance({
          date,
          practice,
        });
        
        // Then update it to completed if needed
        if (completed) {
          const updated = await updatePracticeInstance(date, practice, { completed: true });
          setCurrentWeekPractices(prev => [...prev, updated]);
        } else {
          setCurrentWeekPractices(prev => [...prev, newPractice]);
        }
      } catch (error) {
        // If practice already exists (race condition), update it instead
        if (error instanceof Error && error.message.includes('already exists')) {
          const updated = await updatePracticeInstance(date, practice, { completed });
          setCurrentWeekPractices(prev => [...prev, updated]);
          // Also refresh the full data to ensure consistency
          await loadWellnessData();
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    // Refresh scores and status
    const [scores, status] = await Promise.all([
      getWeeklyScores(12),
      getWellnessStatus(),
    ]);
    
    setWeeklyScores(scores);
    setCurrentScore(status.currentScore);

    // Calculate last week score
    const currentWeekStart = new Date(currentWeek + 'T00:00:00');
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0];
    
    const lastWeekScoreData = scores.find(s => s.weekStart === lastWeekStartStr);
    setLastWeekScore(lastWeekScoreData?.score || 0);
  };

  // Handle task creation
  const handleCreateTask = (date: string, practice: WellnessPractice) => {
    setPendingWellnessLink({ date, practice });
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  // Handle task opening
  const handleOpenTask = async (taskId: string) => {
    try {
      const tasks = await getTasks({ status: ['Open', 'Completed', 'Canceled', 'Waiting'] });
      const task = tasks.find(t => t.TaskId === taskId);
      
      if (task) {
        setSelectedTask(task);
        setPendingWellnessLink(null);
        setIsTaskModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    }
  };

  // Handle week navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    // Parse current week as Eastern Time
    const current = new Date(currentWeek + 'T12:00:00'); // Use noon to avoid timezone edge cases
    
    // Navigate by exactly 7 days
    const offset = direction === 'next' ? 7 : -7;
    current.setDate(current.getDate() + offset);
    
    // Ensure we always land on a Monday (week start)
    const newWeekStart = getWeekStart(current);
    setCurrentWeek(newWeekStart);
  };

  // Handle chart week click
  const handleChartWeekClick = (weekStart: string) => {
    setCurrentWeek(weekStart);
  };

  // Handle task modal save
  const handleWellnessTaskSave = async (taskData: Partial<Task>) => {
    try {
      let taskId: string;
      
      if (selectedTask) {
        // Update existing task
        await updateTask(selectedTask.TaskId, taskData);
        taskId = selectedTask.TaskId;
      } else {
        // Create new task with wellness context
        const newTaskData = {
          ...taskData,
          tags: [...(taskData.tags || []), 'Wellness'],
        };
        
        if (pendingWellnessLink) {
          newTaskData.title = `${pendingWellnessLink.practice}: ${taskData.title}`;
        }
        
        const newTask = await createTask(newTaskData);
        taskId = newTask.TaskId;
      }

      // If this was for creating a wellness-linked task, link it to the practice
      if (pendingWellnessLink && !selectedTask) {
        // Check if practice already exists
        const existingPractice = currentWeekPractices.find(
          p => p.date === pendingWellnessLink.date && p.practice === pendingWellnessLink.practice
        );

        if (existingPractice) {
          // Update existing practice to link the task (preserve completion status)
          await updatePracticeInstance(
            pendingWellnessLink.date,
            pendingWellnessLink.practice,
            { linkedTaskId: taskId }
          );
        } else {
          // Try to create new practice with task link (not completed yet)
          try {
            await createPracticeInstance({
              date: pendingWellnessLink.date,
              practice: pendingWellnessLink.practice,
              linkedTaskId: taskId
            });
          } catch (error) {
                         // If practice already exists (race condition), update it instead
             if (error instanceof Error && error.message.includes('already exists')) {
               await updatePracticeInstance(
                 pendingWellnessLink.date,
                 pendingWellnessLink.practice,
                 { linkedTaskId: taskId }
               );
               // Refresh data to ensure consistency
               await loadWellnessData();
             } else {
               throw error; // Re-throw other errors
             }
          }
        }
      }

      // Refresh data
      await loadWellnessData();
      
      // Close modal and reset state
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setPendingWellnessLink(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  // Format week display
  const formatWeekDisplay = (weekStart: string): string => {
    if (!weekStart) return '';
    
    const start = new Date(weekStart + 'T00:00:00');
    const end = new Date(weekStart + 'T00:00:00');
    end.setDate(end.getDate() + 6);
    
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };

  // Check if current week is this week
  const isCurrentWeek = (): boolean => {
    const today = new Date();
    const thisWeekStart = getWeekStart(today);
    return currentWeek === thisWeekStart;
  };

  // Handle retry
  const handleRetry = () => {
    clearError();
    loadWellnessData();
  };

  if (error) {
    return (
      <div className="wellness-page-error">
        <div className="wellness-error-content">
          <h2>Unable to load wellness data</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="wellness-retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-page">
      <div className="wellness-page-container">
        {/* Header Section */}
        <div className="wellness-header">
          <div className="wellness-title-section">
            <h1 className="wellness-page-title">Wellness Check</h1>
            <p className="wellness-page-subtitle">
              Build daily and weekly habits that scientifically improve well-being
            </p>
          </div>
          
          {/* Current Week Score */}
          <div className="wellness-current-score">
            <div className="wellness-score-display">
              <span className="wellness-score-label">Current Week Score:</span>
              <span className="wellness-score-value">{Math.round(currentScore)}/100</span>
              {lastWeekScore > 0 && (
                <span className={`wellness-score-change ${
                  currentScore >= lastWeekScore ? 'positive' : 'negative'
                }`}>
                  ({currentScore >= lastWeekScore ? '+' : ''}{Math.round(currentScore - lastWeekScore)})
                </span>
              )}
            </div>
            <div className="wellness-score-subtitle">
              (Last week: {Math.round(lastWeekScore)})
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="wellness-chart-section">
          <div className="wellness-section-header">
            <h2>Weekly Progress</h2>
            <p>Your wellness scores over the past 12 weeks</p>
          </div>
          <WellnessScoreChart
            data={weeklyScores}
            onWeekClick={handleChartWeekClick}
            className="wellness-main-chart"
          />
        </div>

        {/* Tracker Section */}
        <div className="wellness-tracker-section">
          <div className="wellness-section-header">
            <div className="wellness-tracker-title">
              <div className="wellness-tracker-title-left">
                <h2>Weekly Tracker</h2>
                <div className="wellness-tracker-score">
                  Score: <span className="wellness-score-highlight">{Math.round(currentScore)}/100</span>
                </div>
              </div>
              <div className="wellness-week-navigation">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="wellness-nav-button"
                  disabled={isLoading}
                >
                  ←
                </button>
                <span className="wellness-current-week">
                  {formatWeekDisplay(currentWeek)}
                  {isCurrentWeek() && (
                    <span className="wellness-current-indicator">Current Week</span>
                  )}
                </span>
                <button
                  onClick={() => navigateWeek('next')}
                  className="wellness-nav-button"
                  disabled={isLoading}
                >
                  →
                </button>
              </div>
            </div>
            <p>Click cells to mark practices complete • ➕ to add tasks • 🔗 to view linked tasks</p>
          </div>
          
          {currentWeek && (
            <WellnessTrackerGrid
              weekStart={currentWeek}
              practices={currentWeekPractices}
              onPracticeUpdate={handlePracticeUpdate}
              onCreateTask={handleCreateTask}
              onOpenTask={handleOpenTask}
              loading={isLoading}
              className="wellness-main-grid"
            />
          )}
        </div>

        {/* Task Modal */}
        <EditTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
            setPendingWellnessLink(null);
          }}
          task={selectedTask}
          onSave={handleWellnessTaskSave}
          allTags={allTags}
          mitTaskCount={mitTaskCount}
          litTaskCount={litTaskCount}
          defaultValues={
            pendingWellnessLink && !selectedTask
              ? {
                  dueDate: pendingWellnessLink.date,
                  tags: ['Wellness'],
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default WellnessPage; 