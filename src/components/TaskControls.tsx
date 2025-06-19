import React from 'react';
import { Task } from '../types';
import { Tooltip } from './Tooltip';

type TaskControlsProps = {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onOpenEditModal: (task: Task) => void;
};

export const TaskControls: React.FC<TaskControlsProps> = ({
  task,
  onUpdate,
  onDelete,
  onOpenEditModal,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Tooltip text="Edit Task">
        <button
          onClick={() => onOpenEditModal(task)}
          className="text-gray-400 hover:text-blue-400 transition-colors"
          data-testid={`edit-task-button-${task.TaskId}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
          </svg>
        </button>
      </Tooltip>
      <Tooltip text="Mark as Completed">
        <button
          onClick={() => onUpdate(task.TaskId, { status: 'Completed' })}
          className="text-gray-400 hover:text-green-400 transition-colors"
          data-testid={`complete-task-button-${task.TaskId}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </Tooltip>
      <Tooltip text="Cancel Task">
        <button
          onClick={() => onUpdate(task.TaskId, { status: 'Canceled' })}
          className="text-gray-400 hover:text-red-400 transition-colors"
          data-testid={`cancel-task-button-${task.TaskId}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Tooltip>
       <Tooltip text="Delete Task">
        <button
          onClick={() => onDelete(task.TaskId)}
          className="text-gray-400 hover:text-red-600 transition-colors"
          data-testid={`delete-task-button-${task.TaskId}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </Tooltip>
    </div>
  );
}; 