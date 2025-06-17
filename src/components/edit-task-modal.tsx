import React, { useState, useEffect } from 'react';
import { TagInput } from './TagInput';
import { Task } from '../types';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  allTags: string[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSave, allTags }) => {
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setCurrentTask({
          ...task,
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split('T')[0]
            : '',
        });
      } else {
        // Reset for "create" mode
        setCurrentTask({
          title: '',
          description: '',
          status: 'Open',
          dueDate: '',
          isMIT: false,
          tags: [],
        });
      }
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(currentTask);
    onClose(); 
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Editable Fields */}
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            value={currentTask.title || ''}
            onChange={handleChange}
            className="w-full text-2xl font-bold bg-transparent text-white focus:outline-none focus:border-b-2 border-gray-600"
            placeholder="Task Title"
          />
          <textarea
            name="description"
            value={currentTask.description || ''}
            onChange={handleChange}
            rows={5}
            className="w-full bg-gray-900/50 text-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add task details..."
          />
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
            <TagInput tags={currentTask.tags || []} onTagsChange={handleTagsChange} className="bg-gray-900/50" />
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
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
