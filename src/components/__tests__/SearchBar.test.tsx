import React from 'react';
import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';
import { Task } from '../../types';

// Mock the useSearchTasks hook
import { useSearchTasks } from '../../hooks/useSearchTasks';
vi.mock('../../hooks/useSearchTasks', () => ({
  useSearchTasks: vi.fn(),
}));

const mockUseSearchTasks = useSearchTasks as anyedFunction<any>;

const mockTasks: Task[] = [
  {
    TaskId: '1',
    title: 'Book doctor appointment',
    description: 'Annual checkup with Dr. Smith',
    tags: ['health', 'personal'],
    status: 'Open',
    creationDate: '2024-01-01',
    modifiedDate: '2024-01-01',
    completedDate: null,
    UserId: 'user1',
    isMIT: true,
    priority: 0,
  },
  {
    TaskId: '2', 
    title: 'Review quarterly reports',
    description: 'Analyze Q1 financial data',
    tags: ['work', 'finance'],
    status: 'Open',
    creationDate: '2024-01-02',
    modifiedDate: '2024-01-02',
    completedDate: null,
    UserId: 'user1',
    isMIT: false,
    priority: 1,
  },
  {
    TaskId: '3',
    title: 'Plan vacation',
    description: 'Research destinations for summer trip',
    tags: ['personal', 'travel'],
    status: 'Open',
    creationDate: '2024-01-03',
    modifiedDate: '2024-01-03',
    completedDate: null,
    UserId: 'user1',
    isMIT: false,
    priority: 2,
  },
];

describe('SearchBar', () => {
  const mockOnResultClick = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchTasks.mockReturnValue([]);
    
    // Mock getElementById for scroll functionality
    const mockElement = {
      scrollIntoView: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search input with correct placeholder', () => {
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    expect(screen.getByPlaceholderText('Search open tasks...')).toBeInTheDocument();
  });

  it('calls useSearchTasks hook with correct parameters', () => {
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    expect(mockUseSearchTasks).toHaveBeenCalledWith(mockTasks, '');
  });

  it('updates search query when typing', async () => {
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'doctor');
    
    expect(mockUseSearchTasks).toHaveBeenLastCalledWith(mockTasks, 'doctor');
  });

  it('shows results dropdown when query is entered', async () => {
    mockUseSearchTasks.mockReturnValue([mockTasks[0]]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'doctor');
    
    expect(screen.getByText('Book doctor appointment')).toBeInTheDocument();
  });

  it('displays task title, description, and tags in results', async () => {
    mockUseSearchTasks.mockReturnValue([mockTasks[0]]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'doctor');
    
    expect(screen.getByText('Book doctor appointment')).toBeInTheDocument();
    expect(screen.getByText('Annual checkup with Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('health')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
  });

  it('shows MIT/LIT badge correctly', async () => {
    mockUseSearchTasks.mockReturnValue([mockTasks[0], mockTasks[1]]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'test');
    
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('LIT')).toBeInTheDocument();
  });

  it('handles result click and scrolls to task', async () => {
    mockUseSearchTasks.mockReturnValue([mockTasks[0]]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'doctor');
    
    const result = screen.getByText('Book doctor appointment');
    fireEvent.click(result);
    
    expect(document.getElementById).toHaveBeenCalledWith('task-1');
    expect(mockOnResultClick).toHaveBeenCalledWith('1');
  });

  it('clears search after clicking result', async () => {
    mockUseSearchTasks.mockReturnValue([mockTasks[0]]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...') as HTMLInputElement;
    await userEvent.type(input, 'doctor');
    
    const result = screen.getByText('Book doctor appointment');
    fireEvent.click(result);
    
    expect(input.value).toBe('');
  });

  it('shows clear button when there is text', async () => {
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'test');
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...') as HTMLInputElement;
    await userEvent.type(input, 'test');
    
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);
    
    expect(input.value).toBe('');
  });

  it('closes dropdown when pressing Escape', async () => {
    mockUseSearchTasks.mockReturnValue([mockTasks[0]]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'doctor');
    
    expect(screen.getByText('Book doctor appointment')).toBeInTheDocument();
    
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(screen.queryByText('Book doctor appointment')).not.toBeInTheDocument();
  });

  it('shows "no results" message when no matches found', async () => {
    mockUseSearchTasks.mockReturnValue([]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'nonexistent');
    
    expect(screen.getByText('No tasks found for "nonexistent"')).toBeInTheDocument();
    expect(screen.getByText('Try different keywords or check your spelling')).toBeInTheDocument();
  });

  it('limits results to 10 items', async () => {
    const manyTasks = Array.from({ length: 15 }, (_, i) => ({
      ...mockTasks[0],
      TaskId: `task-${i}`,
      title: `Task ${i}`,
    }));
    mockUseSearchTasks.mockReturnValue(manyTasks);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'task');
    
    expect(screen.getByText('Showing 10 of 15 results')).toBeInTheDocument();
  });

  it('truncates long titles and descriptions', async () => {
    const longTask = {
      ...mockTasks[0],
      title: 'This is a very long task title that should be truncated because it exceeds the maximum length limit',
      description: 'This is an extremely long task description that definitely exceeds the seventy character limit and should be truncated appropriately',
    };
    mockUseSearchTasks.mockReturnValue([longTask]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'long');
    
    expect(screen.getByText(/This is a very long task title that should be trun.../)).toBeInTheDocument();
    expect(screen.getByText(/This is an extremely long task description that def.../)).toBeInTheDocument();
  });

  it('shows only first 3 tags with +more indicator', async () => {
    const manyTagsTask = {
      ...mockTasks[0],
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    mockUseSearchTasks.mockReturnValue([manyTagsTask]);
    
    render(<SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />);
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'tag');
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(screen.queryByText('tag4')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    mockUseSearchTasks.mockReturnValue([mockTasks[0]]);
    
    render(
      <div>
        <SearchBar tasks={mockTasks} onResultClick={mockOnResultClick} />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const input = screen.getByPlaceholderText('Search open tasks...');
    await userEvent.type(input, 'doctor');
    
    expect(screen.getByText('Book doctor appointment')).toBeInTheDocument();
    
    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);
    
    // Wait for the click outside handler to close the dropdown
    await waitFor(() => {
      expect(screen.queryByText('Book doctor appointment')).not.toBeInTheDocument();
    });
  });
}); 