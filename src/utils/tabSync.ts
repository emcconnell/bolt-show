interface TabSyncMessage {
  type: 'AUTH_STATE_CHANGE' | 'CACHE_INVALIDATE' | 'DATA_UPDATE';
  key?: string;
  data?: any;
  timestamp: number;
}

class TabSyncManager {
  private static instance: TabSyncManager;
  private channel: BroadcastChannel;
  private listeners: Map<string, Set<(data: any) => void>>;

  private constructor() {
    this.channel = new BroadcastChannel('bolt_showcase_sync');
    this.listeners = new Map();
    this.setupEventListeners();
  }

  static getInstance(): TabSyncManager {
    if (!TabSyncManager.instance) {
      TabSyncManager.instance = new TabSyncManager();
    }
    return TabSyncManager.instance;
  }

  private setupEventListeners() {
    this.channel.onmessage = (event: MessageEvent<TabSyncMessage>) => {
      const { type, key, data, timestamp } = event.data;

      switch (type) {
        case 'AUTH_STATE_CHANGE':
          window.dispatchEvent(new CustomEvent('auth_state_change', { detail: data }));
          break;

        case 'CACHE_INVALIDATE':
          if (key) {
            const listeners = this.listeners.get(key);
            listeners?.forEach(listener => listener(data));
          }
          break;

        case 'DATA_UPDATE':
          if (key) {
            const listeners = this.listeners.get(key);
            listeners?.forEach(listener => listener(data));
          }
          break;
      }
    };
  }

  subscribe(key: string, callback: (data: any) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
      if (this.listeners.get(key)?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  broadcast(message: Omit<TabSyncMessage, 'timestamp'>) {
    this.channel.postMessage({
      ...message,
      timestamp: Date.now()
    });
  }

  destroy() {
    this.channel.close();
    this.listeners.clear();
  }
}

export const tabSync = TabSyncManager.getInstance();