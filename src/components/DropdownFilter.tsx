import React, { useState, useRef, useEffect } from 'react';

interface DropdownFilterProps<T extends string> {
  options: readonly T[];
  selectedOptions: T[];
  onSelectionChange: (option: T) => void;
  title: string;
}

export const DropdownFilter = <T extends string>({
  options,
  selectedOptions,
  onSelectionChange,
  title
}: DropdownFilterProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 text-white p-2 rounded-md w-40 flex justify-between items-center"
      >
        <span>{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
          <div className="p-4 space-y-3">
            {options.map(option => (
              <label key={String(option)} className="flex items-center gap-3 text-white">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"
                  checked={selectedOptions.includes(option)}
                  onChange={() => onSelectionChange(option)}
                />
                <span>{String(option)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
