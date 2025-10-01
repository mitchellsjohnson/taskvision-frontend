// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.dispatchEvent to prevent event-related hangs  
beforeEach(() => {
  jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
});

afterEach(() => {
  // Clean up all mocks
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

// Mock Auth0 with more complete mock
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
    user: null,
    isLoading: false,
    getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token')
  }),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

// Mock all API services to prevent real network calls
jest.mock('./services/task-api', () => ({
  getTasks: jest.fn().mockResolvedValue([]),
  createTask: jest.fn().mockResolvedValue({ id: '1', title: 'Test Task' }),
  updateTask: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Task' }),
  deleteTask: jest.fn().mockResolvedValue(undefined),
  getProductivityMetrics: jest.fn().mockResolvedValue({
    completedTasks: 5,
    createdTasks: 10,
    finalScore: 50
  }),
  getRecentActivity: jest.fn().mockResolvedValue([]),
  getUpcomingTasks: jest.fn().mockResolvedValue([]),
  useTaskApi: () => ({
    getTasks: jest.fn().mockResolvedValue([]),
    createTask: jest.fn().mockResolvedValue({ id: '1', title: 'Test Task' }),
    updateTask: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Task' }),
    deleteTask: jest.fn().mockResolvedValue(undefined),
    getProductivityMetrics: jest.fn().mockResolvedValue({
      completedTasks: 5,
      createdTasks: 10,
      finalScore: 50
    }),
    getRecentActivity: jest.fn().mockResolvedValue([]),
    getUpcomingTasks: jest.fn().mockResolvedValue([])
  })
}));

jest.mock('./services/user-settings-api', () => ({
  getUserSettings: jest.fn().mockResolvedValue({}),
  updateUserSettings: jest.fn().mockResolvedValue({})
}));

jest.mock('./services/wellness-api', () => ({
  getWellnessData: jest.fn().mockResolvedValue([]),
  updateWellnessData: jest.fn().mockResolvedValue({}),
  useWellnessApi: () => ({
    getWeeklyScores: jest.fn().mockResolvedValue([]),
    createPracticeInstance: jest.fn().mockResolvedValue({}),
    updatePracticeInstance: jest.fn().mockResolvedValue({}),
    getPracticeInstances: jest.fn().mockResolvedValue([])
  })
}));

jest.mock('./services/tvagent-api', () => ({
  sendMessage: jest.fn().mockResolvedValue({ response: 'Mock response' })
}));

jest.mock('./services/tvagent-v2-api', () => ({
  sendMessage: jest.fn().mockResolvedValue({ response: 'Mock response' })
}));

// Set test environment variables to disable retry logic
process.env.NODE_ENV = 'test';
process.env.REACT_APP_DISABLE_RETRIES = 'true';

// Mock axios to catch any unmocked API calls
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} })
}));
