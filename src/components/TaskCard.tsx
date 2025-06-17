import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { RESERVED_TAGS } from '../constants/tags';
import { ArrowControls } from './ArrowControls';
import { Tooltip } from './Tooltip';

export interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTagClick?: (tag: string) => void;
  isOverlay?: boolean;
  isMoveIndicatorActive?: boolean;
  lastDroppedId?: string | null;
  onOpenEditModal?: (task: Task) => void;
  isDragSessionActive?: boolean;
  onMove?: (taskId: string, targetListId: 'MIT' | 'LIT', targetIndex: number) => void;
  listId?: 'MIT' | 'LIT';
  index?: number;
  mitListLength?: number;
  litListLength?: number;
  onEdit?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDelete,
  onUpdate,
  onTagClick,
  isOverlay = false,
  isMoveIndicatorActive = false,
  lastDroppedId,
  onOpenEditModal,
  isDragSessionActive = false,
  onMove,
  listId,
  index,
  mitListLength,
  litListLength,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
    }
  }, [isEditing, task.title, task.description]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.TaskId,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const isBeingDragged = isDragging && !isOverlay;
  const isDropTarget = lastDroppedId === task.TaskId;

  const getBaseClasses = () => 'p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 ease-in-out transform relative';

  const getCardStyleClasses = () => {
    if (isOverlay) {
      return isMoveIndicatorActive ? 'bg-blue-500/10 border-blue-500' : 'bg-white/10 border-gray-500';
    }
    return `
      ${!isDragSessionActive ? 'hover:shadow-lg hover:scale-105' : ''}
      ${isBeingDragged ? 'opacity-50' : 'opacity-100'}
      ${isDropTarget ? 'flash-animation' : ''}
      border-gray-500 bg-gray-800
    `;
  };
  
  const cardClasses = `${getBaseClasses()} ${getCardStyleClasses()}`;

  const handleSave = () => {
    onUpdate(task.TaskId, { title: editedTitle, description: editedDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handlePencilClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenEditModal) {
      onOpenEditModal(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={task.TaskId}
      className={cardClasses}
    >
      <div className="relative z-10 flex items-start space-x-4">
        {/* Drag Handle and Priority */}
        <div {...attributes} {...listeners} className="flex-shrink-0 text-gray-500 cursor-grab touch-none">
          <div className="flex flex-col items-center justify-center pt-1 text-gray-400">
            <span className="font-bold text-lg">{task.priority}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
        </div>

        {/* Task Content */}
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-gray-700 text-4xl font-bold text-white rounded-md p-1 -m-1 w-full"
                  autoFocus
                />
              ) : (
                <h3 className="text-4xl font-bold text-white" onClick={handleEditClick}>{task.title}</h3>
              )}
              {getTaskStatusDetails(task).icon && !isEditing && <div className="text-lg">{getTaskStatusDetails(task).icon}</div>}
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                    title="Save Changes"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Cancel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Tooltip text="Edit Task">
                    <button
                      onClick={handlePencilClick}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      data-testid="edit-task-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Mark as Completed">
                    <button
                      onClick={() => onUpdate(task.TaskId, { status: 'Completed' })}
                      className="text-gray-400 hover:text-green-400 transition-colors"
                      data-testid="complete-task-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Cancel Task">
                    <button
                      onClick={() => onUpdate(task.TaskId, { status: 'Canceled' })}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      data-testid="cancel-task-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          {isEditing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="bg-gray-700 text-gray-300 mb-4 text-lg rounded-md p-1 -m-1 w-full"
              rows={3}
            />
          ) : (
            task.description && <p className="text-gray-300 mb-4 text-lg" onClick={handleEditClick}>{task.description}</p>
          )}
          <div className="flex justify-between items-end text-sm text-gray-400">
            <div className="flex flex-col items-start">
              {task.dueDate && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}
                  </span>
                </div>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => onTagClick && onTagClick(tag)}
                      disabled={!onTagClick || isOverlay}
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getTagColor(
                        tag
                      )} ${
                        onTagClick && !isOverlay
                          ? 'cursor-pointer hover:opacity-80 transition-opacity'
                          : 'cursor-default'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center">
              {onMove && listId && index !== undefined && mitListLength !== undefined && litListLength !== undefined && (
                <ArrowControls
                  taskId={task.TaskId}
                  listId={listId}
                  index={index}
                  mitListLength={mitListLength}
                  litListLength={litListLength}
                  onMove={onMove}
                />
              )}
              <span className={`px-2 py-1 rounded self-end ${getTaskStatusDetails(task).badgeClass}`}>
                {task.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getTaskStatusDetails = (task: Task) => {
  const { status, dueDate } = task;

  const badgeClasses: { [key in Task['status']]: string } = {
    Completed: 'bg-green-900 text-green-300',
    Waiting: 'bg-yellow-900 text-yellow-300',
    Canceled: 'bg-gray-800 text-gray-400 border border-gray-600',
    Open: 'bg-blue-900 text-blue-300',
  };
  const badgeClass = badgeClasses[status] || badgeClasses['Open'];

  let icon = null;
  if (status === 'Completed') {
    icon = <span title="Completed">✅</span>;
  } else if (dueDate) {
    const today = new Date();
    const date = new Date(dueDate + 'T00:00:00');
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date < today) {
      icon = <span title="Overdue">⚠️</span>;
    } else if (date.getTime() === today.getTime()) {
      icon = <span title="Due today">📅</span>;
    }
  }

  return { icon, badgeClass };
};

export const getTagColor = (tag: string) => {
  const lowerCaseTag = tag.toLowerCase().trim();
  
  const reservedTag = RESERVED_TAGS.find(t => t.name === lowerCaseTag);
  
  if (reservedTag) {
    return `${reservedTag.bg} ${reservedTag.text}`;
  }

  // Default style for custom tags
  return 'bg-white/10 text-gray-200 border border-white/20';
};