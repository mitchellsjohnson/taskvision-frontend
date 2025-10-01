import React, { useState, useEffect } from 'react';
import { useWellnessApi } from '../services/wellness-api';
import WellnessScoreChart from '../components/wellness/WellnessScoreChart';
import WellnessTrackerGrid from '../components/wellness/WellnessTrackerGrid';
import { EditTaskForm } from '../components/edit-task-form';
import { useTaskApi } from '../services/task-api';
import { PracticeInstance, WeeklyWellnessScore, WellnessPractice, Task } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog';
import { Icon } from '../components/icon';

const WellnessPage: React.FC = () => {
  const {
    error,
    clearError,
    getWeekStart,
    getPracticeInstances,
    createPracticeInstance,
    updatePracticeInstance,
    getWeeklyScores,
  } = useWellnessApi();

  const { getTasks, createTask, updateTask } = useTaskApi();

  // State
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const [currentWeekPractices, setCurrentWeekPractices] = useState<PracticeInstance[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<WeeklyWellnessScore[]>([]);
  const [viewedWeekScore, setViewedWeekScore] = useState<number>(0);
  const [lastWeekScore, setLastWeekScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Task Modal State
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pendingWellnessLink, setPendingWellnessLink] = useState<{
    date: string;
    practice: WellnessPractice;
  } | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [mitTaskCount, setMitTaskCount] = useState<number>(0);
  const [litTaskCount, setLitTaskCount] = useState<number>(0);

  // Journal Modal State
  const [showJournalFor, setShowJournalFor] = useState<{
    date: string;
    practice: WellnessPractice;
  } | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [journalEntries, setJournalEntries] = useState<Record<string, string>>({});

  // Initialize current week
  useEffect(() => {
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
    if (!currentWeek) return;
    clearError();
    setIsLoading(true);
    try {
      const weekEnd = new Date(currentWeek + 'T00:00:00');
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      const [practices, scores] = await Promise.all([
        getPracticeInstances(currentWeek, weekEndStr),
        getWeeklyScores(12),
      ]);
      setCurrentWeekPractices(practices);
      setWeeklyScores(scores);
      const newJournalEntries: Record<string, string> = {};
      practices.forEach(p => {
        if (p.journal) newJournalEntries[`${p.date}-${p.practice}`] = p.journal;
      });
      setJournalEntries(newJournalEntries);
      const viewedScoreData = scores.find(s => s.weekStart === currentWeek);
      setViewedWeekScore(viewedScoreData?.score || 0);
      const lastWeekDate = new Date(currentWeek + 'T00:00:00');
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeekStartStr = lastWeekDate.toISOString().split('T')[0];
      const lastWeekScoreData = scores.find(s => s.weekStart === lastWeekStartStr);
      setLastWeekScore(lastWeekScoreData?.score || 0);
      const allTasks = await getTasks({ status: ['Open', 'Completed', 'Canceled', 'Waiting'] });
      const activeTasks = allTasks.filter(t => t.status === 'Open' || t.status === 'Waiting');
      const tags = new Set<string>();
      allTasks.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
      const allMit = activeTasks.filter(t => t.isMIT).sort((a, b) => a.priority - b.priority);
      const allLit = activeTasks.filter(t => !t.isMIT);
      const actualMit = allMit.slice(0, 3);
      const overflowMit = allMit.slice(3);
      setAllTags(Array.from(tags).sort());
      setMitTaskCount(actualMit.length);
      setLitTaskCount(allLit.length + overflowMit.length);
    } catch (err) {
      console.error('Failed to load wellness data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeUpdate = async (date: string, practice: WellnessPractice, completed: boolean) => {
    const existingPractice = currentWeekPractices.find(p => p.date === date && p.practice === practice);
    let wasJustCompleted = false;
    if (existingPractice) {
      wasJustCompleted = !existingPractice.completed && completed;
      const updated = await updatePracticeInstance(date, practice, { completed });
      setCurrentWeekPractices(prev => prev.map(p => p.id === updated.id ? updated : p));
    } else {
      try {
        const newPractice = await createPracticeInstance({ date, practice });
        if (completed) {
          wasJustCompleted = true;
          const updated = await updatePracticeInstance(date, practice, { completed: true });
          setCurrentWeekPractices(prev => [...prev, updated]);
        } else {
          setCurrentWeekPractices(prev => [...prev, newPractice]);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          const updated = await updatePracticeInstance(date, practice, { completed });
          setCurrentWeekPractices(prev => [...prev, updated]);
          await loadWellnessData();
        } else {
          throw error;
        }
      }
    }
    if (wasJustCompleted) {
      setShowJournalFor({ date, practice });
      const practiceId = `${date}-${practice}`;
      setJournalContent(journalEntries[practiceId] || '');
    }
    const scores = await getWeeklyScores(12);
    setWeeklyScores(scores);
    setViewedWeekScore(scores.find(score => score.weekStart === currentWeek)?.score || 0);
    setLastWeekScore(scores.length > 1 ? scores[1].score : 0);
    window.dispatchEvent(new CustomEvent('wellnessDataUpdated', { detail: { date, practice, completed } }));
  };

  const handleCreateTask = (date: string, practice: WellnessPractice) => {
    setPendingWellnessLink({ date, practice });
    setSelectedTask(null);
    setIsTaskDialogOpen(true);
  };

  const handleJournalSave = async () => {
    if (!showJournalFor) return;
    try {
      const practiceId = `${showJournalFor.date}-${showJournalFor.practice}`;
      const hadPreviousEntry = Boolean(journalEntries[practiceId]);
      const hasNewContent = Boolean(journalContent.trim());
      
      // Only make API call if there's content or we're clearing an existing entry
      if (hasNewContent || hadPreviousEntry) {
        await updatePracticeInstance(showJournalFor.date, showJournalFor.practice, { 
          journal: hasNewContent ? journalContent.trim() : "" 
        });
      }
      
      // Update local state
      const updatedEntries = { ...journalEntries };
      if (hasNewContent) {
        updatedEntries[practiceId] = journalContent.trim();
      } else {
        delete updatedEntries[practiceId];
      }
      setJournalEntries(updatedEntries);
      await loadWellnessData();
      window.dispatchEvent(new CustomEvent('wellnessDataUpdated', { 
        detail: { 
          date: showJournalFor.date, 
          practice: showJournalFor.practice, 
          journal: hasNewContent ? journalContent.trim() : "" 
        } 
      }));
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
    setShowJournalFor(null);
    setJournalContent('');
  };

  const handleJournalEdit = (date: string, practice: WellnessPractice) => {
    setShowJournalFor({ date, practice });
    const practiceId = `${date}-${practice}`;
    setJournalContent(journalEntries[practiceId] || '');
  };

  const hasJournalEntry = (date: string, practice: WellnessPractice) => {
    const practiceId = `${date}-${practice}`;
    return Boolean(journalEntries[practiceId]);
  };

  const handleOpenTask = async (taskId: string) => {
    try {
      const tasks = await getTasks({ status: ['Open', 'Completed', 'Canceled', 'Waiting'] });
      const task = tasks.find(t => t.TaskId === taskId);
      if (task) {
        setSelectedTask(task);
        setPendingWellnessLink(null);
        setIsTaskDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeek + 'T12:00:00');
    const offset = direction === 'next' ? 7 : -7;
    current.setDate(current.getDate() + offset);
    const newWeekStart = getWeekStart(current);
    setCurrentWeek(newWeekStart);
  };

  const handleChartWeekClick = (weekStart: string) => {
    setCurrentWeek(weekStart);
  };

  const handleWellnessTaskSave = async (taskData: Partial<Task>) => {
    try {
      let taskId: string;
      if (selectedTask) {
        await updateTask(selectedTask.TaskId, taskData);
        taskId = selectedTask.TaskId;
      } else {
        const newTaskData = { ...taskData, tags: [...(taskData.tags || []), 'Wellness'] };
        if (pendingWellnessLink) {
          newTaskData.title = `${pendingWellnessLink.practice}: ${taskData.title}`;
        }
        const newTask = await createTask(newTaskData);
        taskId = newTask.TaskId;
      }
      if (pendingWellnessLink && !selectedTask) {
        const existingPractice = currentWeekPractices.find(p => p.date === pendingWellnessLink.date && p.practice === pendingWellnessLink.practice);
        if (existingPractice) {
          await updatePracticeInstance(pendingWellnessLink.date, pendingWellnessLink.practice, { linkedTaskId: taskId });
        } else {
          try {
            await createPracticeInstance({ date: pendingWellnessLink.date, practice: pendingWellnessLink.practice, linkedTaskId: taskId });
          } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
              await updatePracticeInstance(pendingWellnessLink.date, pendingWellnessLink.practice, { linkedTaskId: taskId });
              await loadWellnessData();
            } else {
              throw error;
            }
          }
        }
      }
      await loadWellnessData();
      setIsTaskDialogOpen(false);
      setSelectedTask(null);
      setPendingWellnessLink(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const formatWeekDisplay = (weekStart: string): string => {
    if (!weekStart) return '';
    const start = new Date(weekStart + 'T00:00:00');
    const end = new Date(weekStart + 'T00:00:00');
    end.setDate(end.getDate() + 6);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const isCurrentWeek = (): boolean => {
    const today = new Date();
    const thisWeekStart = getWeekStart(today);
    return currentWeek === thisWeekStart;
  };

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
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-page">
      <div className="wellness-page-container">
        <div className="wellness-header">
          <div className="wellness-title-section">
            <h1 className="wellness-page-title">Wellness Check</h1>
            <p className="wellness-page-subtitle">Build daily and weekly habits that scientifically improve well-being</p>
          </div>
          <div className="wellness-current-score">
            <div className="wellness-score-display">
              <span className="wellness-score-label">Week Score:</span>
              <span className="wellness-score-value">{Math.round(viewedWeekScore)}/100</span>
              {lastWeekScore > 0 && (
                <span className={`wellness-score-change ${viewedWeekScore >= lastWeekScore ? 'positive' : 'negative'}`}>
                  ({viewedWeekScore >= lastWeekScore ? '+' : ''}{Math.round(viewedWeekScore - lastWeekScore)})
                </span>
              )}
            </div>
            <div className="wellness-score-subtitle">(Last week: {Math.round(lastWeekScore)})</div>
          </div>
        </div>
        <div className="wellness-chart-section">
          <div className="wellness-section-header">
            <h2>Weekly Progress</h2>
            <p>Your wellness scores over the past 12 weeks</p>
          </div>
          <WellnessScoreChart data={weeklyScores} onWeekClick={handleChartWeekClick} className="wellness-main-chart" />
        </div>
        <div className="wellness-tracker-section">
          <div className="wellness-section-header">
            <div className="wellness-tracker-title">
              <div className="wellness-tracker-title-left">
                <h2>Weekly Tracker</h2>
                <div className="wellness-tracker-score">Score: <span className="wellness-score-highlight">{Math.round(viewedWeekScore)}/100</span></div>
              </div>
              <div className="wellness-week-navigation">
                <Button onClick={() => navigateWeek('prev')} variant="ghost" size="icon" disabled={isLoading}><Icon name="ChevronLeft" className="h-4 w-4" /></Button>
                <span className="wellness-current-week">
                  {formatWeekDisplay(currentWeek)}
                  {isCurrentWeek() && (<span className="wellness-current-indicator">Current Week</span>)}
                </span>
                <Button onClick={() => navigateWeek('next')} variant="ghost" size="icon" disabled={isLoading}><Icon name="ChevronRight" className="h-4 w-4" /></Button>
              </div>
            </div>
            <p>Click cells to mark practices complete • ➕ to add tasks • 🔗 to view linked tasks • 📝 to add/edit journal entries</p>
          </div>
          {currentWeek && (
            <WellnessTrackerGrid
              weekStart={currentWeek}
              practices={currentWeekPractices}
              onPracticeUpdate={handlePracticeUpdate}
              onCreateTask={handleCreateTask}
              onOpenTask={handleOpenTask}
              onJournalEdit={handleJournalEdit}
              hasJournalEntry={hasJournalEntry}
              loading={isLoading}
              className="wellness-main-grid"
            />
          )}
        </div>
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <EditTaskForm
              task={selectedTask}
              onSave={handleWellnessTaskSave}
              onCancel={() => setIsTaskDialogOpen(false)}
              allTags={allTags}
              mitTaskCount={mitTaskCount}
              litTaskCount={litTaskCount}
              defaultValues={
                pendingWellnessLink && !selectedTask
                  ? { dueDate: pendingWellnessLink.date, tags: ['Wellness'] }
                  : undefined
              }
            />
          </DialogContent>
        </Dialog>
        <Dialog open={!!showJournalFor} onOpenChange={(isOpen) => { if (!isOpen) setShowJournalFor(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reflection for {showJournalFor?.practice}</DialogTitle>
              <DialogDescription>{new Date(showJournalFor?.date || '').toLocaleDateString()}</DialogDescription>
            </DialogHeader>
            <textarea
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder="Journal the details... (Optional)"
              maxLength={300}
              rows={4}
              autoFocus
              className="w-full bg-input text-foreground rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowJournalFor(null)}>Cancel</Button>
              <Button onClick={handleJournalSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WellnessPage; 