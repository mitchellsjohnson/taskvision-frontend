import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WellnessStatusWidget } from '../WellnessStatusWidget';
import { useWellnessApi } from '../../services/wellness-api';

// Mock useWellnessApi hook
const mockGetPracticeInstances = jest.fn();
const mockGetWeeklyScores = jest.fn();
const mockUpdatePracticeInstance = jest.fn();

jest.mock('../../services/wellness-api', () => ({
  useWellnessApi: jest.fn(() => ({
    getPracticeInstances: mockGetPracticeInstances,
    getWeeklyScores: mockGetWeeklyScores,
    updatePracticeInstance: mockUpdatePracticeInstance,
    createPracticeInstance: jest.fn(),
  })),
}));

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
  }),
}));

interface MockPracticeInstance {
  id: string;
  userId: string;
  date: string;
  practice: string;
  completed: boolean;
  createdAt: string;
}

describe('WellnessStatusWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock implementations
    mockGetPracticeInstances.mockResolvedValue([]);
    mockGetWeeklyScores.mockResolvedValue([]);
  });

  it('should render loading state initially', () => {
    mockGetPracticeInstances.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<WellnessStatusWidget />);
    expect(screen.getByText('Loading wellness status...')).toBeInTheDocument();
  });

  it('should display practices when loaded', async () => {
    const mockPractices: MockPracticeInstance[] = [
      {
        id: '1',
        userId: 'user1',
        date: '2024-01-15',
        practice: 'Gratitude',
        completed: true,
        createdAt: '2024-01-15T00:00:00.000Z'
      },
      {
        id: '2',
        userId: 'user1',
        date: '2024-01-15',
        practice: 'Exercise',
        completed: false,
        createdAt: '2024-01-15T00:00:00.000Z'
      }
    ];

    const mockWeeklyScores = [
      {
        weekStart: '2024-01-15',
        score: 85,
        createdAt: '2024-01-15T00:00:00.000Z'
      }
    ];

    mockGetPracticeInstances.mockResolvedValue(mockPractices);
    mockGetWeeklyScores.mockResolvedValue(mockWeeklyScores);

    render(<WellnessStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText('Gratitude')).toBeInTheDocument();
      expect(screen.getByText('Exercise')).toBeInTheDocument();
    });
  });

  it('should handle practice toggle', async () => {
    const user = userEvent.setup();
    const mockPractices: MockPracticeInstance[] = [
      {
        id: '1',
        userId: 'user1',
        date: new Date().toISOString().split('T')[0],
        practice: 'Gratitude',
        completed: false,
        createdAt: '2024-01-15T00:00:00.000Z'
      },
    ];
    mockGetPracticeInstances.mockResolvedValue(mockPractices);
    mockGetWeeklyScores.mockResolvedValue([]);

    render(<WellnessStatusWidget />);

    const gratitudeCheckbox = await screen.findByLabelText(/toggle gratitude/i);
    expect(gratitudeCheckbox).not.toBeChecked();

    await user.click(gratitudeCheckbox);

    expect(mockUpdatePracticeInstance).toHaveBeenCalledWith(
      expect.any(String),
      'Gratitude',
      { completed: true }
    );
  });

  it('should show error state when API fails', async () => {
    mockGetPracticeInstances.mockRejectedValue(new Error('API Error'));
    mockGetWeeklyScores.mockRejectedValue(new Error('API Error'));
    
    render(<WellnessStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load wellness status')).toBeInTheDocument();
    });
  });

  it('should display weekly score when available', async () => {
    const mockWeeklyScores = [
      {
        weekStart: '2024-01-15',
        score: 75,
        createdAt: '2024-01-15T00:00:00.000Z'
      }
    ];

    mockGetPracticeInstances.mockResolvedValue([]);
    mockGetWeeklyScores.mockResolvedValue(mockWeeklyScores);

    render(<WellnessStatusWidget />);

    await waitFor(() => {
      // Look for the score in the format it's actually displayed
      expect(screen.getByText('75', { exact: false })).toBeInTheDocument();
    });
  });
}); 