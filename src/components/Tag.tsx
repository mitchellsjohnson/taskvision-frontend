import React from 'react';
import { DEFAULT_TAGS, TAG_ICON_MAP } from '../constants/tags';
import { Icon } from './icon';

interface TagProps {
  label: string;
  type: 'default' | 'custom';
  onClick?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ label, type, onClick, className = '' }) => {
  const isDefault = type === 'default';
  const defaultTagData = isDefault ? DEFAULT_TAGS[label] : null;
  const iconName = isDefault ? TAG_ICON_MAP[label] || TAG_ICON_MAP.default : undefined;

  const baseClasses = `
    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
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
      {iconName && (
        <Icon name={iconName} className="w-4 h-4 text-gray-400" />
      )}
      <span>{label}</span>
    </span>
  );
}; 