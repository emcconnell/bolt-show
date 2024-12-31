import { useEffect } from 'react';

/**
 * Custom hook for handling cleanup operations when a component unmounts
 * @param cleanup Cleanup function to run on unmount
 */
export function useCleanup(cleanup: () => void) {
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
}