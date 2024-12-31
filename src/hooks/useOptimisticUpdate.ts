import { useState, useEffect } from 'react';
import { optimisticUpdates } from '../utils/optimisticUpdates';

interface OptimisticUpdateOptions<T> {
  type: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate<T>({ 
  type,
  onSuccess,
  onError
}: OptimisticUpdateOptions<T>) {
  const [pendingUpdates, setPendingUpdates] = useState<T[]>([]);

  useEffect(() => {
    const unsubscribe = optimisticUpdates.subscribe(type, (update) => {
      if (update.status === 'success') {
        onSuccess?.(update.data);
      } else if (update.status === 'failed') {
        onError?.(new Error('Update failed'));
      }
    });

    return unsubscribe;
  }, [type, onSuccess, onError]);

  const update = async (updateFn: (current: T) => T, current: T) => {
    const optimistic = updateFn(current);
    const id = optimisticUpdates.track(type, optimistic, current);

    try {
      // Return optimistic result immediately
      return optimistic;
    } catch (error) {
      optimisticUpdates.fail(id);
      throw error;
    }
  };

  return {
    update,
    pendingUpdates
  };
}