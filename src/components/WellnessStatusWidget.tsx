import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { WellnessPractice, PracticeInstance } from '../types';

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
  'Meditation': 'Mindful Pause',
  'Kindness': 'Kindness',
  'Social Outreach': 'Social',
  'Novelty Challenge': 'Novelty',
  'Savoring Reflection': 'Reflection',
  'Exercise': 'Exercise',
};

const PRACTICE_TARGETS: Record<WellnessPractice, { daily: boolean; weeklyTarget: number }> = {
  'Gratitude': { daily: true, weeklyTarget: 7 },
  'Meditation': { daily: true, weeklyTarget: 7 },
  'Kindness': { daily: false, weeklyTarget: 2 },
  'Social Outreach': { daily: false, weeklyTarget: 2 },
  'Novelty Challenge': { daily: false, weeklyTarget: 2 },
  'Savoring Reflection': { daily: true, weeklyTarget: 7 },
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
      
      const practices: PracticeInstance[] = response.data.data;
      
      // Fetch weekly score for this week
      try {
        const scoreResponse = await axios.get(`${API_SERVER_URL}/api/wellness/scores`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { startDate: weekStart, endDate: weekEnd, weeks: 1 }
        });
        
        if (scoreResponse.data && scoreResponse.data.length > 0) {
          setWeeklyScore(scoreResponse.data[0].score || 0);
        } else {
          setWeeklyScore(0);
        }
      } catch (scoreErr) {
        console.warn('Could not fetch weekly score:', scoreErr);
        setWeeklyScore(0);
      }
      
      // Calculate status for each practice
      const statuses: PracticeStatus[] = Object.entries(PRACTICE_DISPLAY_NAMES).map(([practice, displayName]) => {
        const practiceType = practice as WellnessPractice;
        const practiceInstances = practices.filter(p => p.practice === practiceType);
        const completedToday = practiceInstances.some(p => p.date === currentDate && p.completed);
        const weeklyProgress = practiceInstances.filter(p => p.completed).length;
        const target = PRACTICE_TARGETS[practiceType];
        
        // Check for journal entries (stored locally for now)
        const todayPracticeId = `${currentDate}-${practiceType}`;
        const hasJournal = journalEntries[todayPracticeId] ? true : false;
        
        return {
          practice: practiceType,
          completedToday,
          weeklyProgress,
          weeklyTarget: target.weeklyTarget,
          hasJournal,
          journalEntry: journalEntries[todayPracticeId]
        };
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
    if (currentDateOffset < 0) return `${Math.abs(currentDateOffset)} days ago`;
    return `${currentDateOffset} days ahead`;
  };

  const handlePracticeToggle = async (practice: WellnessPractice) => {
    try {
      const accessToken = await getAccessTokenSilently();
      const { currentDate } = getDateInfo(currentDateOffset);
      const practiceStatus = practiceStatuses.find(p => p.practice === practice);
      
      if (!practiceStatus) return;
      
      // For non-current date, only allow viewing journals
      if (currentDateOffset !== 0) {
        if (practiceStatus.hasJournal) {
          setShowJournalFor(practice);
          const practiceId = `${currentDate}-${practice}`;
          setJournalContent(journalEntries[practiceId] || '');
        }
        return;
      }
      
      if (practiceStatus.completedToday) {
        // If already completed, show journal option
        setShowJournalFor(practice);
        const practiceId = `${currentDate}-${practice}`;
        setJournalContent(journalEntries[practiceId] || '');
      } else {
        // Mark as complete
        await axios.post(`${API_SERVER_URL}/api/wellness/practices`, {
          date: currentDate,
          practice: practice
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        // Show journal input immediately after completion
        setShowJournalFor(practice);
        setJournalContent('');
        
        // Refresh status
        fetchWellnessStatus();
      }
    } catch (err) {
      console.error('Error updating practice:', err);
      setError('Failed to update practice');
    }
  };

  const handleJournalSave = () => {
    if (!showJournalFor) return;
    
    const { currentDate } = getDateInfo(currentDateOffset);
    const practiceId = `${currentDate}-${showJournalFor}`;
    
    // Store journal entry locally (in production, this would be saved to backend)
    const updatedEntries = { ...journalEntries };
    if (journalContent.trim()) {
      updatedEntries[practiceId] = journalContent.trim();
    } else {
      delete updatedEntries[practiceId];
    }
    
    setJournalEntries(updatedEntries);
    
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
                <button
                  className={`practice-toggle ${status.completedToday ? 'completed' : 'pending'} ${currentDateOffset !== 0 ? 'view-only' : ''}`}
                  onClick={() => handlePracticeToggle(status.practice)}
                  aria-label={`${currentDateOffset === 0 ? 'Toggle' : 'View'} ${PRACTICE_DISPLAY_NAMES[status.practice]}`}
                >
                  <span className="practice-icon">
                    {getPracticeIcon(status.practice, status.completedToday)}
                  </span>
                  <span className="practice-name">
                    {PRACTICE_DISPLAY_NAMES[status.practice]}
                  </span>
                  <div className="practice-indicators">
                    {status.completedToday && currentDateOffset === 0 && (
                      <span className="completed-today-indicator" title="Completed today">✓</span>
                    )}
                    {status.hasJournal && (
                      <span className="journal-indicator" title="Has journal entry">📝</span>
                    )}
                  </div>
                </button>
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