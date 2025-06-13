import React, { useState, useEffect } from 'react';

interface Task {
  TaskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'Open' | 'Completed' | 'Canceled';
  creationDate: string;
  modifiedDate: string;
  completedDate: string | null;
  UserId: string;
}

type TaskInput = Omit<Task, 'TaskId' | 'creationDate' | 'modifiedDate' | 'completedDate' | 'UserId'>;

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
    <form onSubmit={handleSubmit} className="task-form bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">{isEditing ? 'Edit Task' : 'Create New Task'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-white mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value as TaskInput['status'])}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Open">Open</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
        <div className="md:col-span-2 mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-sm font-medium text-white mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
