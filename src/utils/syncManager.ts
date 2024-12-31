import { pageCache } from './pageCache';
import { sessionManager } from './sessionManager';
import { tabSync } from './tabSync';
import { conflictManager } from './conflictManager';
import { requestQueue } from './requestQueue';
import { errorRecovery } from './errorRecovery';
import { dataValidator } from './dataValidator';
import { healthCheck } from './healthCheck';
import { integrityCheck } from './integrityCheck';

// Constants
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SYNC_INTERVAL = 5 * 60 * 1000;  // 5 minutes
const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

interface SyncOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateOnInterval?: boolean;
  dedupingInterval?: number;
  validateData?: boolean;
  checkIntegrity?: boolean;
}

class SyncManager {
  private static instance: SyncManager;
  private lastSync: Map<string, number> = new Map();
  private syncInterval?: number;
  private idleTimeout?: number;
  private subscriptions: Map<string, () => void> = new Set();
  private isOnline: boolean = navigator.onLine;
  private recoveryAttempts: Map<string, number> = new Map();
  private readonly MAX_RECOVERY_ATTEMPTS = 3;

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private setupEventListeners() {
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleVisibilityChange();
      }
    });

    // Handle online/offline
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleReconnect();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Track user activity
    ['click', 'keydown', 'mousemove', 'scroll'].forEach(event => {
      window.addEventListener(event, () => this.resetIdleTimer());
    });
  }

  private async handleVisibilityChange() {
    const lastActivity = sessionManager.getLastActivity();
    if (Date.now() - lastActivity > IDLE_TIMEOUT) {
      await this.handleReactivation();
    }
  }

  private async handleReconnect() {
    if (this.isOnline) {
      await this.revalidateAll();
    }
  }

  private async handleReactivation() {
    // Clear all caches
    pageCache.clear();
    sessionManager.clearAllCache();
    
    // Check system health
    const healthStatus = healthCheck.getStatus();
    if (!healthStatus.healthy) {
      console.warn('System health issues detected:', healthStatus.issues);
      await this.attemptRecovery('system_health');
    }

    await this.revalidateAll();
  }

  private resetIdleTimer() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.idleTimeout = window.setTimeout(() => {
      this.handleIdle();
    }, IDLE_TIMEOUT);
  }

  private handleIdle() {
    pageCache.clearStale();
  }

  async startSync(key: string, syncFn: () => Promise<void>, options: SyncOptions = {}) {
    const {
      revalidateOnFocus = true,
      revalidateOnReconnect = true,
      revalidateOnInterval = false,
      dedupingInterval = 2000,
      validateData = true,
      checkIntegrity = true
    } = options;

    // Don't sync if already synced recently
    const lastSyncTime = this.lastSync.get(key);
    if (lastSyncTime && Date.now() - lastSyncTime < dedupingInterval) {
      return;
    }

    try {
      // Perform initial sync
      await this.performSync(key, syncFn, { validateData, checkIntegrity });
      
      // Subscribe to cross-tab updates
      const unsubscribe = tabSync.subscribe(key, async (data) => {
        if (data) {
          if (validateData) {
            const validationResult = await dataValidator.validateData(key, data);
            if (!validationResult.valid) {
              console.warn(`Data validation failed for ${key}:`, validationResult.errors);
              return;
            }
          }

          if (checkIntegrity) {
            const integrityResult = await integrityCheck.validateData(key, data);
            if (!integrityResult.valid) {
              console.warn(`Data integrity check failed for ${key}:`, integrityResult.errors);
              return;
            }
          }

          pageCache.set(key, data);
          sessionManager.setCacheItem(key, data);
        } else {
          pageCache.clear();
          sessionManager.clearAllCache();
        }
      });

      this.subscriptions.set(key, unsubscribe);

      // Setup interval if needed
      if (revalidateOnInterval) {
        if (this.syncInterval) {
          clearInterval(this.syncInterval);
        }
        this.syncInterval = window.setInterval(() => {
          this.performSync(key, syncFn, { validateData, checkIntegrity });
        }, SYNC_INTERVAL);
      }

    } catch (error) {
      console.error(`Sync failed for ${key}:`, error);
      await this.attemptRecovery(key);
    }
  }

  private async performSync(
    key: string, 
    syncFn: () => Promise<void>,
    options: { validateData?: boolean; checkIntegrity?: boolean }
  ) {
    try {
      // Get local and remote data
      const localData = pageCache.get(key);
      const remoteData = await syncFn();

      if (options.validateData) {
        const validationResult = await dataValidator.validateData(key, remoteData);
        if (!validationResult.valid) {
          throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      if (options.checkIntegrity) {
        const integrityResult = await integrityCheck.validateData(key, remoteData);
        if (!integrityResult.valid) {
          throw new Error(`Data integrity check failed: ${integrityResult.errors.join(', ')}`);
        }
      }

      // Check for conflicts
      if (localData && remoteData) {
        const { resolved } = await conflictManager.resolveConflict(
          key,
          localData,
          remoteData
        );

        // Update with resolved data
        pageCache.set(key, resolved);
        sessionManager.setCacheItem(key, resolved);
      } else {
        // No conflict, just update cache
        pageCache.set(key, remoteData);
        sessionManager.setCacheItem(key, remoteData);
      }

      await syncFn();
      
      // Process any queued requests after successful sync
      if (navigator.onLine) {
        await requestQueue.processQueue();
      }

      this.lastSync.set(key, Date.now());
      this.recoveryAttempts.delete(key);

    } catch (error) {
      console.error(`Sync failed for ${key}:`, error);
      await this.attemptRecovery(key);
    }
  }

  private async attemptRecovery(key: string) {
    const attempts = this.recoveryAttempts.get(key) || 0;
    if (attempts >= this.MAX_RECOVERY_ATTEMPTS) {
      console.error(`Max recovery attempts reached for ${key}`);
      return;
    }

    this.recoveryAttempts.set(key, attempts + 1);

    try {
      await errorRecovery.attemptRecovery(new Error(`Sync failed for ${key}`), {
        retry: () => this.revalidateAll(),
        refresh: () => this.clearAndRevalidate(key)
      });
    } catch (error) {
      console.error(`Recovery failed for ${key}:`, error);
    }
  }

  private async clearAndRevalidate(key: string) {
    pageCache.clear();
    sessionManager.clearAllCache();
    await this.revalidateAll();
  }

  stopSync(key: string) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Clean up cross-tab subscription
    const unsubscribe = this.subscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(key);
    }
    
    this.lastSync.delete(key);
    this.recoveryAttempts.delete(key);
  }

  private async revalidateAll() {
    // Trigger revalidation for all active syncs
    for (const [key] of this.lastSync.entries()) {
      tabSync.broadcast({
        type: 'CACHE_INVALIDATE',
        key
      });
      this.lastSync.delete(key);
    }
  }

  isStale(key: string): boolean {
    const lastSyncTime = this.lastSync.get(key);
    return !lastSyncTime || Date.now() - lastSyncTime > STALE_THRESHOLD;
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.subscriptions.clear();
    this.lastSync.clear();
    this.recoveryAttempts.clear();
  }
}

export const syncManager = SyncManager.getInstance();