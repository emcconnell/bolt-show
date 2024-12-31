import { useEffect } from 'react';
import { revalidationManager } from '../utils/revalidationManager';

interface RevalidationOptions {
  key: string;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateInterval?: number;
}

export function useRevalidation(callback: () => Promise<void>, options: RevalidationOptions) {
  useEffect(() => {
    return revalidationManager.register(options, callback);
  }, [callback, options.key]);
}