import { User } from '../types/auth';

const SESSION_KEY = 'bolt_showcase_session';
const CACHE_PREFIX = 'bolt_cache_';

interface StoredSession {
  user: User;
  timestamp: number;
}

class SessionManager {
  private static instance: SessionManager;
  private lastActivity: number;

  private constructor() {
    this.lastActivity = Date.now();
    this.setupActivityTracking();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private setupActivityTracking() {
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('scroll', updateActivity);
  }

  getLastActivity(): number {
    return this.lastActivity;
  }

  getPersistedUser(): User | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored) as StoredSession;
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          return session.user;
        }
        this.clearSession();
      }
    } catch (error) {
      console.warn('Failed to parse stored session:', error);
      this.clearSession();
    }
    return null;
  }

  setSession(user: User) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        user,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    this.clearAllCache();
  }

  getCacheItem<T>(key: string): T | null {
    try {
      const stored = sessionStorage.getItem(CACHE_PREFIX + key);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return data;
        }
        sessionStorage.removeItem(CACHE_PREFIX + key);
      }
    } catch (error) {
      console.warn('Failed to read cache:', error);
    }
    return null;
  }

  setCacheItem(key: string, data: any) {
    try {
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to write cache:', error);
    }
  }

  clearAllCache() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

export const sessionManager = SessionManager.getInstance();