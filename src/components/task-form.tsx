import React, { useState, useEffect } from 'react';
import { Task } from '../types';

type TaskInput = Omit<Task, 'TaskId' | 'creationDate' | 'modifiedDate' | 'completedDate' | 'UserId' | 'priority' | 'isMIT' | 'tags' | 'completedDate'>;

interface TaskFormProps {
  onSubmit: (input: TaskInput) => void;
  initialValues?: Partial<Task> | null;
  onCancel?: () => void;
  isEditing: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialValues, onCancel, isEditing }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskInput['status']>('Open');

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setDescription(initialValues.description || '');
      const formattedDate = initialValues.dueDate ? new Date(initialValues.dueDate).toISOString().split('T')[0] : '';
      setDueDate(formattedDate);
      setStatus(initialValues.status || 'Open');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('Open');
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      dueDate: dueDate || undefined,
      status
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form p-6 rounded-lg shadow-md mb-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{isEditing ? 'Edit Task' : 'Create New Task'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', 
              borderColor: 'var(--border-primary)',
              borderWidth: '1px'
            }}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value as TaskInput['status'])}
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
        <div className="md:col-span-2 mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', 
              borderColor: 'var(--border-primary)',
              borderWidth: '1px'
            }}
            rows={3}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', 
              borderColor: 'var(--border-primary)',
              borderWidth: '1px'
            }}
          />
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 transition-colors"
          style={{ 
            backgroundColor: 'var(--info-border)', 
            color: 'var(--text-inverse)' 
          }}
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 transition-colors border"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
