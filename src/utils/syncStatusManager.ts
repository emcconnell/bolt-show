interface SyncStatus {
  lastSync: number;
  inProgress: boolean;
  error: Error | null;
}

class SyncStatusManager {
  private static instance: SyncStatusManager;
  private status: Map<string, SyncStatus> = new Map();
  private listeners: Map<string, Set<(status: SyncStatus) => void>> = new Map();

  private constructor() {}

  static getInstance(): SyncStatusManager {
    if (!SyncStatusManager.instance) {
      SyncStatusManager.instance = new SyncStatusManager();
    }
    return SyncStatusManager.instance;
  }

  startSync(key: string) {
    this.updateStatus(key, {
      ...this.getStatus(key),
      inProgress: true,
      error: null
    });
  }

  completeSync(key: string) {
    this.updateStatus(key, {
      lastSync: Date.now(),
      inProgress: false,
      error: null
    });
  }

  failSync(key: string, error: Error) {
    this.updateStatus(key, {
      ...this.getStatus(key),
      inProgress: false,
      error
    });
  }

  private getStatus(key: string): SyncStatus {
    return this.status.get(key) || {
      lastSync: 0,
      inProgress: false,
      error: null
    };
  }

  private updateStatus(key: string, status: SyncStatus) {
    this.status.set(key, status);
    this.notifyListeners(key, status);
  }

  subscribe(key: string, listener: (status: SyncStatus) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
    
    // Notify with current status
    listener(this.getStatus(key));

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notifyListeners(key: string, status: SyncStatus) {
    this.listeners.get(key)?.forEach(listener => listener(status));
  }
}

export const syncStatusManager = SyncStatusManager.getInstance();