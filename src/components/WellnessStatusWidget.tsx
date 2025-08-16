import React, { useState, useEffect, useCallback } from 'react';
import { WellnessPractice, PracticeInstance } from '../types';
import { useWellnessApi } from '../services/wellness-api';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Checkbox';
import { Icon } from './icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog';

interface WellnessStatusWidgetProps {
  onRefresh?: () => void;
}

interface PracticeStatus {
  practice: WellnessPractice;
  completedToday: boolean;
  weeklyProgress: number;
  weeklyTarget: number;
  hasJournal: boolean;
  journalEntry?: string;
}

const PRACTICE_DISPLAY_NAMES: Record<WellnessPractice, string> = {
  'Gratitude': 'Gratitude',
  'Meditation': 'Meditation',
  'Kindness': 'Kindness',
  'Social Outreach': 'Social Outreach',
  'Novelty Challenge': 'Novelty Challenge',
  'Savoring Reflection': 'Savoring Reflection',
  'Exercise': 'Exercise',
};

const PRACTICE_TARGETS: Record<WellnessPractice, { daily: boolean; weeklyTarget: number }> = {
  'Gratitude': { daily: true, weeklyTarget: 7 },
  'Meditation': { daily: true, weeklyTarget: 7 },
  'Kindness': { daily: false, weeklyTarget: 2 },
  'Social Outreach': { daily: false, weeklyTarget: 2 },
  'Novelty Challenge': { daily: false, weeklyTarget: 2 },
  'Savoring Reflection': { daily: false, weeklyTarget: 1 },
  'Exercise': { daily: true, weeklyTarget: 7 },
};

export const WellnessStatusWidget: React.FC<WellnessStatusWidgetProps> = ({ onRefresh }) => {
  const [practiceStatuses, setPracticeStatuses] = useState<PracticeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJournalFor, setShowJournalFor] = useState<WellnessPractice | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [journalEntries, setJournalEntries] = useState<Record<string, string>>({});
  const [currentDateOffset, setCurrentDateOffset] = useState(0);
  const [weeklyScore, setWeeklyScore] = useState<number>(0);
  const { getWeeklyScores, createPracticeInstance, updatePracticeInstance, getPracticeInstances } = useWellnessApi();

  const getDateInfo = (dateOffset: number = 0) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + dateOffset);
    const currentDate = baseDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = baseDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekDisplay = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return {
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0],
      currentDate,
      today,
      isToday: dateOffset === 0,
      weekDisplay
    };
  };

  const fetchWellnessStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { weekStart, weekEnd, currentDate } = getDateInfo(currentDateOffset);
      const practices: PracticeInstance[] = await getPracticeInstances(weekStart, weekEnd);
      const loadedJournalEntries: Record<string, string> = {};
      practices.forEach(practice => {
        if (practice.journal) {
          const practiceId = `${practice.date}-${practice.practice}`;
          loadedJournalEntries[practiceId] = practice.journal;
        }
      });
      setJournalEntries(loadedJournalEntries);
      try {
        const scores = await getWeeklyScores(1);
        if (scores && Array.isArray(scores) && scores.length > 0) {
          const currentWeekScore = scores.find(s => s && s.weekStart === weekStart) || scores[0];
          setWeeklyScore(currentWeekScore?.score || 0);
        } else {
          setWeeklyScore(0);
        }
      } catch (scoreErr) {
        console.warn('Could not fetch weekly score:', scoreErr);
        setWeeklyScore(0);
      }
      const statuses: PracticeStatus[] = Object.entries(PRACTICE_DISPLAY_NAMES).map(([practice, displayName]) => {
        try {
          const practiceType = practice as WellnessPractice;
          const practiceInstances = Array.isArray(practices) ? practices.filter(p => p && p.practice === practiceType) : [];
          const completedToday = practiceInstances.some(p => p.date === currentDate && p.completed);
          const weeklyProgress = practiceInstances.filter(p => p.completed).length;
          const target = PRACTICE_TARGETS[practiceType];
          if (!target) {
            console.warn(`No target found for practice: ${practiceType}`);
            return { practice: practiceType, completedToday: false, weeklyProgress: 0, weeklyTarget: 7, hasJournal: false, journalEntry: '' };
          }
          const todayPracticeId = `${currentDate}-${practiceType}`;
          const hasJournal = !!loadedJournalEntries[todayPracticeId];
          return {
            practice: practiceType,
            completedToday,
            weeklyProgress,
            weeklyTarget: target.weeklyTarget,
            hasJournal,
            journalEntry: loadedJournalEntries[todayPracticeId] || ''
          };
        } catch (error) {
          console.error(`Error processing practice ${practice}:`, error);
          return { practice: practice as WellnessPractice, completedToday: false, weeklyProgress: 0, weeklyTarget: 7, hasJournal: false, journalEntry: '' };
        }
      });
      setPracticeStatuses(statuses);
    } catch (err) {
      console.error('Error fetching wellness status:', err);
      setError('Failed to load wellness status');
    } finally {
      setIsLoading(false);
    }
  }, [getPracticeInstances, getWeeklyScores, currentDateOffset]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { fetchWellnessStatus(); }, 500);
    };
    window.addEventListener('dashboardTabSwitch', handleRefresh);
    window.addEventListener('wellnessDataUpdated', handleRefresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('dashboardTabSwitch', handleRefresh);
      window.removeEventListener('wellnessDataUpdated', handleRefresh);
    };
  }, [fetchWellnessStatus]);

  useEffect(() => {
    fetchWellnessStatus();
  }, [fetchWellnessStatus]);

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDateOffset(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const goToToday = () => {
    setCurrentDateOffset(0);
  };

  const getDateDisplayText = () => {
    if (currentDateOffset === 0) return 'Today';
    if (currentDateOffset === -1) return 'Yesterday';
    if (currentDateOffset === 1) return 'Tomorrow';
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + currentDateOffset);
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPracticeStatus = (practice: WellnessPractice): 'complete' | 'at-risk' => {
    const target = PRACTICE_TARGETS[practice].weeklyTarget;
    const completed = practiceStatuses.find(p => p.practice === practice)?.weeklyProgress || 0;
    if (completed >= target) return 'complete';
    const { weekStart } = getDateInfo(currentDateOffset);
    const today = new Date();
    const weekStartDate = new Date(weekStart + 'T00:00:00');
    const daysPassed = Math.max(0, Math.floor((today.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24))) + 1;
    const daysPassedInWeek = Math.min(daysPassed, 7);
    if (target === 7) {
      if (completed < daysPassedInWeek - 2) return 'at-risk';
      return 'complete';
    }
    if (target === 2) {
      if (daysPassedInWeek >= 5 && completed === 0) return 'at-risk';
      return 'complete';
    }
    if (target === 1) {
      if (daysPassedInWeek >= 6 && completed === 0) return 'at-risk';
      return 'complete';
    }
    return 'complete';
  };

  const getStatusIndicator = (practice: WellnessPractice): React.ReactNode => {
    const status = getPracticeStatus(practice);
    const getIndicatorProps = () => {
      switch (status) {
        case 'complete': return { letter: 'G', color: '#22c55e', bgColor: '#dcfce7' };
        case 'at-risk': return { letter: 'R', color: '#ef4444', bgColor: '#fecaca' };
        default: return { letter: 'G', color: '#22c55e', bgColor: '#dcfce7' };
      }
    };
    const { letter, color, bgColor } = getIndicatorProps();
    return (
      <span className="wellness-status-circle" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: bgColor, color: color, fontSize: '10px', fontWeight: '600', border: `1px solid ${color}`, marginLeft: '4px' }} title={`Status: ${status === 'complete' ? 'Complete (G)' : 'At Risk (R)'}`}>
        {letter}
      </span>
    );
  };

  const getCompletionIndicator = (practice: WellnessPractice): React.ReactNode => {
    const target = PRACTICE_TARGETS[practice].weeklyTarget;
    const completed = practiceStatuses.find(p => p.practice === practice)?.weeklyProgress || 0;
    const isComplete = completed >= target;
    if (isComplete) {
      return (
        <span className="wellness-completion-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1px 4px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '8px', fontWeight: '700', border: '1px solid #22c55e', marginLeft: '4px', textTransform: 'uppercase' }} title="Weekly target achieved!">
          ✓ Complete
        </span>
      );
    }
    return null;
  };

  const handlePracticeToggle = async (practice: WellnessPractice, isCompleted: boolean) => {
    try {
      const { currentDate } = getDateInfo(currentDateOffset);
      const practiceStatus = practiceStatuses.find(p => p.practice === practice);
      if (!practiceStatus) return;

      if (!isCompleted) {
        await updatePracticeInstance(currentDate, practice, { completed: false });
        fetchWellnessStatus();
      } else {
        let wasJustCompleted = false;
        const { weekStart, weekEnd } = getDateInfo(currentDateOffset);
        const existingPractices: PracticeInstance[] = await getPracticeInstances(weekStart, weekEnd);
        const existingPractice = existingPractices.find(
          p => p.date === currentDate && p.practice === practice
        );
        if (existingPractice) {
          wasJustCompleted = !existingPractice.completed;
          await updatePracticeInstance(currentDate, practice, { completed: true });
        } else {
          try {
            await createPracticeInstance({
              date: currentDate,
              practice,
            });
            wasJustCompleted = true;
            await updatePracticeInstance(currentDate, practice, { completed: true });
          } catch (error) {
            if (error instanceof Error && (error.message.includes('already exists') || error.message.includes('409'))) {
              await updatePracticeInstance(currentDate, practice, { completed: true });
              wasJustCompleted = true;
            } else {
              throw error;
            }
          }
        }
        if (wasJustCompleted) {
          setShowJournalFor(practice);
          const practiceId = `${currentDate}-${practice}`;
          setJournalContent(journalEntries[practiceId] || '');
        }
        fetchWellnessStatus();
      }
    } catch (err) {
      console.error('Error updating practice:', err);
      setError('Failed to update practice');
    }
  };

  const handleJournalSave = async () => {
    if (!showJournalFor) return;
    try {
      const { currentDate } = getDateInfo(currentDateOffset);
      await updatePracticeInstance(currentDate, showJournalFor, { journal: journalContent.trim() || undefined });
      const practiceId = `${currentDate}-${showJournalFor}`;
      const updatedEntries = { ...journalEntries };
      if (journalContent.trim()) {
        updatedEntries[practiceId] = journalContent.trim();
      } else {
        delete updatedEntries[practiceId];
      }
      setJournalEntries(updatedEntries);
      await fetchWellnessStatus();
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
    setShowJournalFor(null);
    setJournalContent('');
  };

  const getProgressBarClass = (practice: WellnessPractice, progress: number, target: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const expectedProgress = PRACTICE_TARGETS[practice].daily ? dayOfWeek : Math.ceil((dayOfWeek / 7) * target);
    if (progress >= target) return 'progress-complete';
    if (progress >= expectedProgress) return 'progress-on-track';
    return 'progress-behind';
  };

  if (isLoading) {
    return (
      <div className="wellness-status-widget">
        <h3 className="widget-title">Wellness Status</h3>
        <div className="widget-content loading"><div className="loading-spinner"></div><p>Loading wellness status...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wellness-status-widget">
        <h3 className="widget-title">Wellness Status</h3>
        <div className="widget-content error" role="alert">
          <p>{error}</p>
          <Button variant="outline" onClick={fetchWellnessStatus}>Retry</Button>
        </div>
      </div>
    );
  }

  const { weekDisplay } = getDateInfo(currentDateOffset);

  return (
    <>
      <div className="wellness-status-widget">
        <div className="widget-header">
          <h3 className="widget-title">Wellness Status</h3>
          <div className="date-navigation">
            <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')} aria-label="Previous day"><Icon name="ChevronLeft" className="h-4 w-4" /></Button>
            <span className="date-display" onClick={currentDateOffset !== 0 ? goToToday : undefined}>{getDateDisplayText()}</span>
            <Button variant="ghost" size="icon" onClick={() => navigateDate('next')} aria-label="Next day"><Icon name="ChevronRight" className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="week-score-display">
          <div className="week-range">Week: {weekDisplay}</div>
          <div className="score-info">
            <span className="score-label">Week Score:</span>
            <span className="score-value">{Math.round(weeklyScore)}/100</span>
          </div>
        </div>
        <div className="widget-content">
          <div className="practices-grid">
            {practiceStatuses.map((status) => (
              <div key={status.practice} className="practice-item">
                <div className="practice-header">
                  <span className="practice-name">
                    {PRACTICE_DISPLAY_NAMES[status.practice]}
                    {getStatusIndicator(status.practice)}
                    {getCompletionIndicator(status.practice)}
                  </span>
                </div>
                <div className="practice-controls">
                  <Checkbox
                    checked={status.completedToday}
                    onCheckedChange={(checked) => handlePracticeToggle(status.practice, !!checked)}
                    aria-label={`Toggle ${PRACTICE_DISPLAY_NAMES[status.practice]} for ${getDateDisplayText()}`}
                  />
                  {status.hasJournal && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Click to edit journal entry" onClick={(e) => { e.stopPropagation(); setShowJournalFor(status.practice); const practiceId = `${getDateInfo(currentDateOffset).currentDate}-${status.practice}`; setJournalContent(journalEntries[practiceId] || ''); }}>
                      <Icon name="FileText" className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="practice-progress">
                  <div className={`progress-bar ${getProgressBarClass(status.practice, status.weeklyProgress, status.weeklyTarget)}`}>
                    <div className="progress-fill" style={{ width: `${Math.min((status.weeklyProgress / status.weeklyTarget) * 100, 100)}%` }} />
                  </div>
                  <span className="progress-text">{status.weeklyProgress}/{status.weeklyTarget}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="widget-footer">
            <span className="weekly-summary">
              {currentDateOffset === 0 ? `Today: ${practiceStatuses.filter(p => p.completedToday).length}/7 completed` : `Week total: ${practiceStatuses.reduce((sum, p) => sum + p.weeklyProgress, 0)} practices`}
            </span>
            <Button variant="ghost" size="icon" onClick={fetchWellnessStatus} aria-label="Refresh wellness status"><Icon name="RefreshCw" className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
      <Dialog open={!!showJournalFor} onOpenChange={(isOpen) => { if (!isOpen) setShowJournalFor(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentDateOffset === 0 ? 'Reflection' : 'Past Reflection'} for {showJournalFor ? PRACTICE_DISPLAY_NAMES[showJournalFor] : ''}</DialogTitle>
            <DialogDescription>{currentDateOffset !== 0 && `(${getDateDisplayText()})`}</DialogDescription>
          </DialogHeader>
          <textarea value={journalContent} onChange={currentDateOffset === 0 ? (e) => setJournalContent(e.target.value) : undefined} placeholder={currentDateOffset === 0 ? "Journal the details..." : "No journal entry for this practice"} maxLength={300} rows={4} autoFocus={currentDateOffset === 0} className="w-full bg-gray-900/50 text-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" readOnly={currentDateOffset !== 0} />
          <DialogFooter>
            {currentDateOffset === 0 && (<Button onClick={handleJournalSave}>Save</Button>)}
            <Button variant="secondary" onClick={() => setShowJournalFor(null)}>{currentDateOffset === 0 ? 'Cancel' : 'Close'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 