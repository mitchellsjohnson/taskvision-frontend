import React from 'react';

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  className = '',
}) => {
  const remaining = max - current;
  const isNearLimit = remaining <= max * 0.1; // Warning at 90%
  const isOverLimit = current > max;
  
  const getColorClass = () => {
    if (isOverLimit) return 'text-red-400';
    if (isNearLimit) return 'text-yellow-400';
    return 'text-muted-foreground';
  };
  
  return (
    <div className={`text-xs ${getColorClass()} ${className}`}>
      {isOverLimit ? (
        <span className="font-medium">
          {current - max} characters over limit
        </span>
      ) : (
        <span>
          {remaining} characters remaining
        </span>
      )}
    </div>
  );
}; 