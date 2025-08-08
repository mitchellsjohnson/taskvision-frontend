export interface Task {
  TaskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  tags?: string[];
  status: 'Open' | 'Completed' | 'Canceled' | 'Waiting';
  creationDate: string;
  modifiedDate: string;
  completedDate: string | null;
  UserId: string;
  isMIT: boolean;
  priority: number;
  position?: number;
}

// Wellness Module Types
export type WellnessPractice = 
  | 'Gratitude'
  | 'Meditation' 
  | 'Kindness'
  | 'Social Outreach'
  | 'Novelty Challenge'
  | 'Savoring Reflection'
  | 'Exercise';

export interface PracticeInstance {
  id: string;
  userId: string;
  date: string; // ISO date (YYYY-MM-DD)
  practice: WellnessPractice;
  completed: boolean;
  linkedTaskId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface WeeklyWellnessScore {
  userId: string;
  weekStart: string; // ISO date (Monday of the week)
  score: number; // 0-100
  breakdown: Record<WellnessPractice, number>;
  createdAt: string;
  updatedAt: string;
}

export interface UserWellnessSettings {
  userId: string;
  wellnessCheckAwareTVAgent: boolean;
  lastWellnessNudge?: string; // ISO date
  preferredPractices?: WellnessPractice[];
  createdAt: string;
  updatedAt: string;
}

export interface WellnessStatus {
  weekStart: string;
  currentScore: number;
  practiceStatus: Record<WellnessPractice, { completed: number; target: number }>;
  incompletePractices: WellnessPractice[];
  totalPractices: number;
  completedPractices: number;
}

// API Input Types
export interface CreatePracticeInstanceInput {
  date: string;
  practice: WellnessPractice;
  linkedTaskId?: string;
}

export interface UpdatePracticeInstanceInput {
  completed?: boolean;
  linkedTaskId?: string;
}
