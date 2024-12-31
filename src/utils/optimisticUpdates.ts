interface OptimisticUpdate<T> {
  id: string;
  type: string;
  data: T;
  timestamp: number;
  rollbackData: T;
  status: 'pending' | 'success' | 'failed';
}

class OptimisticUpdateManager {
  private static instance: OptimisticUpdateManager;
  private updates: Map<string, OptimisticUpdate<any>> = new Map();
  private listeners: Map<string, Set<(update: OptimisticUpdate<any>) => void>> = new Map();

  private constructor() {}

  static getInstance(): OptimisticUpdateManager {
    if (!OptimisticUpdateManager.instance) {
      OptimisticUpdateManager.instance = new OptimisticUpdateManager();
    }
    return OptimisticUpdateManager.instance;
  }

  track<T>(type: string, data: T, rollbackData: T): string {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const update: OptimisticUpdate<T> = {
      id,
      type,
      data,
      rollbackData,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.updates.set(id, update);
    this.notifyListeners(type, update);
    return id;
  }

  succeed(id: string) {
    const update = this.updates.get(id);
    if (update) {
      update.status = 'success';
      this.notifyListeners(update.type, update);
      this.cleanup(id);
    }
  }

  fail(id: string) {
    const update = this.updates.get(id);
    if (update) {
      update.status = 'failed';
      this.notifyListeners(update.type, update);
      this.cleanup(id);
    }
  }

  subscribe(type: string, listener: (update: OptimisticUpdate<any>) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  private notifyListeners(type: string, update: OptimisticUpdate<any>) {
    this.listeners.get(type)?.forEach(listener => listener(update));
  }

  private cleanup(id: string) {
    setTimeout(() => {
      this.updates.delete(id);
    }, 5000); // Keep failed updates around briefly for UI feedback
  }

  getPendingUpdates(type: string): OptimisticUpdate<any>[] {
    return Array.from(this.updates.values())
      .filter(update => update.type === type && update.status === 'pending');
  }
}

export const optimisticUpdates = OptimisticUpdateManager.getInstance();