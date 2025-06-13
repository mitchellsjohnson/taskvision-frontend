import { useEffect, useRef } from 'react';

export const useResizeObserver = (callback: (entries: ResizeObserverEntry[]) => void, element: HTMLElement | null) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(entries);
      }, 100); // 100ms debounce
    });

    observer.observe(element);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      observer.disconnect();
    };
  }, [callback, element]);
}; 