import { useEffect, useRef } from 'react';

export const useDebounce = (callback: (arg0?: any) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup the previous timeout on re-render
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

    let debouncedCallback: (...args: any[]) => void;
    debouncedCallback = (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (timeoutRef) {
          timeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      }
    };

  return debouncedCallback;
};
