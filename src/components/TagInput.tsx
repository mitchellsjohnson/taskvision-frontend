import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { DEFAULT_TAGS } from '../constants/tags';
import { Tag } from './Tag';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, className }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const defaultTagKeys = Object.keys(DEFAULT_TAGS);
      const filtered = defaultTagKeys.filter(tag =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(tag)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [inputValue, tags]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        addTag(suggestions[selectedSuggestionIndex]);
      } else {
        addTag();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === ',' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '') {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tagToAdd?: string) => {
    const newTag = (tagToAdd || inputValue.trim());
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  const getTagType = (tag: string): 'default' | 'custom' => {
    return DEFAULT_TAGS[tag] ? 'default' : 'custom';
  };

  return (
    <div className="relative">
      <div className={`flex flex-wrap items-center gap-2 p-3 rounded-md border border-gray-600 focus-within:border-blue-500 transition-colors min-h-[42px] bg-gray-700 ${className}`}>
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center">
            <Tag
              label={tag}
              type={getTagType(tag)}
              className="pr-1"
            />
            <button
              onClick={() => removeTag(index)}
              className="ml-1 text-gray-400 hover:text-white transition-colors p-0.5 rounded"
              title="Remove tag"
              aria-label={`Remove ${tag} tag`}
            >
              ×
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => inputValue && setShowSuggestions(suggestions.length > 0)}
          placeholder="Add tag..."
          className="bg-transparent focus:outline-none text-sm p-1 flex-grow text-white placeholder-gray-400 min-w-24"
          aria-label="Add new tag"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-controls="tag-suggestions"
          role="combobox"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="tag-suggestions"
          className="absolute z-50 w-full mt-1 bg-gray-700 rounded-md shadow-lg border border-gray-600 max-h-48 overflow-y-auto"
          role="listbox"
          aria-label="Tag suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                index === selectedSuggestionIndex
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-600 text-gray-200'
              }`}
              role="option"
              aria-selected={index === selectedSuggestionIndex}
            >
              <Tag
                label={suggestion}
                type="default"
                className="pointer-events-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 