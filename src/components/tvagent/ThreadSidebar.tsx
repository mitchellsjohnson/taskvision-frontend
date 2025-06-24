import React, { useState, useEffect, useCallback } from 'react';
import { useTVAgentV2Api } from '../../services/tvagent-v2-api';

export interface ConversationThread {
  threadId: string;
  title: string;
  lastMessage?: string;
  lastActivity: string;
  messageCount: number;
  isActive: boolean;
}

interface ThreadSidebarProps {
  activeThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  onThreadDeleted?: () => void;
  refreshTrigger?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  threadTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  threadTitle,
  onConfirm,
  onCancel,
  isDeleting
}) => {
  if (!isOpen) return null;

  return (
    <div className="tvagent-modal-overlay" onClick={onCancel}>
      <div className="tvagent-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tvagent-modal-header">
          <h3>Delete Conversation</h3>
          <button className="tvagent-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="tvagent-modal-body">
          <p>Are you sure you want to delete the conversation:</p>
          <p className="tvagent-modal-thread-title">"{threadTitle}"</p>
          <p className="tvagent-modal-warning">This action cannot be undone.</p>
        </div>
        <div className="tvagent-modal-footer">
          <button 
            className="tvagent-modal-button tvagent-modal-button--cancel" 
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="tvagent-modal-button tvagent-modal-button--delete" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="tvagent-modal-spinner">⏳</span>
                Deleting...
              </>
            ) : (
              'Delete Conversation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ThreadSidebar: React.FC<ThreadSidebarProps> = ({
  activeThreadId,
  onThreadSelect,
  onNewThread,
  onThreadDeleted,
  refreshTrigger,
  isCollapsed,
  onToggleCollapse
}) => {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<ConversationThread | null>(null);
  const { getThreads, deleteThread } = useTVAgentV2Api();

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true);
      const threadList = await getThreads();
      setThreads(threadList);
    } catch (error) {
      console.error('Failed to load threads:', error);
      // Set empty threads array on error so sidebar still shows
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [getThreads]);

  const handleDeleteClick = useCallback((thread: ConversationThread, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent thread selection
    setThreadToDelete(thread);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!threadToDelete) return;

    try {
      setDeletingThreadId(threadToDelete.threadId);
      await deleteThread(threadToDelete.threadId);
      
      // Remove the thread from local state
      setThreads(prev => prev.filter(t => t.threadId !== threadToDelete.threadId));
      
      // Close modal
      setDeleteModalOpen(false);
      setThreadToDelete(null);
      
      // Notify parent component
      if (onThreadDeleted) {
        onThreadDeleted();
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
      // You could add a toast notification here instead of alert
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingThreadId(null);
    }
  }, [threadToDelete, deleteThread, onThreadDeleted]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setThreadToDelete(null);
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Refresh threads when title is updated
  useEffect(() => {
    if (refreshTrigger) {
      loadThreads();
    }
  }, [refreshTrigger, loadThreads]);

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isCollapsed) {
    return (
      <div className="tvagent-sidebar tvagent-sidebar--collapsed">
        <button
          className="tvagent-sidebar-toggle"
          onClick={onToggleCollapse}
          title="Expand sidebar"
        >
          <span className="tvagent-sidebar-toggle-icon">→</span>
        </button>
        <button
          className="tvagent-new-thread-btn tvagent-new-thread-btn--collapsed"
          onClick={onNewThread}
          title="New conversation"
        >
          <span className="tvagent-new-thread-icon">+</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="tvagent-sidebar">
        <div className="tvagent-sidebar-header">
          <button
            className="tvagent-sidebar-toggle"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
          >
            <span className="tvagent-sidebar-toggle-icon">←</span>
          </button>
          <button
            className="tvagent-new-thread-btn"
            onClick={onNewThread}
          >
            <span className="tvagent-new-thread-icon">+</span>
            <span className="tvagent-new-thread-text">New conversation</span>
          </button>
        </div>

        <div className="tvagent-sidebar-content">
          {loading ? (
            <div className="tvagent-sidebar-loading">
              <div className="tvagent-loading-spinner"></div>
              <span>Loading conversations...</span>
            </div>
          ) : threads.length === 0 ? (
            <div className="tvagent-sidebar-empty">
              <p>No conversations yet</p>
              <p>Start a new conversation to get started!</p>
            </div>
          ) : (
            <div className="tvagent-thread-list">
              {threads.map((thread) => (
                <div
                  key={thread.threadId}
                  className={`tvagent-thread-item ${
                    thread.threadId === activeThreadId ? 'tvagent-thread-item--active' : ''
                  }`}
                >
                  <button
                    className="tvagent-thread-content"
                    onClick={() => onThreadSelect(thread.threadId)}
                    disabled={deletingThreadId === thread.threadId}
                  >
                    <div className="tvagent-thread-title">
                      {thread.title}
                    </div>
                    {thread.lastMessage && (
                      <div className="tvagent-thread-preview">
                        {thread.lastMessage}
                      </div>
                    )}
                    <div className="tvagent-thread-meta">
                      <span className="tvagent-thread-time">
                        {formatLastActivity(thread.lastActivity)}
                      </span>
                      <span className="tvagent-thread-count">
                        {thread.messageCount} messages
                      </span>
                    </div>
                  </button>
                  <button
                    className="tvagent-thread-delete"
                    onClick={(e) => handleDeleteClick(thread, e)}
                    disabled={deletingThreadId === thread.threadId}
                    title="Delete conversation"
                  >
                    {deletingThreadId === thread.threadId ? (
                      <span className="tvagent-delete-spinner">⏳</span>
                    ) : (
                      <span className="tvagent-delete-icon">🗑️</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tvagent-sidebar-footer">
          <div className="tvagent-sidebar-user">
            <div className="tvagent-user-avatar">👤</div>
            <div className="tvagent-user-info">
              <div className="tvagent-user-name">You</div>
              <div className="tvagent-user-status">TaskVision AI Assistant</div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        threadTitle={threadToDelete?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deletingThreadId !== null}
      />
    </>
  );
}; 