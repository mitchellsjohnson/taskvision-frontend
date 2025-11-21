import { useState, useCallback, useRef } from 'react';

interface UseDoubleClickPreventionOptions {
  /**
   * Minimum time (in ms) between clicks to prevent double execution
   * @default 1000
   */
  debounceMs?: number;
  
  /**
   * Maximum time (in ms) to show loading state
   * @default 5000
   */
  maxLoadingMs?: number;
}

/**
 * Hook to prevent double-click issues and provide loading states
 * Returns a wrapper function that prevents multiple rapid executions
 */
export const useDoubleClickPrevention = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: UseDoubleClickPreventionOptions = {}
) => {
  const { debounceMs = 1000, maxLoadingMs = 5000 } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastExecutionRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async (...args: T): Promise<R | undefined> => {
    const now = Date.now();
    
    // Prevent double execution
    if (isLoading || (now - lastExecutionRef.current < debounceMs)) {
      console.warn('Operation prevented: too soon after last execution');
      return undefined;
    }

    lastExecutionRef.current = now;
    setIsLoading(true);
    setError(null);

    // Safety timeout to prevent infinite loading states
    timeoutRef.current = setTimeout(() => {
      console.warn('Operation timed out, resetting loading state');
      setIsLoading(false);
      setError('Operation timed out. Please try again.');
    }, maxLoadingMs);

    try {
      const result = await operation(...args);
      
      // Clear timeout on successful completion
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsLoading(false);
      return result;
    } catch (err) {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    }
  }, [operation, debounceMs, maxLoadingMs, isLoading]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    execute,
    isLoading,
    error,
    reset
  };
};















