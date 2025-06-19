import React from 'react';
import { Tooltip } from './Tooltip';

type ListId = 'MIT' | 'LIT';

export interface PowerControlsProps {
  taskId: string;
  listId: ListId;
  mitListLength: number;
  litListLength: number;
  onMove: (taskId: string, targetListId: ListId, targetIndex: number) => void;
}

export const PowerControls: React.FC<PowerControlsProps> = ({
  taskId,
  listId,
  mitListLength,
  litListLength,
  onMove,
}) => {
  const handleMitClick = (targetPriority: number) => {
    // Move to MIT at specific priority (0-based index)
    onMove(taskId, 'MIT', targetPriority);
  };

  const handleLitClick = (targetPriority: number) => {
    // Move to LIT at specific priority (0-based index)
    onMove(taskId, 'LIT', targetPriority);
  };

  // Calculate available MIT positions (always show 1-3, but smart about what's possible)
  const availableMitPositions = Math.min(3, mitListLength + (listId === 'LIT' ? 1 : 0));
  
  // Calculate available LIT positions (show based on current LIT length + potential addition)
  const availableLitPositions = litListLength + (listId === 'MIT' ? 1 : 0);

  if (listId === 'MIT') {
    // MIT tasks can only move to LIT - show LIT controls
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-sm font-semibold text-white mb-1">LIT</div>
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(availableLitPositions, 3) }, (_, i) => i + 1).map((priority) => (
            <Tooltip key={`lit-${priority}`} text={`Move to LIT priority ${priority}`}>
              <button
                onClick={() => handleLitClick(priority - 1)}
                className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-1.5 py-1 rounded transition-colors"
                aria-label={`Move to LIT priority ${priority}`}
              >
                {priority}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  } else {
    // LIT tasks can only move to MIT - show MIT controls
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-sm font-semibold text-white mb-1">MIT</div>
        <div className="flex space-x-1">
          {Array.from({ length: availableMitPositions }, (_, i) => i + 1).map((priority) => (
            <Tooltip key={`mit-${priority}`} text={`Move to MIT priority ${priority}`}>
              <button
                onClick={() => handleMitClick(priority - 1)}
                className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-1.5 py-1 rounded transition-colors"
                aria-label={`Move to MIT priority ${priority}`}
              >
                {priority}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }
}; 