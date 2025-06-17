import React from 'react';

export const useAuth0 = jest.fn(() => ({
  isAuthenticated: true,
  user: {
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/test.jpg',
  },
  logout: jest.fn(),
  loginWithRedirect: jest.fn(),
  getAccessTokenSilently: jest.fn().mockResolvedValue('test_token'),
  getAccessTokenWithPopup: jest.fn(),
  getIdTokenClaims: jest.fn(),
  loginWithPopup: jest.fn(),
  isLoading: false,
  error: null,
})); 