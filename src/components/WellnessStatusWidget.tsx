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
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  const [weeklyScore, setWeeklyScore] = useState<number>(0);
  const { getAccessTokenSilently } = useAuth0();

  const API_SERVER_URL = process.env.REACT_APP_API_SERVER_URL;

  const getWeekDateRange = (weekOffset: number = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based week
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset + (weekOffset * 7));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0],
      isCurrentWeek: weekOffset === 0
    };
  };

  const fetchWellnessStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const accessToken = await getAccessTokenSilently();
      const { weekStart, weekEnd, today } = getWeekDateRange(currentWeekOffset);
      
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
        const completedToday = practiceInstances.some(p => p.date === today && p.completed);
        const weeklyProgress = practiceInstances.filter(p => p.completed).length;
        const target = PRACTICE_TARGETS[practiceType];
        
        // Check for journal entries (stored locally for now)
        const todayPracticeId = `${today}-${practiceType}`;
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
  }, [getAccessTokenSilently, API_SERVER_URL, journalEntries, currentWeekOffset]);

  useEffect(() => {
    fetchWellnessStatus();
  }, [fetchWellnessStatus]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekOffset(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekOffset(0);
  };

  const getWeekDisplayText = () => {
    if (currentWeekOffset === 0) return 'This Week';
    if (currentWeekOffset === -1) return 'Last Week';
    if (currentWeekOffset === 1) return 'Next Week';
    if (currentWeekOffset < 0) return `${Math.abs(currentWeekOffset)} weeks ago`;
    return `${currentWeekOffset} weeks ahead`;
  };

  const handlePracticeToggle = async (practice: WellnessPractice) => {
    try {
      const accessToken = await getAccessTokenSilently();
      const today = getWeekDateRange().today;
      const practiceStatus = practiceStatuses.find(p => p.practice === practice);
      
      if (!practiceStatus) return;
      
      // For non-current weeks, only allow viewing journals
      if (currentWeekOffset !== 0) {
        if (practiceStatus.hasJournal) {
          setShowJournalFor(practice);
          const practiceId = `${today}-${practice}`;
          setJournalContent(journalEntries[practiceId] || '');
        }
        return;
      }
      
      if (practiceStatus.completedToday) {
        // If already completed, show journal option
        setShowJournalFor(practice);
        const practiceId = `${today}-${practice}`;
        setJournalContent(journalEntries[practiceId] || '');
      } else {
        // Mark as complete
        await axios.post(`${API_SERVER_URL}/api/wellness/practices`, {
          date: today,
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
    
    const today = getWeekDateRange().today;
    const practiceId = `${today}-${showJournalFor}`;
    
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

  return (
    <div className="wellness-status-widget">
      <div className="widget-header">
        <h3 className="widget-title">Wellness Status</h3>
        <div className="week-navigation">
          <button 
            className="week-nav-btn"
            onClick={() => navigateWeek('prev')}
            aria-label="Previous week"
          >
            ‹
          </button>
          <span className="week-display" onClick={currentWeekOffset !== 0 ? goToCurrentWeek : undefined}>
            {getWeekDisplayText()}
          </span>
          <button 
            className="week-nav-btn"
            onClick={() => navigateWeek('next')}
            aria-label="Next week"
          >
            ›
          </button>
        </div>
      </div>
      
      {currentWeekOffset === 0 && (
        <div className="current-week-score">
          <span className="score-label">This Week:</span>
          <span className="score-value">{weeklyScore}/10</span>
        </div>
      )}
      
      <div className="widget-content">
        <div className="practices-grid">
          {practiceStatuses.map((status) => (
            <div key={status.practice} className="practice-item">
              <div className="practice-header">
                <button
                  className={`practice-toggle ${status.completedToday ? 'completed' : 'pending'} ${currentWeekOffset !== 0 ? 'view-only' : ''}`}
                  onClick={() => handlePracticeToggle(status.practice)}
                  aria-label={`${currentWeekOffset === 0 ? 'Toggle' : 'View'} ${PRACTICE_DISPLAY_NAMES[status.practice]}`}
                >
                  <span className="practice-icon">
                    {getPracticeIcon(status.practice, status.completedToday)}
                  </span>
                  <span className="practice-name">
                    {PRACTICE_DISPLAY_NAMES[status.practice]}
                  </span>
                  <div className="practice-indicators">
                    {status.completedToday && currentWeekOffset === 0 && (
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
                {currentWeekOffset === 0 ? 'Reflection' : 'Past Reflection'} for {PRACTICE_DISPLAY_NAMES[showJournalFor]}
                {currentWeekOffset !== 0 && (
                  <span className="week-indicator"> ({getWeekDisplayText()})</span>
                )}
              </h4>
              <textarea
                value={journalContent}
                onChange={currentWeekOffset === 0 ? (e) => setJournalContent(e.target.value) : undefined}
                placeholder={currentWeekOffset === 0 ? "How did this practice make you feel? What did you learn?" : "No journal entry for this practice"}
                maxLength={300}
                rows={4}
                autoFocus={currentWeekOffset === 0}
                className="journal-input"
                readOnly={currentWeekOffset !== 0}
              />
              <div className="journal-actions">
                {currentWeekOffset === 0 && (
                  <span className="character-count">
                    {journalContent.length}/300
                  </span>
                )}
                {currentWeekOffset === 0 && (
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
                  {currentWeekOffset === 0 ? 'Cancel' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="widget-footer">
          <span className="weekly-summary">
            {currentWeekOffset === 0 
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