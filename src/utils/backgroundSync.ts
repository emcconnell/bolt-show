interface SyncTask {
  id: string;
  type: string;
  data: any;
  priority: number;
  timestamp: number;
  lastAttempt?: number;
  attempts: number;
}

class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private tasks: Map<string, SyncTask> = new Map();
  private isProcessing = false;
  private maxRetries = 3;
  private syncInterval?: number;

  private constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  private setupEventListeners() {
    // Resume sync when coming online
    window.addEventListener('online', () => {
      this.processTasks();
    });

    // Process tasks when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.processTasks();
      }
    });
  }

  private startPeriodicSync() {
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.processTasks();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  registerTask(type: string, data: any, priority: number = 0) {
    const task: SyncTask = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      priority,
      timestamp: Date.now(),
      attempts: 0
    };

    this.tasks.set(task.id, task);
    this.persistTasks();

    if (navigator.onLine) {
      this.processTasks();
    }

    return task.id;
  }

  private async processTasks() {
    if (this.isProcessing || this.tasks.size === 0) return;
    this.isProcessing = true;

    try {
      const sortedTasks = Array.from(this.tasks.values())
        .sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);

      for (const task of sortedTasks) {
        if (task.attempts >= this.maxRetries) {
          this.tasks.delete(task.id);
          continue;
        }

        try {
          await this.processTask(task);
          this.tasks.delete(task.id);
        } catch (error) {
          task.attempts++;
          task.lastAttempt = Date.now();
          console.warn(`Task ${task.id} failed:`, error);
        }
      }
    } finally {
      this.isProcessing = false;
      this.persistTasks();
    }
  }

  private async processTask(task: SyncTask): Promise<void> {
    // Implementation would depend on task type
    switch (task.type) {
      case 'SYNC_PROFILE':
        // Handle profile sync
        break;
      case 'SYNC_PROJECTS':
        // Handle projects sync
        break;
      case 'SYNC_SETTINGS':
        // Handle settings sync
        break;
      default:
        console.warn(`Unknown task type: ${task.type}`);
    }
  }

  private persistTasks() {
    try {
      localStorage.setItem('background_sync_tasks', 
        JSON.stringify(Array.from(this.tasks.entries()))
      );
    } catch (error) {
      console.warn('Failed to persist tasks:', error);
    }
  }

  private loadPersistedTasks() {
    try {
      const stored = localStorage.getItem('background_sync_tasks');
      if (stored) {
        this.tasks = new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load persisted tasks:', error);
    }
  }

  clearTasks() {
    this.tasks.clear();
    this.persistTasks();
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.tasks.clear();
  }
}

export const backgroundSync = BackgroundSyncManager.getInstance();