import React, { useState, KeyboardEvent } from 'react';
import { getTagColor } from './TaskCard';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, className }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '') {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 p-1 rounded-md ${className}`}>
      {tags.map((tag, index) => (
        <div
          key={index}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getTagColor(tag)}`}
        >
          <span>{tag}</span>
          <button
            onClick={() => removeTag(index)}
            className="text-gray-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={addTag}
        placeholder="Add tag..."
        className="bg-transparent focus:outline-none text-sm p-1 flex-grow"
      />
    </div>
  );
}; 