import React from 'react';
import { RESERVED_TAGS, ReservedTag } from '../constants/tags';
import { getTagColor } from './TaskCard';

interface TagFilterPillsProps {
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

export const TagFilterPills: React.FC<TagFilterPillsProps> = ({ selectedTags, onTagClick }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {RESERVED_TAGS.map((tag: ReservedTag) => {
        const isSelected = selectedTags.includes(tag.name);
        const colorClasses = getTagColor(tag.name);

        return (
          <button
            key={tag.name}
            onClick={() => onTagClick(tag.name)}
            className={`
              px-3 py-1 rounded-full text-base font-medium transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
              ${colorClasses}
              ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : 'hover:opacity-100'}
            `}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}; 