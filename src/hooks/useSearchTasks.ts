import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Task } from '../types';

export const useSearchTasks = (tasks: Task[], query: string): Task[] => {
  const fuse = useMemo(() => {
    return new Fuse(tasks, {
      keys: ['title', 'description', 'tags'],
      threshold: 0.3, // good fuzzy balance
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
    });
  }, [tasks]);

  return useMemo(() => {
    if (!query.trim()) return [];
    
    const results = fuse.search(query);
    return results.map(result => result.item);
  }, [fuse, query]);
}; 