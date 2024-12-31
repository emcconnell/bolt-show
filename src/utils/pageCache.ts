import { useLocation } from 'react-router-dom';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class PageCacheManager {
  private static instance: PageCacheManager;
  private cache: Map<string, CacheEntry<any>>;
  private readonly TTL = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    this.cache = new Map();
    
    // Clear stale entries periodically
    setInterval(() => this.clearStale(), 60 * 1000);
    
    // Clear cache on visibility change after long inactivity
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.clearStale();
      }
    });
  }

  static getInstance(): PageCacheManager {
    if (!PageCacheManager.instance) {
      PageCacheManager.instance = new PageCacheManager();
    }
    return PageCacheManager.instance;
  }

  set(key: string, data: any) {
    // Store in session storage for persistence
    try {
      sessionStorage.setItem(`page_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to store in session storage:', error);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): T | null {
    // Try memory cache first
    const entry = this.cache.get(key);
    if (entry) {
      if (Date.now() - entry.timestamp > this.TTL) {
        this.cache.delete(key);
        return null;
      }
      return entry.data as T;
    }

    // Try session storage
    try {
      const stored = sessionStorage.getItem(`page_cache_${key}`);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp <= this.TTL) {
          // Restore to memory cache
          this.cache.set(key, { data, timestamp });
          return data as T;
        }
        sessionStorage.removeItem(`page_cache_${key}`);
      }
    } catch (error) {
      console.warn('Failed to read from session storage:', error);
    }

    return null;
  }

  clear() {
    this.cache.clear();
    // Clear session storage cache
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('page_cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  clearStale() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
        sessionStorage.removeItem(`page_cache_${key}`);
      }
    }
  }
}

export const pageCache = PageCacheManager.getInstance();

export function usePageCache<T>(key: string): {
  cachedData: T | null;
  updateCache: (data: T) => void;
} {
  const location = useLocation();
  const cacheKey = `${location.pathname}:${key}`;

  return {
    cachedData: pageCache.get<T>(cacheKey),
    updateCache: (data: T) => pageCache.set(cacheKey, data)
  };
}