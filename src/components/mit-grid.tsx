import React from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '../types';

interface MITGridProps {
  tasks: Task[];
  onOpenEditModal: (task: Task) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export const MITGrid: React.FC<MITGridProps> = ({ tasks, onOpenEditModal, onUpdate, onDelete }) => {
  const slots = Array.from({ length: 3 });

  return (
    <div className="mit-grid mb-12">
      <h2 className="text-2xl font-bold mb-4 text-white">Most Important Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slots.map((_, index) => {
          const task = tasks[index];
          return (
            <div key={index}>
              {task ? (
                <TaskCard 
                  task={task} 
                  onOpenEditModal={() => onOpenEditModal(task)} 
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ) : (
                <div className="h-full min-h-[150px] border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Empty MIT Slot</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
