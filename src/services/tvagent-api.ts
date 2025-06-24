import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useMemo } from 'react';

const API_SERVER_URL = process.env.REACT_APP_API_SERVER_URL;

export interface TVAgentResponse {
  success: boolean;
  message: string;
  data?: any;
  functionCalled?: string;
  parameters?: any;
}

export interface TVAgentRequest {
  message: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export const useTVAgentApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const authenticatedRequest = useCallback(
    async (method: 'GET' | 'POST', endpoint: string, body?: unknown) => {
      const accessToken = await getAccessTokenSilently();
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: body ? JSON.stringify(body) : undefined
      };

      const response = await fetch(`${API_SERVER_URL}/${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || `API request failed: ${response.statusText}`);
      }

      return response.json();
    },
    [getAccessTokenSilently]
  );

  const sendMessage = useCallback(
    async (message: string): Promise<TVAgentResponse> => {
      return authenticatedRequest('POST', 'api/tvagent', { message });
    },
    [authenticatedRequest]
  );

  const getConversationHistory = useCallback(
    async (): Promise<{ conversation: ConversationMessage[] }> => {
      return authenticatedRequest('GET', 'api/tvagent/conversation');
    },
    [authenticatedRequest]
  );

  return useMemo(
    () => ({
      sendMessage,
      getConversationHistory
    }),
    [sendMessage, getConversationHistory]
  );
}; 