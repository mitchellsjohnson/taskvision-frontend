module.exports = {
  preset: 'react-scripts',
  
  // Run tests sequentially to avoid memory issues
  maxWorkers: 1,
  
  // Increase timeout
  testTimeout: 10000,
  
  // Bail after first failure to save time during development
  bail: false,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: false,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Transform node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(axios|lucide-react)/)'
  ],
  
  // Module name mapper
  moduleNameMapper: {
    '^axios$': 'axios/dist/node/axios.cjs'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Coverage (optional)
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Globals
  globals: {
    'NODE_ENV': 'test'
  }
};

