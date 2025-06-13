import React, { useState, useEffect } from 'react';

// A more complete Task type for the modal
interface TaskDetail {
  TaskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'Open' | 'Completed' | 'Canceled' | 'Waiting';
  tags?: string[];
  creationDate: string;
  UserId: string; // Represents 'Created by'
  modifiedDate: string;
  // 'Modified By' would typically come from an audit log
}

interface EditTaskModalProps {
  task: TaskDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskDetail>) => void;
  allTags: string[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSave, allTags }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskDetail['status']>('Open');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setStatus(task.status);
        setDueDate(
          task.dueDate
            ? (() => {
                try {
                  return new Date(task.dueDate).toISOString().split('T')[0];
                } catch (error) {
                  return '';
                }
              })()
            : ''
        );
        setTags(task.tags || []);
      } else {
        // Reset for "create" mode
        setTitle('');
        setDescription('');
        setStatus('Open');
        setDueDate('');
        setTags([]);
      }
      setTagInput('');
      setSuggestions([]);
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (tagInput) {
      const filteredSuggestions = allTags.filter(
        tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [tagInput, allTags, tags]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Add any tag currently in the input before saving
    const finalTags = [...tags];
    if (tagInput.trim() !== '' && !finalTags.includes(tagInput.trim())) {
      finalTags.push(tagInput.trim());
    }

    onSave({
      TaskId: task?.TaskId,
      title,
      description,
      dueDate,
      status,
      tags: finalTags
    });
  };

  const processTag = (tag: string): string => {
    // Convert to lowercase, remove disallowed characters (anything not a-z, 0-9, or -)
    return tag.toLowerCase().replace(/[^a-z0-9-]/g, '');
  };

  const addTag = (tag: string) => {
    const processedTag = processTag(tag);
    if (processedTag && !tags.includes(processedTag)) {
      setTags([...tags, processedTag]);
    }
  };

  const handleTagInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const newTags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
      const uniqueNewTags = newTags.map(processTag).filter(t => t && !tags.includes(t));

      if (uniqueNewTags.length > 0) {
        setTags([...tags, ...uniqueNewTags]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Editable Fields */}
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent text-white focus:outline-none focus:border-b-2 border-gray-600"
            placeholder="Task Title"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-gray-900/50 text-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add task details..."
          />
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-gray-700 text-white rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskDetail['status'])}
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-400">Tags</label>
            <div className="flex flex-wrap gap-2 items-center bg-gray-900/50 p-2 rounded-md">
              {tags.map(tag => (
                <div
                  key={String(tag)}
                  className="flex items-center gap-2 bg-blue-600 text-white rounded-full px-3 py-1 text-sm"
                >
                  <span>{String(tag)}</span>
                  <button onClick={() => removeTag(tag)} className="text-white hover:text-gray-300">
                    &times;
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagInputChange}
                className="bg-transparent focus:outline-none text-white flex-grow"
                placeholder="Add a tag..."
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-20">
                <ul className="py-1">
                  {suggestions.map(suggestion => (
                    <li
                      key={String(suggestion)}
                      className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer"
                      onClick={() => addTag(suggestion)}
                    >
                      {String(suggestion)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Non-Editable Metadata */}
        {task && (
          <div className="border-t border-gray-700 mt-6 pt-4 text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-2">
            <p>
              Creation Date:{' '}
              {(() => {
                try {
                  return new Date(task.creationDate).toLocaleString();
                } catch (error) {
                  return 'Invalid date';
                }
              })()}
            </p>
            <p>Created By: {task.UserId}</p>
            <p>
              Modified Date:{' '}
              {(() => {
                try {
                  return new Date(task.modifiedDate).toLocaleString();
                } catch (error) {
                  return 'Invalid date';
                }
              })()}
            </p>
            <p>Modified By: (from audit log)</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
