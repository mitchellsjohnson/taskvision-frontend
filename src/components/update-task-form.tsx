import { useAuth0 } from '@auth0/auth0-react';
import React, { useState } from 'react';

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

interface UpdateTaskFormProps {
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
  onCancel: () => void;
}

export const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({ task, onTaskUpdated, onCancel }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_SERVER_URL}/api/tasks/${task.TaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate || undefined,
          status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <div>
        <label htmlFor={`update-title-${task.TaskId}`} className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id={`update-title-${task.TaskId}`}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor={`update-description-${task.TaskId}`} className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id={`update-description-${task.TaskId}`}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor={`update-dueDate-${task.TaskId}`} className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="datetime-local"
          id={`update-dueDate-${task.TaskId}`}
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor={`update-status-${task.TaskId}`} className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id={`update-status-${task.TaskId}`}
          value={status}
          onChange={e => setStatus(e.target.value as Task['status'])}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Open">Open</option>
          <option value="Completed">Completed</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
