import React from 'react';

interface DropPointerProps {
  y: number;
}

export const DropPointer: React.FC<DropPointerProps> = ({ y }) => {
  return (
    <div
      className="absolute left-[-10px] w-4 h-4 transform -translate-y-1/2 transition-all duration-75"
      style={{ top: y, pointerEvents: 'none' }}
    >
      <svg viewBox="0 0 100 100" fill="red">
        <polygon points="0,0 100,50 0,100" />
      </svg>
    </div>
  );
}; 