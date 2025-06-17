import React from 'react';

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
  const currentListLength = listId === 'MIT' ? mitListLength : litListLength;
  const otherListId: ListId = listId === 'MIT' ? 'LIT' : 'MIT';
  const otherListLength = listId === 'MIT' ? litListLength : mitListLength;

  const showUp = index > 0;
  const showDown = index < currentListLength - 1;

  const arrows = [];

  // Up/Down
  if (showUp) {
    arrows.push(
      <button key="up" onClick={() => onMove(taskId, listId, index - 1)}
        className="text-sky-400 hover:text-sky-600 text-sm px-1 cursor-pointer"
        aria-label={`Move up in ${listId}`} title={`Move up in ${listId}`} tabIndex={0}>
        ↑
      </button>
    );
  }
  if (showDown) {
    arrows.push(
      <button key="down" onClick={() => onMove(taskId, listId, index + 1)}
        className="text-sky-400 hover:text-sky-600 text-sm px-1 cursor-pointer"
        aria-label={`Move down in ${listId}`} title={`Move down in ${listId}`} tabIndex={0}>
        ↓
      </button>
    );
  }

  // Left/Right
  if (listId === 'MIT') {
    arrows.push(
      <button key="right" onClick={() => onMove(taskId, otherListId, otherListLength === 0 ? 0 : index)}
        className="text-sky-400 hover:text-sky-600 text-sm px-1 cursor-pointer"
        aria-label={`Move to ${otherListId} at same position`} title={`Move to ${otherListId} at same position`} tabIndex={0}>
        →
      </button>
    );
  } else {
    arrows.push(
      <button key="left" onClick={() => onMove(taskId, otherListId, otherListLength === 0 ? 0 : index)}
        className="text-sky-400 hover:text-sky-600 text-sm px-1 cursor-pointer"
        aria-label={`Move to ${otherListId} at same position`} title={`Move to ${otherListId} at same position`} tabIndex={0}>
        ←
      </button>
    );
  }

  // Diagonals
  if (listId === 'MIT') {
    if (otherListLength > 0) {
      arrows.push(
        <button key="up-right" onClick={() => onMove(taskId, otherListId, 0)}
          className="text-sky-400 hover:text-sky-600 text-sm px-1 cursor-pointer"
          aria-label={`Move to top of ${otherListId}`} title={`Move to top of ${otherListId}`} tabIndex={0}>
          ↗
        </button>
      );
      arrows.push(
        <button key="down-right" onClick={() => onMove(taskId, otherListId, otherListLength)}
          className="text-sky-400 hover:text-sky-600 text-sm px-1 cursor-pointer"
          aria-label={`Move to bottom of ${otherListId}`} title={`Move to bottom of ${otherListId}`} tabIndex={0}>
          ↘
        </button>
      );
    }
  } else {
    if (otherListLength > 0) {
      arrows.push(
        <button key="up-left" onClick={() => onMove(taskId, otherListId, 0)}
          className="text-sky-400 hover:text-sky-600 text-sm px-1 cursor-pointer"
          aria-label={`Move to top of ${otherListId}`} title={`Move to top of ${otherListId}`} tabIndex={0}>
          ↖
        </button>
      );
      arrows.push(
        <button key="down-left" onClick={() => onMove(taskId, otherListId, otherListLength)}
          className="text-sky-400 hover:text-sky-600 text-sm px-1 cursor-pointer"
          aria-label={`Move to bottom of ${otherListId}`} title={`Move to bottom of ${otherListId}`} tabIndex={0}>
          ↙
        </button>
      );
    }
  }

  return (
    <div className="flex items-center space-x-1 ml-2 mt-1">
      {arrows}
    </div>
  );
}; 