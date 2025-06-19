import React from 'react';
import { DEFAULT_TAGS } from '../constants/tags';

interface TagProps {
  label: string;               // Required. e.g., "Leader"
  type: 'default' | 'custom';  // Required. Defines style and icon usage
  onClick?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ label, type, onClick, className = '' }) => {
  const isDefault = type === 'default';
  const defaultTagData = isDefault ? DEFAULT_TAGS[label] : null;
  const IconComponent = defaultTagData?.icon;

  const baseClasses = `
    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-lg font-medium
    bg-transparent transition-opacity duration-200 ease-in-out
    ${onClick ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'cursor-default'}
    ${isDefault && defaultTagData ? defaultTagData.border : 'border-gray-500'}
    border text-white
    ${className}
  `;

  return (
    <span
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'listitem'}
      aria-label={`Tag: ${label}`}
      className={baseClasses}
    >
      {IconComponent && (
        <IconComponent className="w-4 h-4 text-gray-400" />
      )}
      <span>{label}</span>
    </span>
  );
}; 