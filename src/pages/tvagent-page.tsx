import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTVAgentV2Api, TVAgentV2Response, ConversationThread } from '../services/tvagent-v2-api';
import { useTVAgentApi, TVAgentResponse } from '../services/tvagent-api';
import { ThreadSidebar } from '../components/tvagent/ThreadSidebar';

import { useLocation, useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  message: string;
  timestamp: Date;
  data?: any;
  functionCalled?: string;
}

export const TVAgentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from location state or default values
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return location.state?.messages || [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(() => {
    return location.state?.activeThread || null;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversationTitle, setConversationTitle] = useState(() => {
    return location.state?.conversationTitle || '';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInputValue, setTitleInputValue] = useState('');
  const [titleUpdateCounter, setTitleUpdateCounter] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { 
    sendMessage: sendMessageV2, 
    getThreadMessages, 
    createNewThread, 
    switchToThread, 
    getActiveThread,
    updateThreadTitle 
  } = useTVAgentV2Api();
  
  // Fallback to V1 API
  const { sendMessage: sendMessageV1 } = useTVAgentApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadThreadMessages = useCallback(async (threadId: string) => {
    try {
      const threadMessages = await getThreadMessages(threadId);
      const chatMessages: ChatMessage[] = threadMessages.map((msg, index) => ({
        id: `${threadId}-${index}`,
        type: msg.role === 'user' ? 'user' : 'agent',
        message: msg.content,
        timestamp: new Date(msg.timestamp),
        data: msg.data,
        functionCalled: msg.functionCalled
      }));
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load thread messages:', error);
    }
  }, [getThreadMessages]);

  // Update location state when relevant state changes
  useEffect(() => {
    navigate(location.pathname, {
      replace: true,
      state: {
        messages,
        activeThread,
        conversationTitle
      }
    });
  }, [messages, activeThread, conversationTitle, navigate, location.pathname]);

  // Load active thread and conversation history on component mount
  useEffect(() => {
    // Skip loading if we already have state from navigation
    if (location.state?.messages?.length > 0 && location.state?.activeThread) {
      setIsLoadingHistory(false);
      return;
    }

    const loadActiveThread = async () => {
      try {
        const thread = await getActiveThread();
        if (thread) {
          setActiveThread(thread);
          setConversationTitle(thread.title);
          await loadThreadMessages(thread.threadId);
        } else {
          // No active thread, show welcome message
          const defaultTitle = generateDefaultTitle();
          setConversationTitle(defaultTitle);
          setMessages([{
            id: 'welcome',
            type: 'agent',
            message: "Hello! I'm your TaskVision AI assistant. How can I help you manage your tasks today?",
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Failed to load active thread:', error);
        // Show welcome message on error
        const defaultTitle = generateDefaultTitle();
        setConversationTitle(defaultTitle);
        setMessages([{
          id: 'welcome',
          type: 'agent',
          message: "Hello! I'm your TaskVision AI assistant. How can I help you manage your tasks today?",
          timestamp: new Date()
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadActiveThread();
  }, [getActiveThread, loadThreadMessages, location.state?.activeThread, location.state?.messages?.length]);

  const handleThreadSelect = async (threadId: string) => {
    try {
      setIsLoadingHistory(true);
      const thread = await switchToThread(threadId);
      setActiveThread(thread);
      setConversationTitle(thread.title);
      await loadThreadMessages(threadId);
    } catch (error) {
      console.error('Failed to switch thread:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleNewThread = async () => {
    try {
      const defaultTitle = generateDefaultTitle();
      const newThread = await createNewThread(defaultTitle);
      setActiveThread(newThread);
      setConversationTitle(defaultTitle);
      setMessages([{
        id: 'welcome-new',
        type: 'agent',
        message: "Hello! I'm your TaskVision AI assistant. How can I help you manage your tasks today?",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to create new thread:', error);
    }
  };

  const handleThreadDeleted = async () => {
    // Refresh to get the new active thread or show welcome message
    try {
      const thread = await getActiveThread();
      if (thread) {
        setActiveThread(thread);
        setConversationTitle(thread.title);
        await loadThreadMessages(thread.threadId);
      } else {
        setActiveThread(null);
        const defaultTitle = generateDefaultTitle();
        setConversationTitle(defaultTitle);
        setMessages([{
          id: 'welcome-after-delete',
          type: 'agent',
          message: "Hello! I'm your TaskVision AI assistant. How can I help you manage your tasks today?",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to refresh after thread deletion:', error);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
        textareaRef.current?.focus();
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response: TVAgentV2Response | TVAgentResponse;
      let isV2 = true;
      
      try {
        // Try V2 API first
        response = await sendMessageV2(inputMessage, activeThread?.threadId);
      } catch (v2Error) {
        console.warn('V2 API failed, falling back to V1:', v2Error);
        // Fall back to V1 API
        response = await sendMessageV1(inputMessage);
        isV2 = false;
      }
      
      // Update active thread if using V2 and a new one was created
      if (isV2 && 'thread' in response && response.thread && (!activeThread || response.thread.threadId !== activeThread.threadId)) {
        setActiveThread(response.thread);
      }
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: response.message,
        timestamp: new Date(),
        data: response.data,
        functionCalled: response.functionCalled || (isV2 ? undefined : 'v1-fallback')
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTaskData = (data: any) => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return (
        <div className="tvagent-task-list">
          <h4>Tasks ({data.length}):</h4>
          {data.map((task, index) => (
            <div key={index} className="tvagent-task-item">
              <div className="tvagent-task-title">{task.title}</div>
              <div className="tvagent-task-details">
                <span className={`tvagent-task-status status-${task.status?.toLowerCase()}`}>
                  {task.status}
                </span>
                {task.dueDate && (
                  <span className="tvagent-task-due">Due: {task.dueDate}</span>
                )}
                {task.priority && (
                  <span className="tvagent-task-priority">Priority: {task.priority}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (data.TaskId) {
      return (
        <div className="tvagent-task-single">
          <div className="tvagent-task-title">{data.title}</div>
          <div className="tvagent-task-details">
            <span className={`tvagent-task-status status-${data.status?.toLowerCase()}`}>
              {data.status}
            </span>
            {data.dueDate && (
              <span className="tvagent-task-due">Due: {data.dueDate}</span>
            )}
            <span className="tvagent-task-id">ID: {data.TaskId}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Helper function to generate default conversation title with timestamp
  const generateDefaultTitle = () => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Conversation ${date} ${time}`;
  };

  // Handle title editing
  const handleTitleEdit = () => {
    setTitleInputValue(conversationTitle);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!activeThread || !titleInputValue.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const updatedThread = await updateThreadTitle(activeThread.threadId, titleInputValue.trim());
      setActiveThread(updatedThread);
      setConversationTitle(titleInputValue.trim());
      setIsEditingTitle(false);
      setTitleUpdateCounter(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update conversation title:', error);
      // Revert to original title on error
      setTitleInputValue(conversationTitle);
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleInputValue(conversationTitle);
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="tvagent-page">
        <div className="tvagent-loading">
          <div className="tvagent-typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Loading conversation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tvagent-page">
      <div className="tvagent-layout">
        <ThreadSidebar
          activeThreadId={activeThread?.threadId}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
          onThreadDeleted={handleThreadDeleted}
          refreshTrigger={titleUpdateCounter}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="tvagent-main-content">
          <div className="tvagent-chat-container">
            {/* Conversation Title */}
            <div className="tvagent-conversation-header">
              {isEditingTitle ? (
                <div className="tvagent-title-editor">
                  <input
                    type="text"
                    value={titleInputValue}
                    onChange={(e) => setTitleInputValue(e.target.value)}
                    onKeyDown={handleTitleKeyPress}
                    onBlur={handleTitleSave}
                    className="tvagent-title-input"
                    autoFocus
                    maxLength={100}
                  />
                  <div className="tvagent-title-editor-buttons">
                    <button
                      onClick={handleTitleSave}
                      className="tvagent-title-save-btn"
                      title="Save title"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleTitleCancel}
                      className="tvagent-title-cancel-btn"
                      title="Cancel"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ) : (
                <div className="tvagent-title-display">
                  <h2 
                    className="tvagent-conversation-title"
                    onClick={handleTitleEdit}
                    title="Click to edit conversation title"
                  >
                    {conversationTitle}
                  </h2>
                  <button
                    onClick={handleTitleEdit}
                    className="tvagent-title-edit-btn"
                    title="Edit conversation title"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <div className="tvagent-messages">
              {messages.map((message) => (
                <div key={message.id} className={`tvagent-message tvagent-message--${message.type}`}>
                  <div className="tvagent-message-header">
                    <div className="tvagent-message-sender">
                      {message.type === 'user' ? (
                        <div className="tvagent-sender-info">
                          <span className="tvagent-sender-name">You</span>
                        </div>
                      ) : (
                        <div className="tvagent-sender-info">
                          <span className="tvagent-sender-name">TVAgent</span>
                        </div>
                      )}
                    </div>
                    <div className="tvagent-message-time">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                  <div className="tvagent-message-content">
                    <div className="tvagent-message-text">{message.message}</div>
                    {message.data && renderTaskData(message.data)}
                    {message.functionCalled && (
                      <div className="tvagent-function-indicator">
                        <small>🔧 Function used: {message.functionCalled}</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="tvagent-message tvagent-message--agent">
                  <div className="tvagent-message-header">
                    <div className="tvagent-message-sender">
                      <div className="tvagent-sender-info">
                        <span className="tvagent-sender-name">TVAgent</span>
                      </div>
                    </div>
                  </div>
                  <div className="tvagent-message-content">
                    <div className="tvagent-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="tvagent-input-container">
              <div className="tvagent-input-wrapper">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="How can I help you with your tasks today? (Type or click the mic to speak)"
                  className="tvagent-input"
                  rows={7}
                  disabled={isLoading}
                />
                {speechSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading}
                    className={`tvagent-voice-button ${isListening ? 'listening' : ''}`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    🎤
                  </button>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="tvagent-send-button"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 