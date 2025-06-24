import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useMemo } from 'react';

const API_SERVER_URL = process.env.REACT_APP_API_SERVER_URL;

export interface TVAgentV2Response {
  success: boolean;
  message: string;
  data?: any;
  functionCalled?: string;
  parameters?: any;
  thread?: ConversationThread;
}

export interface ConversationThread {
  threadId: string;
  openaiThreadId: string;
  title: string;
  lastMessage?: string;
  lastActivity: string;
  messageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  messageId: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  functionCalled?: string;
  parameters?: any;
  data?: any;
}

export const useTVAgentV2Api = () => {
  const { getAccessTokenSilently } = useAuth0();

  const authenticatedRequest = useCallback(
    async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: unknown) => {
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
    async (message: string, threadId?: string): Promise<TVAgentV2Response> => {
      return authenticatedRequest('POST', 'api/tvagent/v2/message', { message, threadId });
    },
    [authenticatedRequest]
  );

  const getThreads = useCallback(
    async (limit?: number): Promise<ConversationThread[]> => {
      const result = await authenticatedRequest('GET', `api/tvagent/v2/threads${limit ? `?limit=${limit}` : ''}`);
      return result.data || [];
    },
    [authenticatedRequest]
  );

  const getThreadMessages = useCallback(
    async (threadId: string, limit?: number): Promise<ConversationMessage[]> => {
      const result = await authenticatedRequest('GET', `api/tvagent/v2/threads/${threadId}/messages${limit ? `?limit=${limit}` : ''}`);
      return result.data || [];
    },
    [authenticatedRequest]
  );

  const createNewThread = useCallback(
    async (title?: string): Promise<ConversationThread> => {
      const result = await authenticatedRequest('POST', 'api/tvagent/v2/threads', { title });
      return result.data;
    },
    [authenticatedRequest]
  );

  const switchToThread = useCallback(
    async (threadId: string): Promise<ConversationThread> => {
      const result = await authenticatedRequest('PUT', `api/tvagent/v2/threads/${threadId}/switch`);
      return result.data;
    },
    [authenticatedRequest]
  );

  const getActiveThread = useCallback(
    async (): Promise<ConversationThread | null> => {
      const result = await authenticatedRequest('GET', 'api/tvagent/v2/active-thread');
      return result.data;
    },
    [authenticatedRequest]
  );

  const deleteThread = useCallback(
    async (threadId: string): Promise<void> => {
      await authenticatedRequest('DELETE', `api/tvagent/v2/threads/${threadId}`);
    },
    [authenticatedRequest]
  );

  const updateThreadTitle = useCallback(
    async (threadId: string, title: string): Promise<ConversationThread> => {
      const result = await authenticatedRequest('PUT', `api/tvagent/v2/threads/${threadId}/title`, { title });
      return result.data;
    },
    [authenticatedRequest]
  );

  return useMemo(
    () => ({
      sendMessage,
      getThreads,
      getThreadMessages,
      createNewThread,
      switchToThread,
      getActiveThread,
      deleteThread,
      updateThreadTitle
    }),
    [sendMessage, getThreads, getThreadMessages, createNewThread, switchToThread, getActiveThread, deleteThread, updateThreadTitle]
  );
}; 