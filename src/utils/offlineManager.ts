interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineManager {
  private static instance: OfflineManager;
  private actions: Map<string, OfflineAction> = new Map();
  private readonly STORAGE_KEY = 'offline_actions';

  private constructor() {
    this.loadActions();
    this.setupEventListeners();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.syncActions();
    });
  }

  private loadActions() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.actions = new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load offline actions:', error);
    }
  }

  private saveActions() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(Array.from(this.actions.entries()))
      );
    } catch (error) {
      console.warn('Failed to save offline actions:', error);
    }
  }

  recordAction(type: string, data: any) {
    const action: OfflineAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    this.actions.set(action.id, action);
    this.saveActions();

    if (navigator.onLine) {
      this.syncActions();
    }
  }

  private async syncActions() {
    const unsynced = Array.from(this.actions.values())
      .filter(action => !action.synced)
      .sort((a, b) => a.timestamp - b.timestamp);

    for (const action of unsynced) {
      try {
        await this.processAction(action);
        action.synced = true;
        this.saveActions();
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }

    // Clean up old synced actions
    this.cleanup();
  }

  private async processAction(action: OfflineAction): Promise<void> {
    // Implementation would depend on action type
    switch (action.type) {
      case 'UPDATE_PROFILE':
        // Handle profile update
        break;
      case 'SUBMIT_PROJECT':
        // Handle project submission
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private cleanup() {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const [id, action] of this.actions.entries()) {
      if (action.synced && now - action.timestamp > maxAge) {
        this.actions.delete(id);
      }
    }
    this.saveActions();
  }
}

export const offlineManager = OfflineManager.getInstance();