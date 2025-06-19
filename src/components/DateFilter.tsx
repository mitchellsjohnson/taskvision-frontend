import React, { useState, useRef, useEffect } from 'react';

export type DateFilterOption = 'all' | 'pastDue' | 'dueToday' | 'dueThisWeek' | 'dueThisMonth' | 'noDueDate';

interface DateFilterProps {
  selectedOption: DateFilterOption;
  onSelectionChange: (option: DateFilterOption) => void;
  title?: string;
}

const DATE_FILTER_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pastDue', label: 'Past Due' },
  { value: 'dueToday', label: 'Due Today' },
  { value: 'dueThisWeek', label: 'Due this Week' },
  { value: 'dueThisMonth', label: 'Due this Month' },
  { value: 'noDueDate', label: 'No Due Date' },
];

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedOption,
  onSelectionChange,
  title = "Due Date"
}) => {
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

  const selectedLabel = DATE_FILTER_OPTIONS.find(option => option.value === selectedOption)?.label || 'All';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 text-white p-2 rounded-md w-40 flex justify-between items-center"
      >
        <span>{title}: {selectedLabel}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
          <div className="p-2">
            {DATE_FILTER_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onSelectionChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-white hover:bg-gray-700 transition-colors ${
                  selectedOption === option.value ? 'bg-blue-600' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 