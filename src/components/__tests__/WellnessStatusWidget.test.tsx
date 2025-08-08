import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WellnessStatusWidget } from '../WellnessStatusWidget';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    process.env.REACT_APP_API_SERVER_URL = 'http://localhost:3000';
  });

  it('should render loading state initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<WellnessStatusWidget />);
    expect(screen.getByText('Loading wellness status...')).toBeInTheDocument();
  });

  it('should render wellness practices when loaded', async () => {
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

    mockedAxios.get.mockResolvedValue({
      data: { data: mockPractices }
    });

    render(<WellnessStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText('Gratitude')).toBeInTheDocument();
      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText('Mindful Pause')).toBeInTheDocument(); // Meditation mapped to Mindful Pause
    });
  });

  it('should handle practice toggle', async () => {
    const mockPractices: MockPracticeInstance[] = [];
    mockedAxios.get.mockResolvedValue({
      data: { data: mockPractices }
    });
    mockedAxios.post.mockResolvedValue({
      data: { success: true }
    });

    render(<WellnessStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText('Gratitude')).toBeInTheDocument();
    });

    const gratitudeButton = screen.getByLabelText('Toggle Gratitude');
    fireEvent.click(gratitudeButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/wellness/practices',
        expect.objectContaining({
          practice: 'Gratitude'
        }),
        expect.any(Object)
      );
    });
  });

  it('should show error state when API fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    render(<WellnessStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load wellness status')).toBeInTheDocument();
    });
  });

  it('should display weekly progress', async () => {
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
        date: '2024-01-14',
        practice: 'Gratitude',
        completed: true,
        createdAt: '2024-01-14T00:00:00.000Z'
      }
    ];

    mockedAxios.get.mockResolvedValue({
      data: { data: mockPractices }
    });

    render(<WellnessStatusWidget />);

    await waitFor(() => {
      // Should show progress for Gratitude (2/7 for daily practice)
      expect(screen.getByText('2/7')).toBeInTheDocument();
    });
  });
}); 