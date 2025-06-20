import React, { useState, useRef, useEffect } from 'react';
import { useSearchTasks } from '../hooks/useSearchTasks';
import { Task } from '../types';
import { Tag } from './Tag';
import { DEFAULT_TAGS } from '../constants/tags';

interface SearchBarProps {
  tasks: Task[];
  onResultClick?: (taskId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ tasks, onResultClick }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const results = useSearchTasks(tasks, query);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToTask = (taskId: string) => {
    const element = document.getElementById(`task-${taskId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Add a temporary highlight effect
      element.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-75');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-75');
      }, 2000);
    }
    
    // Clear search and close dropdown
    setQuery('');
    setIsOpen(false);
    
    // Call optional callback
    if (onResultClick) {
      onResultClick(taskId);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search open tasks..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 text-xl bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.slice(0, 10).map((task: Task) => (
                <li key={task.TaskId}>
                  <button
                    onClick={() => scrollToTask(task.TaskId)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {truncateText(task.title)}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate">
                            {truncateText(task.description, 70)}
                          </div>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.tags.slice(0, 3).map((tag: string, index: number) => (
                              <Tag
                                key={index}
                                label={tag}
                                type={DEFAULT_TAGS[tag] ? 'default' : 'custom'}
                                className="text-xs !text-gray-800 dark:!text-gray-200"
                              />
                            ))}
                            {task.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{task.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          task.isMIT 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.isMIT ? 'MIT' : 'LIT'}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {results.length > 10 && (
                <li className="px-4 py-2 text-sm text-gray-500 border-t">
                  Showing 10 of {results.length} results
                </li>
              )}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No tasks found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or check your spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 