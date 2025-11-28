import React, { useState, useEffect, useCallback } from 'react';
import { TagInput } from './TagInput';
import { CharacterCounter } from './CharacterCounter';
import { Task } from '../types';
import { TASK_LIMITS, validateTaskField } from '../constants/validation';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useDoubleClickPrevention } from '../hooks/useDoubleClickPrevention';

interface EditTaskFormProps {
  task: Task | null;
  onSave: (taskData: Partial<Task>) => void;
  onCancel: () => void;
  allTags: string[];
  mitTaskCount?: number;
  litTaskCount?: number;
  defaultValues?: Partial<Task>;
}

export const EditTaskForm: React.FC<EditTaskFormProps> = ({
  task,
  onSave,
  onCancel,
  allTags,
  mitTaskCount = 0,
  litTaskCount = 0,
  defaultValues,
}) => {
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [selectedList, setSelectedList] = useState<'MIT' | 'LIT'>('MIT');
  const [priorityNumber, setPriorityNumber] = useState<number>(1);

  useEffect(() => {
    if (task) {
      setCurrentTask({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
      setSelectedList(task.isMIT ? 'MIT' : 'LIT');
      setPriorityNumber(task.priority || 1);
    } else {
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
      if (newTask.dueDate && typeof newTask.dueDate === 'string') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(newTask.dueDate)) {
          try {
            const date = new Date(newTask.dueDate);
            if (!isNaN(date.getTime())) {
              newTask.dueDate = date.toISOString().split('T')[0];
            }
          } catch {}
        }
      }
      setCurrentTask(newTask);
      setSelectedList(newTask.isMIT ? 'MIT' : 'LIT');
      setPriorityNumber(newTask.priority || 1);
    }
  }, [task, defaultValues]);

  const saveTask = useCallback(async (taskData: Partial<Task>) => {
    await onSave(taskData);
  }, [onSave]);

  const { execute: handleSave, isLoading: isSaving } = useDoubleClickPrevention(
    saveTask,
    { debounceMs: 1000, maxLoadingMs: 10000 }
  );

  const handleSaveClick = () => {
    const titleValidation = validateTaskField('title', currentTask.title || '');
    const descriptionValidation = validateTaskField('description', currentTask.description || '');

    if (titleValidation.isOverLimit || descriptionValidation.isOverLimit) {
      return;
    }

    const taskData = {
      ...currentTask,
      isMIT: selectedList === 'MIT',
      priority: priorityNumber,
    };

    handleSave(taskData);
  };

  const handleTagsChange = (newTags: string[]) => {
    setCurrentTask((prev) => ({ ...prev, tags: newTags }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleListChange = (list: 'MIT' | 'LIT') => {
    setSelectedList(list);
    setPriorityNumber(1);
  };

  const handlePriorityChange = (priority: number) => {
    const validPriority = Math.max(1, priority);
    setPriorityNumber(validPriority);
  };

  const maxPriority = selectedList === 'MIT' ? 3 : Math.max(10, litTaskCount + 1);

  return (
    <>
      <div className={`space-y-4 ${isSaving ? 'opacity-60 pointer-events-none' : ''}`}>
        <div>
          <Input
            type="text"
            name="title"
            value={currentTask.title || ''}
            onChange={handleChange}
            maxLength={TASK_LIMITS.TITLE_MAX_LENGTH}
            placeholder="Task Title"
            disabled={isSaving}
            className="text-2xl font-bold bg-input text-foreground rounded-md p-2 border border-border focus:border-blue-500 focus:outline-none"
            style={{ boxShadow: 'none !important' }}
            onFocus={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.outline = 'none';
            }}
          />
          <CharacterCounter current={(currentTask.title || '').length} max={TASK_LIMITS.TITLE_MAX_LENGTH} className="mt-3" />
        </div>
        <div>
          <textarea
            name="description"
            value={currentTask.description || ''}
            onChange={handleChange}
            maxLength={TASK_LIMITS.DESCRIPTION_MAX_LENGTH}
            rows={5}
            disabled={isSaving}
            className="w-full bg-input text-foreground rounded-md p-2 border border-border focus:border-blue-500 focus:outline-none"
            placeholder="Add task details..."
          />
          <CharacterCounter
            current={(currentTask.description || '').length}
            max={TASK_LIMITS.DESCRIPTION_MAX_LENGTH}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => handleListChange('MIT')}
                variant={selectedList === 'MIT' ? 'default' : 'secondary'}
                className="flex-1"
                disabled={isSaving}
              >
                MIT ({mitTaskCount}/3)
              </Button>
              <Button
                type="button"
                onClick={() => handleListChange('LIT')}
                variant={selectedList === 'LIT' ? 'default' : 'secondary'}
                className="flex-1"
                disabled={isSaving}
              >
                LIT ({litTaskCount})
              </Button>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">Priority in {selectedList} list (1 = highest):</div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePriorityChange(priorityNumber - 1)}
                  disabled={priorityNumber <= 1 || isSaving}
                  className="w-8 h-8 p-0 flex items-center justify-center"
                  aria-label="Decrease priority"
                >
                  -
                </Button>
                <div className="flex items-center">
                  <Input
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
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        handlePriorityChange(priorityNumber + 1);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        handlePriorityChange(priorityNumber - 1);
                      }
                    }}
                    className="w-16 text-center"
                    aria-label="Priority number"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePriorityChange(priorityNumber + 1)}
                  disabled={priorityNumber >= maxPriority || isSaving}
                  className="w-8 h-8 p-0 flex items-center justify-center"
                  aria-label="Increase priority"
                >
                  +
                </Button>
                <span className="text-xs text-gray-500 ml-2">
                  of {maxPriority} max
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{selectedList === 'MIT' ? 'MIT max: 3' : 'LIT: any number'}</div>
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
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-400">
              Due Date
            </label>
            <Input type="date" id="dueDate" name="dueDate" value={currentTask.dueDate || ''} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-400">
              Status
            </label>
            <select
              name="status"
              id="status"
              value={currentTask.status || 'Open'}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                color: 'var(--text-primary)', 
                borderColor: 'var(--border-primary)',
                borderWidth: '1px'
              }}
            >
              <option value="Open">Open</option>
              <option value="Waiting">Waiting</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mb-1">
            Tags
          </label>
          <TagInput tags={currentTask.tags || []} onTagsChange={handleTagsChange} className="w-full" style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            color: 'var(--text-primary)', 
            borderColor: 'var(--border-primary)',
            borderWidth: '1px'
          }} />
        </div>
      </div>

      {task && (
        <div className="border-t mt-6 pt-4 text-xs grid grid-cols-2 gap-x-4 gap-y-2" style={{ 
          borderColor: 'var(--border-primary)', 
          color: 'var(--text-secondary)' 
        }}>
          <p>Creation Date: {task.creationDate ? new Date(task.creationDate).toLocaleString() : 'N/A'}</p>
          <p>Created By: {task.UserId}</p>
          <p>Modified Date: {task.modifiedDate ? new Date(task.modifiedDate).toLocaleString() : 'N/A'}</p>
          <p>Modified By: (from audit log)</p>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onCancel} variant="secondary" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveClick}
          disabled={
            validateTaskField('title', currentTask.title || '').isOverLimit ||
            validateTaskField('description', currentTask.description || '').isOverLimit ||
            !(currentTask.title || '').trim() ||
            isSaving
          }
        >
          {isSaving ? '🚧 Saving...' : 'Save Changes'}
        </Button>
      </div>
    </>
  );
};
