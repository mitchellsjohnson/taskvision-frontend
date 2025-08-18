import React, { useState, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Task } from '../types';
import { RESERVED_TAGS, DEFAULT_TAGS } from '../constants/tags';
import { Tooltip } from './Tooltip';
import { Tag } from './Tag';
import { ArrowControls } from './ArrowControls';
import { cn } from '../lib/utils';

export interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTagClick?: (tag: string) => void;
  isOverlay?: boolean;
  onOpenEditModal?: (task: Task) => void;
  onMove?: (taskId: string, targetListId: 'MIT' | 'LIT', targetIndex: number) => void;
  listId?: 'MIT' | 'LIT';
  index?: number;
  mitListLength?: number;
  litListLength?: number;
  flashingTasks?: Set<string>;
}

// Helper function to format date as display string
const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString();
};

// Helper function to get status color
const getStatusColor = (status: Task['status']) => {
  const statusColors: { [key in Task['status']]: string } = {
    'Open': 'text-blue-300',
    'Completed': 'text-green-300',
    'Canceled': 'text-red-300',
    'Waiting': 'text-yellow-300',
  };
  return statusColors[status] || statusColors['Open'];
};

// Helper function to get due date color and icon
const getDueDateColorAndIcon = (dueDate?: string) => {
  if (!dueDate) return { color: 'text-muted-foreground', icon: null };
  
  const today = new Date();
  const date = new Date(dueDate + 'T00:00:00');
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date < today) {
    return { 
      color: 'text-red-400', 
      icon: <span className="inline-block w-2 h-2 bg-red-400 mr-1" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></span>
    }; // Past due - red triangle
  } else if (date.getTime() === today.getTime()) {
    return { 
      color: 'text-yellow-400', 
      icon: <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
    }; // Due today - yellow circle
  }
  return { color: 'text-muted-foreground', icon: null }; // Future or no due date
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDelete,
  onUpdate,
  onTagClick,
  isOverlay = false,
  onOpenEditModal,
  onMove,
  listId,
  index,
  mitListLength,
  litListLength,
  flashingTasks,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
    }
  }, [isEditing, task.title, task.description]);

  const { setNodeRef: setDragNodeRef, isDragging, transform, attributes, listeners } = useDraggable({
    id: task.TaskId,
    data: {
      type: 'Task',
      task,
    },
  });

  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: task.TaskId,
    data: {
      type: 'Task',
      task,
    },
  });

  // Combine both refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDragNodeRef(node);
    setDropNodeRef(node);
  };

  // Apply transform for drag feedback
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {};
  
  const dueDateColor = getDueDateColorAndIcon(task.dueDate);

  const handleSave = () => {
    onUpdate(task.TaskId, { title: editedTitle, description: editedDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
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
      id={`task-${task.TaskId}`}
      className={cn(
        "bg-card rounded-lg border border-border hover:bg-accent transition-all duration-500 relative",
        {
          'shadow-lg shadow-blue-500/20': isOverlay,
          'bg-accent/50 border-blue-500/50': isDragging,
          'bg-blue-500/20 border-blue-400/50 shadow-md shadow-blue-500/30': flashingTasks?.has(task.TaskId),
        }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="task-card"
      tabIndex={0}
    >
      <div className="p-2 sm:p-3">
        {/* Mobile Layout: Vertical Stack */}
        <div className="flex flex-col sm:hidden">
          {/* Top Row: Priority, MIT/LIT badge, and drag handle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Priority number */}
              <div 
                className={cn(
                  "px-3 py-2 rounded-full text-xl font-bold border-2 flex-shrink-0 shadow-md",
                  task.isMIT 
                    ? "bg-green-600/40 text-green-100 border-green-500/70" 
                    : "bg-blue-600/40 text-blue-100 border-blue-500/70"
                )}
              >
                {task.priority}
              </div>
              
              {/* MIT/LIT indicator */}
              <span className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                task.isMIT 
                  ? "bg-green-600/20 text-green-300" 
                  : "bg-blue-600/20 text-blue-300"
              )}>
                {task.isMIT ? 'MIT' : 'LIT'}
              </span>
            </div>
            
            {/* Drag handle - moved to right on mobile */}
            <div 
              className="flex flex-col items-center justify-center py-1 cursor-grab active:cursor-grabbing px-2"
              {...attributes}
              {...listeners}
            >
              <div className="flex flex-col gap-0.5">
                <div className="w-1.5 h-0.5 bg-muted-foreground rounded-full"></div>
                <div className="w-1.5 h-0.5 bg-muted-foreground rounded-full"></div>
                <div className="w-1.5 h-0.5 bg-muted-foreground rounded-full"></div>
                <div className="w-1.5 h-0.5 bg-muted-foreground rounded-full"></div>
                <div className="w-1.5 h-0.5 bg-muted-foreground rounded-full"></div>
                <div className="w-1.5 h-0.5 bg-muted-foreground rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Task Title */}
          <div className="mb-2">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-input text-foreground p-2 rounded w-full text-lg font-bold border border-border focus:border-ring focus:outline-none"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-bold text-foreground leading-tight">{task.title}</h3>
            )}
          </div>

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <span className={`flex items-center ${dueDateColor.color}`}>
                  {dueDateColor.icon}
                  {formatDate(task.dueDate)}
                </span>
              )}
              <span className={getStatusColor(task.status)}>
                {task.status}
              </span>
            </div>
            
            {/* Expand button for details */}
            {(task.description || (task.tags && task.tags.length > 0)) && !isEditing && (
                             <button
                 onClick={(e) => {
                   e.stopPropagation();
                   setIsExpanded(!isExpanded);
                 }}
                 className="text-muted-foreground hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                 title={isExpanded ? "Hide details (mobile)" : "Show details (mobile)"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Expandable details */}
          {isExpanded && (task.description || (task.tags && task.tags.length > 0)) && (
            <div className="space-y-2 mb-3 p-3 bg-muted rounded">
              {/* Description */}
              {task.description && (
                <div>
                  {isEditing ? (
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="bg-input text-foreground p-2 rounded w-full text-sm border border-border focus:border-ring focus:outline-none resize-none"
                      rows={3}
                      placeholder="Description..."
                    />
                  ) : (
                    <p className="text-sm text-secondary-foreground">{task.description}</p>
                  )}
                </div>
              )}
              
              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
                    <Tag
                      key={index}
                      label={tag}
                      type={DEFAULT_TAGS[tag] || DEFAULT_TAGS[tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()] ? 'default' : 'custom'}
                      onClick={onTagClick && !isOverlay ? () => onTagClick(tag) : undefined}
                      className="text-xs"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons Row - Always visible on mobile for better UX */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
            {isEditing ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
                  title="Save Changes"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handlePencilClick}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  data-testid="edit-task-button-mobile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => onUpdate(task.TaskId, { status: 'Completed' })}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  data-testid="complete-task-button-mobile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Done
                </button>
                <button
                  onClick={() => onUpdate(task.TaskId, { status: 'Canceled' })}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  data-testid="cancel-task-button-mobile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Desktop Layout: Horizontal Layout (existing) */}
        <div className="hidden sm:flex items-start gap-2">
          {/* Visual Drag Handle */}
          <div 
            className="flex flex-col items-center justify-center py-1 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-1.5 h-0.5 bg-gray-400 rounded-full"></div>
              <div className="w-1.5 h-0.5 bg-gray-400 rounded-full"></div>
              <div className="w-1.5 h-0.5 bg-gray-400 rounded-full"></div>
              <div className="w-1.5 h-0.5 bg-gray-400 rounded-full"></div>
              <div className="w-1.5 h-0.5 bg-gray-400 rounded-full"></div>
              <div className="w-1.5 h-0.5 bg-gray-400 rounded-full"></div>
            </div>
          </div>

          {/* Priority number - Large and prominent */}
          <div 
            className={cn(
              "px-3 py-2 rounded-full text-xl font-bold border-2 flex-shrink-0 shadow-md",
              task.isMIT 
                ? "bg-green-600/40 text-green-100 border-green-500/70" 
                : "bg-blue-600/40 text-blue-100 border-blue-500/70"
            )}
          >
            {task.priority}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 flex items-start justify-between">
            {/* Left content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {/* Title and list indicator */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={cn(
                    "text-sm font-medium px-2 py-0.5 rounded shrink-0",
                    task.isMIT 
                      ? "bg-green-600/20 text-green-300" 
                      : "bg-blue-600/20 text-blue-300"
                  )}>
                    {task.isMIT ? 'MIT' : 'LIT'}
                  </span>
                  
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-gray-700 text-white p-1.5 rounded flex-1 text-2xl font-bold border border-gray-600 focus:border-blue-500 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-white leading-tight">{task.title}</h3>
                    )}
                    
                    {/* Expand/Collapse button for details */}
                    {(task.description || (task.tags && task.tags.length > 0)) && !isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(!isExpanded);
                        }}
                        className="text-gray-400 hover:text-white transition-colors p-2 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                        title={isExpanded ? "Hide details" : "Show details"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            
            {/* Always visible metadata - due date and status */}
            <div className="flex items-center gap-2 mb-1 text-sm text-gray-400">
              {task.dueDate && (
                <span className={`flex items-center ${dueDateColor.color}`}>
                  {dueDateColor.icon}
                  Due: {formatDate(task.dueDate)}
                </span>
              )}
              <span className={getStatusColor(task.status)}>
                {task.status}
              </span>
            </div>
            
            {/* Expandable details */}
            {isExpanded && (task.description || (task.tags && task.tags.length > 0)) && (
              <div className="space-y-1 mb-1">
                {/* Description */}
                {task.description && (
                  <div>
                    {isEditing ? (
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="bg-gray-700 text-white p-1.5 rounded w-full text-sm border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                        rows={2}
                        placeholder="Description..."
                      />
                    ) : (
                      <p className="text-sm text-secondary-foreground">{task.description}</p>
                    )}
                  </div>
                )}
                
                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                      <Tag
                        key={index}
                        label={tag}
                        type={DEFAULT_TAGS[tag] || DEFAULT_TAGS[tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()] ? 'default' : 'custom'}
                        onClick={onTagClick && !isOverlay ? () => onTagClick(tag) : undefined}
                        className="text-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            

          </div>

            {/* Action buttons - show on hover or when editing */}
            <div className={`flex items-center space-x-1.5 transition-opacity duration-200 ${isHovered || isEditing ? 'opacity-100' : 'opacity-0'}`}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="text-gray-400 hover:text-green-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Save Changes"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-red-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Cancel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  {/* Arrow Controls for manual reordering */}
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
                  
                  <Tooltip text="Edit Task">
                    <button
                      onClick={handlePencilClick}
                      className="text-gray-400 hover:text-blue-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      data-testid="edit-task-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Mark as Completed">
                    <button
                      onClick={() => onUpdate(task.TaskId, { status: 'Completed' })}
                      className="text-gray-400 hover:text-green-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      data-testid="complete-task-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Cancel Task">
                    <button
                      onClick={() => onUpdate(task.TaskId, { status: 'Canceled' })}
                      className="text-gray-400 hover:text-red-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      data-testid="cancel-task-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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