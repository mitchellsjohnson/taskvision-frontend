import React, { useState } from 'react';
import { PracticeInstance, WellnessPractice } from '../../types';

interface WellnessTrackerGridProps {
  weekStart: string;
  practices: PracticeInstance[];
  onPracticeUpdate: (date: string, practice: WellnessPractice, completed: boolean) => Promise<void>;
  onCreateTask: (date: string, practice: WellnessPractice) => void;
  onOpenTask: (taskId: string) => void;
  loading?: boolean;
  className?: string;
}

interface CellData {
  date: string;
  practice: WellnessPractice;
  instance?: PracticeInstance;
  dayOfWeek: string;
  dayNumber: number;
}

const PRACTICES: WellnessPractice[] = [
  'Exercise',
  'Gratitude',
  'Kindness',
  'Meditation',
  'Novelty Challenge',
  'Savoring Reflection',
  'Social Outreach',
];

const PRACTICE_ICONS: Record<WellnessPractice, React.ReactNode> = {
  'Gratitude': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  'Meditation': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  'Kindness': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'Social Outreach': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'Novelty Challenge': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'Savoring Reflection': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  'Exercise': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const PRACTICE_DESCRIPTIONS: Record<WellnessPractice, string> = {
  'Gratitude': 'Daily gratitude practice (Daily)',
  'Meditation': 'Mindfulness meditation (Daily)',
  'Kindness': 'Acts of kindness (2x/week)',
  'Social Outreach': 'Connect with others (2x/week)',
  'Novelty Challenge': 'Try something new (2x/week)',
  'Savoring Reflection': 'Mindful appreciation (Weekly)',
  'Exercise': 'Walk, workout, stretch — whatever gets you moving (Daily)',
};

const PRACTICE_TARGETS: Record<WellnessPractice, number> = {
  'Gratitude': 7,
  'Meditation': 7,
  'Kindness': 2,
  'Social Outreach': 2,
  'Novelty Challenge': 2,
  'Savoring Reflection': 1,
  'Exercise': 7,
};

const WellnessTrackerGrid: React.FC<WellnessTrackerGridProps> = ({
  weekStart,
  practices,
  onPracticeUpdate,
  onCreateTask,
  onOpenTask,
  loading = false,
  className = '',
}) => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, boolean>>({});

  // Generate week dates
  const getWeekDates = (weekStart: string): Date[] => {
    const dates: Date[] = [];
    const start = new Date(weekStart + 'T00:00:00'); // Ensure proper date parsing
    
    // Validate the start date
    if (isNaN(start.getTime())) {
      console.error('Invalid weekStart date:', weekStart);
      return [];
    }
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const weekDates = getWeekDates(weekStart);

  // Create grid data
  const createGridData = (): CellData[][] => {
    if (weekDates.length === 0) {
      return [];
    }
    
    return PRACTICES.map(practice => 
      weekDates.map(date => {
        // Validate date before using it
        if (isNaN(date.getTime())) {
          console.error('Invalid date in weekDates:', date);
          return {
            date: '',
            practice,
            instance: undefined,
            dayOfWeek: '',
            dayNumber: 0,
          };
        }
        
        const dateStr = date.toISOString().split('T')[0];
        const instance = practices.find(p => p.date === dateStr && p.practice === practice);
        
        return {
          date: dateStr,
          practice,
          instance,
          dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate(),
        };
      })
    );
  };

  const gridData = createGridData();

  // Calculate practice status for visual indicators
  const getPracticeStatus = (practice: WellnessPractice): 'complete' | 'at-risk' => {
    const target = PRACTICE_TARGETS[practice];
    const completed = practices.filter(p => p.practice === practice && p.completed).length;
    
    // If target is met, it's complete (green)
    if (completed >= target) return 'complete';
    
    // Calculate how many days have passed in the week
    const today = new Date();
    const weekStartDate = new Date(weekStart + 'T00:00:00');
    const daysPassed = Math.max(0, Math.floor((today.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24))) + 1;
    const daysPassedInWeek = Math.min(daysPassed, 7);
    
    // For daily practices (7x/week), need to be on track
    if (target === 7) {
      // If significantly behind, show at-risk
      if (completed < daysPassedInWeek - 2) return 'at-risk';
      return 'complete'; // Otherwise show as on track (green)
    }
    
    // For weekly practices (2x/week or 1x/week)
    if (target === 2) {
      // If past mid-week with no progress, at-risk
      if (daysPassedInWeek >= 5 && completed === 0) return 'at-risk';
      return 'complete'; // Otherwise on track
    }
    
    // For 1x/week practices
    if (target === 1) {
      // If near end of week with no progress, at-risk
      if (daysPassedInWeek >= 6 && completed === 0) return 'at-risk';
      return 'complete'; // Otherwise on track
    }
    
    return 'complete';
  };

  // Get status indicator for practice
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
      <span 
        className="wellness-status-circle"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: bgColor,
          color: color,
          fontSize: '12px',
          fontWeight: '600',
          border: `2px solid ${color}`
        }}
      >
        {letter}
      </span>
    );
  };

  // Get completion status for practice
  const getPracticeCompletion = (practice: WellnessPractice): { isComplete: boolean; progress: { completed: number; target: number } } => {
    const target = PRACTICE_TARGETS[practice];
    const completed = practices.filter(p => p.practice === practice && p.completed).length;
    
    return {
      isComplete: completed >= target,
      progress: { completed, target }
    };
  };

  // Get completion indicator
  const getCompletionIndicator = (practice: WellnessPractice): React.ReactNode => {
    const { isComplete } = getPracticeCompletion(practice);
    
    if (isComplete) {
      return (
        <span 
          className="wellness-completion-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px 6px',
            borderRadius: '12px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontSize: '10px',
            fontWeight: '700',
            border: '1px solid #22c55e',
            marginLeft: '4px',
            textTransform: 'uppercase'
          }}
          title="Weekly target achieved!"
        >
          ✓ Complete
        </span>
      );
    }
    
    return null;
  };

  // Handle cell click
  const handleCellClick = async (cellData: CellData) => {
    if (loading) return;

    const key = `${cellData.date}-${cellData.practice}`;
    
    if (cellData.instance) {
      // Toggle completion
      const newCompleted = !cellData.instance.completed;
      
      // Optimistic update
      setOptimisticUpdates(prev => ({ ...prev, [key]: newCompleted }));
      
      try {
        await onPracticeUpdate(cellData.date, cellData.practice, newCompleted);
        // Clear optimistic update on success
        setOptimisticUpdates(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticUpdates(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        console.error('Failed to update practice:', error);
      }
    } else {
      // Create new practice and mark as completed
      setOptimisticUpdates(prev => ({ ...prev, [key]: true }));
      
      try {
        await onPracticeUpdate(cellData.date, cellData.practice, true);
        setOptimisticUpdates(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      } catch (error) {
        setOptimisticUpdates(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        console.error('Failed to create practice:', error);
      }
    }
  };

  // Handle add task button
  const handleAddTask = (cellData: CellData, event: React.MouseEvent) => {
    event.stopPropagation();
    onCreateTask(cellData.date, cellData.practice);
  };

  // Handle task link click
  const handleTaskClick = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onOpenTask(taskId);
  };

  // Get cell status
  const getCellStatus = (cellData: CellData) => {
    const key = `${cellData.date}-${cellData.practice}`;
    const optimisticCompleted = optimisticUpdates[key];
    
    if (optimisticCompleted !== undefined) {
      return optimisticCompleted ? 'completed' : 'incomplete';
    }
    
    if (cellData.instance) {
      if (cellData.instance.completed && cellData.instance.linkedTaskId) {
        return 'completed-linked';
      } else if (cellData.instance.completed) {
        return 'completed';
      } else if (cellData.instance.linkedTaskId) {
        return 'linked';
      } else {
        return 'incomplete';
      }
    }
    
    return 'empty';
  };

  // Get cell icon
  const getCellIcon = (cellData: CellData) => {
    const status = getCellStatus(cellData);
    
    switch (status) {
      case 'completed':
      case 'completed-linked':
        return '✅';
      case 'linked':
      case 'incomplete':
      case 'empty':
      default:
        return '⬜';
    }
  };

  // Get cell actions
  const getCellActions = (cellData: CellData) => {
    // Always show either plus button or link button
    if (cellData.instance?.linkedTaskId) {
      return (
        <button
          key="open-task"
          className="wellness-cell-action wellness-open-task"
          onClick={(e) => handleTaskClick(cellData.instance!.linkedTaskId!, e)}
          title="Open linked task"
        >
          🔗
        </button>
      );
    } else {
      return (
        <button
          key="add-task"
          className="wellness-cell-action wellness-add-task"
          onClick={(e) => handleAddTask(cellData, e)}
          title="Add related task"
        >
          ➕
        </button>
      );
    }
  };

  return (
    <div className={`wellness-tracker-grid ${className}`}>
      {/* Header Row */}
      <div className="wellness-grid-header">
        <div className="wellness-grid-cell wellness-practice-header">Practice</div>
        {weekDates.map((date, index) => (
          <div key={index} className="wellness-grid-cell wellness-day-header">
            <div className="wellness-day-name">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="wellness-day-number">{date.getDate()}</div>
          </div>
        ))}
      </div>

      {/* Practice Rows */}
      {gridData.map((practiceRow, practiceIndex) => (
        <div key={PRACTICES[practiceIndex]} className="wellness-grid-row">
          {/* Practice Label */}
          <div className="wellness-grid-cell wellness-practice-cell">
            <div className="wellness-practice-info">
              <div className="wellness-practice-icon">
                {PRACTICE_ICONS[PRACTICES[practiceIndex]]}
              </div>
              <div className="wellness-practice-text">
                <div className="wellness-practice-name">
                  {PRACTICES[practiceIndex]}
                  <span className="wellness-status-indicator" title={`Status: ${getPracticeStatus(PRACTICES[practiceIndex]).replace('complete', 'Complete (G)').replace('at-risk', 'At Risk (R)')}`}>
                    {getStatusIndicator(PRACTICES[practiceIndex])}
                  </span>
                  {getCompletionIndicator(PRACTICES[practiceIndex])}
                </div>
                <div className="wellness-practice-progress">
                  {(() => {
                    const { progress } = getPracticeCompletion(PRACTICES[practiceIndex]);
                    return `${progress.completed}/${progress.target}`;
                  })()}
                </div>
                <div className="wellness-practice-description">
                  {PRACTICE_DESCRIPTIONS[PRACTICES[practiceIndex]]}
                </div>
              </div>
            </div>
          </div>

          {/* Practice Days */}
          {practiceRow.map((cellData, dayIndex) => {
            const status = getCellStatus(cellData);
            const actionButton = getCellActions(cellData);
            
            return (
              <div
                key={`${practiceIndex}-${dayIndex}`}
                className={`wellness-grid-cell wellness-practice-day wellness-status-${status} ${
                  loading ? 'wellness-loading' : 'wellness-interactive'
                }`}
                onClick={() => handleCellClick(cellData)}
                title={`${cellData.practice} - ${cellData.dayOfWeek} ${cellData.dayNumber}`}
              >
                <div className="wellness-cell-content">
                  <span className="wellness-cell-icon">{getCellIcon(cellData)}</span>
                  <div className="wellness-cell-action-container">
                    {actionButton}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WellnessTrackerGrid;