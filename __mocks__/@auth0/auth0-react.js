module.exports = {
  useAuth0: jest.fn(() => ({
    isAuthenticated: true,
    user: {
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://example.com/test.jpg',
    },
    getAccessTokenSilently: jest.fn().mockResolvedValue('test-token'),
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
  })),
  withAuthenticationRequired: jest.fn((component) => component),
}; 