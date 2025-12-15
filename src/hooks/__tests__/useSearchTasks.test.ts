import { renderHook } from '@testing-library/react';
import { vi } from "vitest";
import { useSearchTasks } from '../useSearchTasks';
import { Task } from '../../types';

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

describe('useSearchTasks', () => {
  it('returns empty array when query is empty', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, ''));
    expect(result.current).toEqual([]);
  });

  it('returns empty array when query is only whitespace', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, '   '));
    expect(result.current).toEqual([]);
  });

  it('finds tasks by title', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'doctor'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Book doctor appointment');
  });

  it('finds tasks by partial title match', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'book'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Book doctor appointment');
  });

  it('finds tasks by description', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'checkup'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Book doctor appointment');
  });

  it('finds tasks by tags', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'health'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Book doctor appointment');
  });

  it('finds multiple tasks with shared tags', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'personal'));
    expect(result.current).toHaveLength(2);
    expect(result.current.map(t => t.title)).toContain('Book doctor appointment');
    expect(result.current.map(t => t.title)).toContain('Plan vacation');
  });

  it('performs fuzzy search with typos', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'docter')); // typo in "doctor"
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Book doctor appointment');
  });

  it('performs case-insensitive search', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'DOCTOR'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Book doctor appointment');
  });

  it('finds partial matches in description', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'financial'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Review quarterly reports');
  });

  it('returns no results for non-matching query', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'nonexistent'));
    expect(result.current).toEqual([]);
  });

  it('handles empty task list', () => {
    const { result } = renderHook(() => useSearchTasks([], 'doctor'));
    expect(result.current).toEqual([]);
  });

  it('updates results when tasks change', () => {
    const { result, rerender } = renderHook(
      ({ tasks, query }) => useSearchTasks(tasks, query),
      { initialProps: { tasks: mockTasks, query: 'doctor' } }
    );
    
    expect(result.current).toHaveLength(1);
    
    // Add a new task with 'doctor' in the title
    const newTasks = [...mockTasks, {
      ...mockTasks[0],
      TaskId: '4',
      title: 'Call doctor for results',
    }];
    
    rerender({ tasks: newTasks, query: 'doctor' });
    expect(result.current).toHaveLength(2);
  });

  it('updates results when query changes', () => {
    const { result, rerender } = renderHook(
      ({ tasks, query }) => useSearchTasks(tasks, query),
      { initialProps: { tasks: mockTasks, query: 'doctor' } }
    );
    
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Book doctor appointment');
    
    rerender({ tasks: mockTasks, query: 'vacation' });
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Plan vacation');
  });

  it('finds tasks by multiple search terms', () => {
    const { result } = renderHook(() => useSearchTasks(mockTasks, 'quarterly reports'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Review quarterly reports');
  });
}); 