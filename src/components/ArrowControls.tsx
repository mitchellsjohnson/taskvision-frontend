import React from 'react';
import { Tooltip } from './Tooltip';

type ListId = 'MIT' | 'LIT';

export interface ArrowControlsProps {
  taskId: string;
  listId: ListId;
  index: number;
  mitListLength: number;
  litListLength: number;
  onMove: (taskId: string, targetListId: ListId, targetIndex: number) => void;
}

export const ArrowControls: React.FC<ArrowControlsProps> = ({
  taskId,
  listId,
  index,
  mitListLength,
  litListLength,
  onMove,
}) => {
  // Calculate absolute priority (0-based across both lists)
  const absolutePriority = listId === 'MIT' ? index : mitListLength + index;
  const totalTasks = mitListLength + litListLength;

  const handleUpClick = () => {
    if (absolutePriority === 0) return; // Already at top globally
    
    if (listId === 'MIT') {
      // Moving up within MIT
      onMove(taskId, 'MIT', index - 1);
    } else {
      // LIT task moving up
      if (index === 0) {
        // Move to end of MIT list (becomes MIT, even if it pushes MIT beyond 3)
        onMove(taskId, 'MIT', mitListLength);
      } else {
        // Move up within LIT
        onMove(taskId, 'LIT', index - 1);
      }
    }
  };

  const handleDownClick = () => {
    if (absolutePriority === totalTasks - 1) return; // Already at bottom globally
    
    if (listId === 'MIT') {
      // MIT task moving down
      if (index === mitListLength - 1) {
        // Move to top of LIT list (becomes LIT)
        onMove(taskId, 'LIT', 0);
      } else {
        // Move down within MIT
        onMove(taskId, 'MIT', index + 1);
      }
    } else {
      // Moving down within LIT
      onMove(taskId, 'LIT', index + 1);
    }
  };

  const canMoveUp = absolutePriority > 0;
  const canMoveDown = absolutePriority < totalTasks - 1;

  const getUpTooltip = () => {
    if (listId === 'MIT') {
      return 'Move up in MIT';
    } else {
      if (index === 0) {
        return mitListLength >= 3 ? 'Move to MIT (bumps lowest MIT to LIT)' : 'Move to MIT';
      }
      return 'Move up in LIT';
    }
  };

  const getDownTooltip = () => {
    if (listId === 'MIT') {
      return index === mitListLength - 1 ? 'Move to LIT' : 'Move down in MIT';
    } else {
      return 'Move down in LIT';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center -space-y-1">
      {canMoveUp && (
        <Tooltip text={getUpTooltip()}>
          <button
            onClick={handleUpClick}
            className="text-sky-400 hover:text-sky-200 text-xl px-1 cursor-pointer transition-colors"
            aria-label={getUpTooltip()}
          >
            ▲
          </button>
        </Tooltip>
      )}
      {canMoveDown && (
        <Tooltip text={getDownTooltip()}>
          <button
            onClick={handleDownClick}
            className="text-sky-400 hover:text-sky-200 text-xl px-1 cursor-pointer transition-colors"
            aria-label={getDownTooltip()}
          >
            ▼
          </button>
        </Tooltip>
      )}
    </div>
  );
}; 