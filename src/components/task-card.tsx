import React from 'react';

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

interface TaskCardProps {
  task: Task;
  onEdit?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const isInactive = task.status === 'Completed' || task.status === 'Canceled';

  const getStatusIndicator = () => {
    const baseClasses = 'w-3 h-3 rounded-full';
    switch (task.status) {
      case 'Completed':
        return <div className={`${baseClasses} bg-green-500`} title="Completed"></div>;
      case 'Canceled':
        return <div className={`${baseClasses} bg-red-500`} title="Canceled"></div>;
      case 'Open':
      default:
        return <div className={`${baseClasses} bg-blue-500`} title="Open"></div>;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-all duration-300 min-h-[150px] ${
        isInactive ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-semibold pr-2 text-lg ${isInactive ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {task.title}
          </h3>
          {onEdit && !isInactive && (
            <button
              onClick={() => onEdit(task.TaskId)}
              className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0 p-1"
              title="Edit task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>
        {task.description && <p className="text-sm text-gray-600 mb-3">{task.description}</p>}
      </div>

      <div className="text-xs text-gray-500 pt-3 border-t border-gray-100 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIndicator()}
            <span>{task.status}</span>
          </div>
          {task.dueDate && <span title={`Due on ${formatDate(task.dueDate)}`}>Due: {formatDate(task.dueDate)}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span>Created: {formatDate(task.creationDate)}</span>
          {task.completedDate && <span>Completed: {formatDate(task.completedDate)}</span>}
        </div>
      </div>
    </div>
  );
};
