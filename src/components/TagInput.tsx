import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { DEFAULT_TAGS } from '../constants/tags';
import { Tag } from './Tag';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, className, style }) => {
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
    const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
    return DEFAULT_TAGS[tag] || DEFAULT_TAGS[capitalizedTag] ? 'default' : 'custom';
  };

  return (
    <div className="relative">
      <div 
        className={`flex flex-wrap items-center gap-2 p-3 rounded-md border transition-colors min-h-[42px] ${className}`}
        style={{
          borderColor: 'var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
          ...style
        }}
      >
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center">
            <Tag
              label={tag}
              type={getTagType(tag)}
              className="pr-1"
            />
            <button
              onClick={() => removeTag(index)}
              className="ml-1 transition-colors p-0.5 rounded"
              style={{ color: 'var(--text-secondary)' }}
              title="Remove tag"
              aria-label={`Remove ${tag} tag`}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
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
          className="bg-transparent focus:outline-none text-sm p-1 flex-grow min-w-24"
          style={{ color: 'var(--text-primary)' }}
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
          className="absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-48 overflow-y-auto"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border-primary)' 
          }}
          role="listbox"
          aria-label="Tag suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex items-center px-3 py-2 cursor-pointer transition-colors"
              style={{
                backgroundColor: index === selectedSuggestionIndex 
                  ? 'var(--dashboard-accent)' 
                  : 'transparent',
                color: index === selectedSuggestionIndex 
                  ? 'var(--text-inverse)' 
                  : 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                if (index !== selectedSuggestionIndex) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== selectedSuggestionIndex) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
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