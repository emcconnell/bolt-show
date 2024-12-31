import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { syncManager } from '../utils/syncManager';
import { pageCache } from '../utils/pageCache';
import { sessionManager } from '../utils/sessionManager';
import { tabSync } from '../utils/tabSync';
import { requestQueue } from '../utils/requestQueue';

interface SyncedDataOptions<T> {
  key: string;
  loadData: () => Promise<T>;
  requireAuth?: boolean;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateOnInterval?: boolean;
  dedupingInterval?: number;
}

export function useSyncedData<T>({
  key,
  loadData,
  requireAuth = false,
  revalidateOnFocus = true,
  revalidateOnReconnect = true,
  revalidateOnInterval = false,
  dedupingInterval = 2000
}: SyncedDataOptions<T>) {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<T | null>(() => {
    // Try to get initial data from cache
    return pageCache.get<T>(key) || null;
  });
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      if (requireAuth && !isAuthenticated) {
        setError(new Error('Authentication required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await loadData();
        
        if (mounted) {
          setData(result);
          setOptimisticData(null); // Clear optimistic updates
          setError(null);
          
          // Update cache
          pageCache.set(key, result);
          sessionManager.setCacheItem(key, result);
          
          // Broadcast update to other tabs
          tabSync.broadcast({
            type: 'DATA_UPDATE',
            key,
            data: result
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          
          // Try to get from cache on error
          const cached = pageCache.get<T>(key) || sessionManager.getCacheItem<T>(key);
          if (cached) {
            setData(cached);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Start sync with options
    syncManager.startSync(key, sync, {
      revalidateOnFocus,
      revalidateOnReconnect,
      revalidateOnInterval,
      dedupingInterval
    });

    return () => {
      mounted = false;
      syncManager.stopSync(key);
    };
  }, [key, user?.id, isAuthenticated]);

  return {
    data,
    loading,
    error,
    optimisticUpdate: (updateFn: (current: T | null) => T) => {
      const updated = updateFn(data);
      setOptimisticData(updated);
      return updated;
    },
    refresh: () => {
      syncManager.stopSync(key);
      pageCache.clear();
      sessionManager.clearAllCache();
    }
  };
}