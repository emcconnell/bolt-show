import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

interface DataLoaderOptions<T> {
  loadData: () => Promise<T>;
  dependencies?: any[];
  requireAuth?: boolean;
  loadingMessage?: string;
  minLoadingTime?: number;
}

export function useDataLoader<T>({
  loadData,
  dependencies = [],
  requireAuth = true,
  loadingMessage,
  minLoadingTime = 300
}: DataLoaderOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const loadDataRef = useRef(loadData);
  const dependenciesRef = useRef(dependencies);
  const abortControllerRef = useRef<AbortController>();
  const loadStartTimeRef = useRef<number>();

  // Update refs when dependencies change
  useEffect(() => {
    loadDataRef.current = loadData;
    dependenciesRef.current = dependencies;
  }, [loadData, ...dependencies]);

  useEffect(() => {
    let mounted = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const load = async () => {
      if (requireAuth && authLoading) return;

      if (requireAuth && !user) {
        setLoading(false);
        setError('Authentication required');
        return;
      }

      loadStartTimeRef.current = Date.now();
      setLoading(true);
      setError(null);

      try {
        const result = await loadDataRef.current();
        
        if (mounted) {
          setData(result);
          setError(null);
          await enforceMinLoadingTime();
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load data:', err);
          setError((err as Error).message);
          setLoading(false);
        }
      }
    };

    const enforceMinLoadingTime = async () => {
      const elapsed = Date.now() - (loadStartTimeRef.current || 0);
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
    };

    load();
    return () => {
      mounted = false;
      abortControllerRef.current?.abort();
    };
  }, [user?.id, authLoading, requireAuth, ...dependencies]);

  return {
    data,
    loading,
    error,
    loadingMessage,
    reload: () => {
      loadStartTimeRef.current = Date.now();
      setLoading(true);
      loadDataRef.current();
    }
  };
}