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
  const { getAccessTokenSilently } = useAuth0();

  const API_SERVER_URL = process.env.REACT_APP_API_SERVER_URL;

  const getWeekDateRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based week
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0]
    };
  };

  const fetchWellnessStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const accessToken = await getAccessTokenSilently();
      const { weekStart, weekEnd, today } = getWeekDateRange();
      
      // Fetch practice instances for current week
      const response = await axios.get(`${API_SERVER_URL}/api/wellness/practices`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { startDate: weekStart, endDate: weekEnd }
      });
      
      const practices: PracticeInstance[] = response.data.data;
      
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
  }, [getAccessTokenSilently, API_SERVER_URL, journalEntries]);

  useEffect(() => {
    fetchWellnessStatus();
  }, [fetchWellnessStatus]);

  const handlePracticeToggle = async (practice: WellnessPractice) => {
    try {
      const accessToken = await getAccessTokenSilently();
      const today = getWeekDateRange().today;
      const practiceStatus = practiceStatuses.find(p => p.practice === practice);
      
      if (!practiceStatus) return;
      
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
      <h3 className="widget-title">Wellness Status</h3>
      <div className="widget-content">
        <div className="practices-grid">
          {practiceStatuses.map((status) => (
            <div key={status.practice} className="practice-item">
              <div className="practice-header">
                <button
                  className={`practice-toggle ${status.completedToday ? 'completed' : 'pending'}`}
                  onClick={() => handlePracticeToggle(status.practice)}
                  aria-label={`Toggle ${PRACTICE_DISPLAY_NAMES[status.practice]}`}
                >
                  <span className="practice-icon">
                    {getPracticeIcon(status.practice, status.completedToday)}
                  </span>
                  <span className="practice-name">
                    {PRACTICE_DISPLAY_NAMES[status.practice]}
                  </span>
                  {status.hasJournal && (
                    <span className="journal-indicator" title="Has journal entry">📝</span>
                  )}
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
        
        {/* Journal Input Modal */}
        {showJournalFor && (
          <div className="journal-modal">
            <div className="journal-content">
              <h4>Reflection for {PRACTICE_DISPLAY_NAMES[showJournalFor]}</h4>
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="How did this practice make you feel? What did you learn?"
                maxLength={300}
                rows={4}
                autoFocus
                className="journal-input"
              />
              <div className="journal-actions">
                <span className="character-count">
                  {journalContent.length}/300
                </span>
                <button 
                  className="save-button"
                  onClick={handleJournalSave}
                >
                  Save
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setShowJournalFor(null);
                    setJournalContent('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="widget-footer">
          <span className="weekly-summary">
            Week Progress: {practiceStatuses.filter(p => p.completedToday).length}/7 today
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