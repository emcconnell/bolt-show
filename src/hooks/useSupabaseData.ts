import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';

interface UseSupabaseDataOptions<T> {
  query: string;
  params?: any[];
  transform?: (data: any) => T;
  requireAuth?: boolean;
  dependencies?: any[];
}

export function useSupabaseData<T>({
  query,
  params = [],
  transform,
  requireAuth = false,
  dependencies = []
}: UseSupabaseDataOptions<T>) {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (requireAuth && !user) {
        setError(new Error('Authentication required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: result, error: queryError } = await supabase
          .from(query)
          .select('*');

        if (queryError) throw queryError;

        if (mounted) {
          const transformedData = transform ? transform(result) : result;
          setData(transformedData);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`public:${query}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        if (mounted) {
          loadData();
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [query, user?.id, requireAuth, ...dependencies]);

  return { data, loading, error };
}