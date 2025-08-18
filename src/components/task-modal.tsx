import React, { useState, useEffect } from 'react';

interface Task {
  TaskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'Open' | 'Completed' | 'Canceled';
}

type TaskInput = Omit<Task, 'TaskId'>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskInput) => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Task['status']>('Open');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('Open');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, dueDate, status });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card p-8 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-foreground mb-6">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-foreground mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-input text-foreground border border-border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-foreground mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-input text-foreground border border-border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="dueDate" className="block text-sm font-medium text-secondary-foreground mb-1">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-input text-foreground border border-border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="status" className="block text-sm font-medium text-secondary-foreground mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value as Task['status'])}
                className="w-full bg-input text-foreground border border-border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              >
                <option value="Open">Open</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              {taskToEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
