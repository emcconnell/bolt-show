import { useState, useEffect } from 'react';
import { syncStatusManager } from '../utils/syncStatusManager';

interface SyncStatus {
  inProgress: boolean;
  isStale: boolean;
  error: Error | null;
}

export function useSyncStatus(key: string): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>({
    inProgress: false,
    isStale: false,
    error: null
  });

  useEffect(() => {
    const unsubscribe = syncStatusManager.subscribe(key, (newStatus) => {
      setStatus({
        inProgress: newStatus.inProgress,
        isStale: Date.now() - newStatus.lastSync > 5 * 60 * 1000,
        error: newStatus.error
      });
    });

    return () => unsubscribe();
  }, [key]);

  return status;
}