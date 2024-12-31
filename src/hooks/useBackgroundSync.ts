import { useEffect } from 'react';
import { backgroundSync } from '../utils/backgroundSync';

interface BackgroundSyncOptions {
  type: string;
  data: any;
  priority?: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useBackgroundSync({
  type,
  data,
  priority = 0,
  onComplete,
  onError
}: BackgroundSyncOptions) {
  useEffect(() => {
    const taskId = backgroundSync.registerTask(type, data, priority);

    return () => {
      // Cleanup if needed
    };
  }, [type, data, priority]);
}