import React from 'react';
import { DEFAULT_TAGS } from '../constants/tags';
import { Tag } from './Tag';

interface TagFilterPillsProps {
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

export const TagFilterPills: React.FC<TagFilterPillsProps> = ({ selectedTags, onTagClick }) => {
  const sortedTags = Object.keys(DEFAULT_TAGS).sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {sortedTags.map((tagName) => {
        const isSelected = selectedTags.includes(tagName);

        return (
          <div
            key={tagName}
            className={`
              transition-all duration-200 ease-in-out
              focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-blue-500
              ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}
            `}
          >
            <Tag
              label={tagName}
              type="default"
              onClick={() => onTagClick(tagName)}
              className={`
                ${isSelected ? 'opacity-100' : 'opacity-75 hover:opacity-100'}
              `}
            />
          </div>
        );
      })}
    </div>
  );
}; 