import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TagInput } from './TagInput';
import { CharacterCounter } from './CharacterCounter';
import { Task } from '../types';
import { TASK_LIMITS, validateTaskField } from '../constants/validation';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  allTags: string[];
  mitTaskCount?: number;
  litTaskCount?: number;
  defaultValues?: Partial<Task>;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onSave, 
  allTags,
  mitTaskCount = 0,
  litTaskCount = 0,
  defaultValues 
}) => {
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [selectedList, setSelectedList] = useState<'MIT' | 'LIT'>('MIT');
  const [priorityNumber, setPriorityNumber] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.classList.add('modal-open');
      
      if (task) {
        // Editing existing task - use current values
        setCurrentTask({
          ...task,
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split('T')[0]
            : '',
        });
        setSelectedList(task.isMIT ? 'MIT' : 'LIT');
        setPriorityNumber(task.priority || 1);
      } else {
        // Creating new task - default to MIT priority 1, merge with default values
        const baseTask: Partial<Task> = {
          title: '',
          description: '',
          status: 'Open' as const,
          dueDate: '',
          isMIT: true,
          priority: 1,
          tags: [],
        };
        
        const newTask = { ...baseTask, ...defaultValues };
        
        // Format due date if provided - should already be in YYYY-MM-DD format from wellness module
        if (newTask.dueDate && typeof newTask.dueDate === 'string') {
          // If it's already in YYYY-MM-DD format, keep it as is
          if (/^\d{4}-\d{2}-\d{2}$/.test(newTask.dueDate)) {
            // Already in correct format, no conversion needed
          } else {
            // Convert other string formats to YYYY-MM-DD
            try {
              const date = new Date(newTask.dueDate);
              if (!isNaN(date.getTime())) {
                newTask.dueDate = date.toISOString().split('T')[0];
              }
            } catch {
              // Keep original value if parsing fails
            }
          }
        }
        
        setCurrentTask(newTask);
        setSelectedList(newTask.isMIT ? 'MIT' : 'LIT');
        setPriorityNumber(newTask.priority || 1);
      }
    } else {
      // Remove body scroll prevention when modal closes
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup function to ensure body scroll is restored
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [task, isOpen, defaultValues]);

  const handleSave = () => {
    // Validate field lengths
    const titleValidation = validateTaskField('title', currentTask.title || '');
    const descriptionValidation = validateTaskField('description', currentTask.description || '');
    
    if (titleValidation.isOverLimit || descriptionValidation.isOverLimit) {
      return; // Don't save if over limit
    }

    // Prepare task data with list and priority
    const taskData = {
      ...currentTask,
      isMIT: selectedList === 'MIT',
      priority: priorityNumber,
    };

    onSave(taskData);
    onClose(); 
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setCurrentTask(prev => ({ ...prev, tags: newTags }));
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentTask(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (list: 'MIT' | 'LIT') => {
    setSelectedList(list);
    // Reset priority to 1 when switching lists
    setPriorityNumber(1);
  };

  const handlePriorityChange = (priority: number) => {
    // Ensure priority is at least 1
    const validPriority = Math.max(1, priority);
    setPriorityNumber(validPriority);
  };

  // Calculate max priority for current list
  const maxPriority = selectedList === 'MIT' ? 3 : Math.max(10, litTaskCount + 1);

  // Don't render modal if not open
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={handleOutsideClick}>
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
        {/* Editable Fields */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              name="title"
              value={currentTask.title || ''}
              onChange={handleChange}
              maxLength={TASK_LIMITS.TITLE_MAX_LENGTH}
              className="w-full text-2xl font-bold bg-transparent text-white focus:outline-none focus:border-b-2 border-gray-600"
              placeholder="Task Title"
            />
            <CharacterCounter
              current={(currentTask.title || '').length}
              max={TASK_LIMITS.TITLE_MAX_LENGTH}
              className="mt-1"
            />
          </div>
          <div>
            <textarea
              name="description"
              value={currentTask.description || ''}
              onChange={handleChange}
              maxLength={TASK_LIMITS.DESCRIPTION_MAX_LENGTH}
              rows={5}
              className="w-full bg-gray-900/50 text-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add task details..."
            />
            <CharacterCounter
              current={(currentTask.description || '').length}
              max={TASK_LIMITS.DESCRIPTION_MAX_LENGTH}
              className="mt-1"
            />
          </div>

          {/* Priority Control */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
            <div className="space-y-3">
              {/* List Selector */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleListChange('MIT')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedList === 'MIT'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  MIT ({mitTaskCount}/3)
                </button>
                <button
                  type="button"
                  onClick={() => handleListChange('LIT')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedList === 'LIT'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  LIT ({litTaskCount})
                </button>
              </div>

              {/* Priority Number */}
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  Priority in {selectedList} list (1 = highest):
                </div>
                <input
                  type="number"
                  min="1"
                  max={maxPriority}
                  value={priorityNumber}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    handlePriorityChange(value);
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const clampedValue = Math.max(1, Math.min(value, maxPriority));
                    handlePriorityChange(clampedValue);
                  }}
                  className="w-20 bg-gray-700 text-white rounded p-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {selectedList === 'MIT' ? 'MIT max: 3' : 'LIT: any number'}
                </div>
                {selectedList === 'MIT' && mitTaskCount >= 3 && priorityNumber <= 3 && (!task || !task.isMIT) && (
                  <div className="text-xs text-yellow-400 mt-1">
                    ⚠️ MIT is full. Adding here will move the lowest MIT task to LIT.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-400">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={currentTask.dueDate || ''}
                onChange={handleChange}
                className="bg-gray-700 text-white rounded p-2"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-400">Status</label>
              <select
                name="status"
                id="status"
                value={currentTask.status || 'Open'}
                onChange={handleChange}
                className="bg-gray-700 text-white rounded p-2"
              >
                <option value="Open">Open</option>
                <option value="Waiting">Waiting</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </div>
          {/* Tag Input */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
            <TagInput tags={currentTask.tags || []} onTagsChange={handleTagsChange} className="bg-gray-700" />
          </div>
        </div>

        {/* Non-Editable Metadata */}
        {task && (
          <div className="border-t border-gray-700 mt-6 pt-4 text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-2">
            <p>
              Creation Date:{' '}
              {task.creationDate ? new Date(task.creationDate).toLocaleString() : 'N/A'}
            </p>
            <p>Created By: {task.UserId}</p>
            <p>
              Modified Date:{' '}
              {task.modifiedDate ? new Date(task.modifiedDate).toLocaleString() : 'N/A'}
            </p>
            <p>Modified By: (from audit log)</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={
              validateTaskField('title', currentTask.title || '').isOverLimit ||
              validateTaskField('description', currentTask.description || '').isOverLimit ||
              !(currentTask.title || '').trim()
            }
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
