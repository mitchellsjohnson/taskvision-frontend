import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { WellnessPractice, PracticeInstance } from '../types';
import { useWellnessApi } from '../services/wellness-api';

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
  'Savoring Reflection': { daily: false, weeklyTarget: 1 }, // Weekly practice, not daily
  'Exercise': { daily: true, weeklyTarget: 7 },
};

export const WellnessStatusWidget: React.FC<WellnessStatusWidgetProps> = ({ onRefresh }) => {
  const [practiceStatuses, setPracticeStatuses] = useState<PracticeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJournalFor, setShowJournalFor] = useState<WellnessPractice | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [journalEntries, setJournalEntries] = useState<Record<string, string>>({});
  const [currentDateOffset, setCurrentDateOffset] = useState(0); // 0 = today, -1 = yesterday, etc.
  const [weeklyScore, setWeeklyScore] = useState<number>(0);
  const [weeklyScoreChange, setWeeklyScoreChange] = useState<number>(0);
  const { getAccessTokenSilently } = useAuth0();
  const { getWeeklyScores, createPracticeInstance, updatePracticeInstance } = useWellnessApi();

  const API_SERVER_URL = process.env.REACT_APP_API_SERVER_URL;

  const getDateInfo = (dateOffset: number = 0) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + dateOffset);
    
    const currentDate = baseDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    // Get week range for the selected date
    const dayOfWeek = baseDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based week
    
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - mondayOffset);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Format week display like "Aug4-Aug10"
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
      
      const accessToken = await getAccessTokenSilently();
      const { weekStart, weekEnd, currentDate } = getDateInfo(currentDateOffset);
      
      // Fetch practice instances for current week
      const response = await axios.get(`${API_SERVER_URL}/api/wellness/practices`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { startDate: weekStart, endDate: weekEnd }
      });
      
      const practices: PracticeInstance[] = response.data?.data || [];
      
      // Load journal entries from practice instances
      const loadedJournalEntries: Record<string, string> = {};
      practices.forEach(practice => {
        if (practice.journal) {
          const practiceId = `${practice.date}-${practice.practice}`;
          loadedJournalEntries[practiceId] = practice.journal;
        }
      });
      setJournalEntries(loadedJournalEntries);
      
      // Fetch weekly score for this week
      try {
        const scores = await getWeeklyScores(1);
        
        if (scores && Array.isArray(scores) && scores.length > 0) {
          const currentWeekScore = scores.find(s => s && s.weekStart === weekStart);
          setWeeklyScore(currentWeekScore?.score || 0);
        } else {
          setWeeklyScore(0);
        }
      } catch (scoreErr) {
        console.warn('Could not fetch weekly score:', scoreErr);
        setWeeklyScore(0);
      }
      
      // Calculate status for each practice
      const statuses: PracticeStatus[] = Object.entries(PRACTICE_DISPLAY_NAMES).map(([practice, displayName]) => {
        try {
          const practiceType = practice as WellnessPractice;
          const practiceInstances = Array.isArray(practices) ? practices.filter(p => p && p.practice === practiceType) : [];
          const completedToday = practiceInstances.some(p => p.date === currentDate && p.completed);
          const weeklyProgress = practiceInstances.filter(p => p.completed).length;
          const target = PRACTICE_TARGETS[practiceType];
          
          if (!target) {
            console.warn(`No target found for practice: ${practiceType}`);
            return {
              practice: practiceType,
              completedToday: false,
              weeklyProgress: 0,
              weeklyTarget: 7,
              hasJournal: false,
              journalEntry: ''
            };
          }
          
          // Check for journal entries (stored locally for now)
          const todayPracticeId = `${currentDate}-${practiceType}`;
          const hasJournal = journalEntries[todayPracticeId] ? true : false;
          
          return {
            practice: practiceType,
            completedToday,
            weeklyProgress,
            weeklyTarget: target.weeklyTarget,
            hasJournal,
            journalEntry: journalEntries[todayPracticeId] || ''
          };
        } catch (error) {
          console.error(`Error processing practice ${practice}:`, error);
          return {
            practice: practice as WellnessPractice,
            completedToday: false,
            weeklyProgress: 0,
            weeklyTarget: 7,
            hasJournal: false,
            journalEntry: ''
          };
        }
      });
      
      setPracticeStatuses(statuses);
    } catch (err) {
      console.error('Error fetching wellness status:', err);
      setError('Failed to load wellness status');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessTokenSilently, API_SERVER_URL, journalEntries, currentDateOffset]);

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
    
    // For dates beyond +/-1, show the actual date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + currentDateOffset);
    return targetDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate practice status for weekly indicators (G/R/Complete)
  const getPracticeStatus = (practice: WellnessPractice): 'complete' | 'at-risk' => {
    const target = PRACTICE_TARGETS[practice].weeklyTarget;
    const completed = practiceStatuses.find(p => p.practice === practice)?.weeklyProgress || 0;
    
    // If target is met, it's complete (green)
    if (completed >= target) return 'complete';
    
    // Calculate how many days have passed in the week
    const { weekStart } = getDateInfo(currentDateOffset);
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

  // Get status indicator for practice (G/R)
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
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: bgColor,
          color: color,
          fontSize: '10px',
          fontWeight: '600',
          border: `1px solid ${color}`,
          marginLeft: '4px'
        }}
        title={`Status: ${status === 'complete' ? 'Complete (G)' : 'At Risk (R)'}`}
      >
        {letter}
      </span>
    );
  };

  // Get completion indicator (✓ Complete)
  const getCompletionIndicator = (practice: WellnessPractice): React.ReactNode => {
    const target = PRACTICE_TARGETS[practice].weeklyTarget;
    const completed = practiceStatuses.find(p => p.practice === practice)?.weeklyProgress || 0;
    const isComplete = completed >= target;
    
    if (isComplete) {
      return (
        <span 
          className="wellness-completion-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1px 4px',
            borderRadius: '8px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontSize: '8px',
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

  const handlePracticeToggle = async (practice: WellnessPractice) => {
    try {
      const { currentDate } = getDateInfo(currentDateOffset);
      const practiceStatus = practiceStatuses.find(p => p.practice === practice);
      
      if (!practiceStatus) return;
      
      if (practiceStatus.completedToday) {
        // If already completed, uncheck it (toggle off)
        await updatePracticeInstance(currentDate, practice, { completed: false });
        fetchWellnessStatus();
      } else {
        // Mark as complete - use same logic as main wellness page
        let wasJustCompleted = false;
        
        // Check if practice already exists for this date
        const { weekStart, weekEnd } = getDateInfo(currentDateOffset);
        const response = await axios.get(`${API_SERVER_URL}/api/wellness/practices`, {
          headers: { Authorization: `Bearer ${await getAccessTokenSilently()}` },
          params: { startDate: weekStart, endDate: weekEnd }
        });
        
        const existingPractices: PracticeInstance[] = response.data?.data || [];
        const existingPractice = existingPractices.find(
          p => p.date === currentDate && p.practice === practice
        );
        
        if (existingPractice) {
          // Update existing practice
          wasJustCompleted = !existingPractice.completed;
          await updatePracticeInstance(currentDate, practice, { completed: true });
        } else {
          // Try to create new practice
          try {
            await createPracticeInstance({
              date: currentDate,
              practice,
            });
            
            // Then update it to completed
            wasJustCompleted = true;
            await updatePracticeInstance(currentDate, practice, { completed: true });
          } catch (error) {
            // If practice already exists (race condition), update it instead
            if (error instanceof Error && (error.message.includes('already exists') || error.message.includes('409'))) {
              await updatePracticeInstance(currentDate, practice, { completed: true });
              wasJustCompleted = true;
            } else {
              throw error; // Re-throw other errors
            }
          }
        }
        
        // Show journal input immediately after completion
        if (wasJustCompleted) {
          setShowJournalFor(practice);
          const practiceId = `${currentDate}-${practice}`;
          setJournalContent(journalEntries[practiceId] || '');
        }
        
        // Refresh status
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
      
      // Save journal entry to database
      await updatePracticeInstance(currentDate, showJournalFor, {
        journal: journalContent.trim() || undefined
      });
      
      // Update local state for immediate UI feedback
      const practiceId = `${currentDate}-${showJournalFor}`;
      const updatedEntries = { ...journalEntries };
      if (journalContent.trim()) {
        updatedEntries[practiceId] = journalContent.trim();
      } else {
        delete updatedEntries[practiceId];
      }
      setJournalEntries(updatedEntries);
      
      // Refresh data to ensure consistency
      await fetchWellnessStatus();
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
    
    // Close journal input
    setShowJournalFor(null);
    setJournalContent('');
  };

  const getPracticeIcon = (practice: WellnessPractice, completed: boolean) => {
    const iconMap: Record<WellnessPractice, string> = {
      'Gratitude': '🙏',
      'Meditation': '🧘',
      'Kindness': '💝',
      'Social Outreach': '👥',
      'Novelty Challenge': '🌟',
      'Savoring Reflection': '🌅',
      'Exercise': '💪',
    };
    
    return completed ? '✅' : iconMap[practice];
  };

  const getProgressBarClass = (practice: WellnessPractice, progress: number, target: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday=0 to Sunday=7
    const expectedProgress = PRACTICE_TARGETS[practice].daily 
      ? dayOfWeek 
      : Math.ceil((dayOfWeek / 7) * target);
    
    if (progress >= target) return 'progress-complete';
    if (progress >= expectedProgress) return 'progress-on-track';
    return 'progress-behind';
  };

  if (isLoading) {
    return (
      <div className="wellness-status-widget">
        <h3 className="widget-title">Wellness Status</h3>
        <div className="widget-content loading">
          <div className="loading-spinner"></div>
          <p>Loading wellness status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wellness-status-widget">
        <h3 className="widget-title">Wellness Status</h3>
        <div className="widget-content error" role="alert">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={fetchWellnessStatus}
            aria-label="Retry loading wellness status"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get current week display
  const { weekDisplay } = getDateInfo(currentDateOffset);

  return (
    <div className="wellness-status-widget">
      <div className="widget-header">
        <h3 className="widget-title">Wellness Status</h3>
        <div className="date-navigation">
          <button 
            className="date-nav-btn"
            onClick={() => navigateDate('prev')}
            aria-label="Previous day"
          >
            ‹
          </button>
          <span className="date-display" onClick={currentDateOffset !== 0 ? goToToday : undefined}>
            {getDateDisplayText()}
          </span>
          <button 
            className="date-nav-btn"
            onClick={() => navigateDate('next')}
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </div>
      
      <div className="week-score-display">
        <div className="week-range">Week: {weekDisplay}</div>
        <div className="score-info">
          <span className="score-label">Week Score:</span>
          <span className="score-value">{weeklyScore}/100</span>
          {weeklyScoreChange !== 0 && (
            <span className={`score-change ${weeklyScoreChange > 0 ? 'positive' : 'negative'}`}>
              ({weeklyScoreChange > 0 ? '+' : ''}{weeklyScoreChange})
            </span>
          )}
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
                <button
                  className={`practice-checkbox ${status.completedToday ? 'completed' : 'incomplete'}`}
                  onClick={() => handlePracticeToggle(status.practice)}
                  aria-label={`Toggle ${PRACTICE_DISPLAY_NAMES[status.practice]} for ${getDateDisplayText()}`}
                  title={`${status.completedToday ? 'Uncheck' : 'Check'} ${PRACTICE_DISPLAY_NAMES[status.practice]} for ${getDateDisplayText()}`}
                >
                  {status.completedToday ? '✅' : '⬜'}
                </button>
                
                {status.hasJournal && (
                  <button 
                    className="journal-indicator clickable" 
                    title="Click to edit journal entry"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowJournalFor(status.practice);
                      const practiceId = `${getDateInfo(currentDateOffset).currentDate}-${status.practice}`;
                      setJournalContent(journalEntries[practiceId] || '');
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="practice-progress">
                <div 
                  className={`progress-bar ${getProgressBarClass(status.practice, status.weeklyProgress, status.weeklyTarget)}`}
                >
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min((status.weeklyProgress / status.weeklyTarget) * 100, 100)}%` }}
                  />
                </div>
                <span className="progress-text">
                  {status.weeklyProgress}/{status.weeklyTarget}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Journal Input/View Modal */}
        {showJournalFor && (
          <div className="journal-modal">
            <div className="journal-content">
              <h4>
                {currentDateOffset === 0 ? 'Reflection' : 'Past Reflection'} for {PRACTICE_DISPLAY_NAMES[showJournalFor]}
                {currentDateOffset !== 0 && (
                  <span className="week-indicator"> ({getDateDisplayText()})</span>
                )}
              </h4>
              <textarea
                value={journalContent}
                onChange={currentDateOffset === 0 ? (e) => setJournalContent(e.target.value) : undefined}
                placeholder={currentDateOffset === 0 ? "Journal the details..." : "No journal entry for this practice"}
                maxLength={300}
                rows={4}
                autoFocus={currentDateOffset === 0}
                className="journal-input"
                readOnly={currentDateOffset !== 0}
              />
              <div className="journal-actions">
                {currentDateOffset === 0 && (
                  <span className="character-count">
                    {journalContent.length}/300
                  </span>
                )}
                {currentDateOffset === 0 && (
                  <button 
                    className="save-button"
                    onClick={handleJournalSave}
                  >
                    Save
                  </button>
                )}
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setShowJournalFor(null);
                    setJournalContent('');
                  }}
                >
                  {currentDateOffset === 0 ? 'Cancel' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="widget-footer">
          <span className="weekly-summary">
            {currentDateOffset === 0 
              ? `Today: ${practiceStatuses.filter(p => p.completedToday).length}/7 completed`
              : `Week total: ${practiceStatuses.reduce((sum, p) => sum + p.weeklyProgress, 0)} practices`
            }
          </span>
          <button 
            className="refresh-button"
            onClick={fetchWellnessStatus}
            aria-label="Refresh wellness status"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
}; 