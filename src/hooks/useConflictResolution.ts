import { useState, useCallback } from 'react';
import { conflictManager } from '../utils/conflictManager';

interface ConflictResolutionHookResult<T> {
  resolveConflict: (local: T, remote: T, strategy?: string) => Promise<T>;
  isResolving: boolean;
  error: Error | null;
}

export function useConflictResolution<T>(
  entityType: string
): ConflictResolutionHookResult<T> {
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resolveConflict = useCallback(
    async (local: T, remote: T, strategy = 'timestamp'): Promise<T> => {
      setIsResolving(true);
      setError(null);

      try {
        const { resolved } = await conflictManager.resolveConflict(
          entityType,
          local,
          remote,
          strategy
        );
        return resolved;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsResolving(false);
      }
    },
    [entityType]
  );

  return {
    resolveConflict,
    isResolving,
    error
  };
}