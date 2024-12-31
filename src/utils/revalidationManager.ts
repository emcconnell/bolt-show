interface RevalidationConfig {
  key: string;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateInterval?: number;
}

class RevalidationManager {
  private static instance: RevalidationManager;
  private configs: Map<string, RevalidationConfig> = new Map();
  private revalidationCallbacks: Map<string, () => Promise<void>> = new Map();
  private intervals: Map<string, number> = new Map();

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): RevalidationManager {
    if (!RevalidationManager.instance) {
      RevalidationManager.instance = new RevalidationManager();
    }
    return RevalidationManager.instance;
  }

  private setupEventListeners() {
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.revalidateAll('focus');
      }
    });

    // Handle online/offline
    window.addEventListener('online', () => {
      this.revalidateAll('reconnect');
    });
  }

  register(config: RevalidationConfig, callback: () => Promise<void>) {
    this.configs.set(config.key, config);
    this.revalidationCallbacks.set(config.key, callback);

    // Setup interval if needed
    if (config.revalidateInterval) {
      this.setupInterval(config.key, config.revalidateInterval);
    }

    return () => this.unregister(config.key);
  }

  private setupInterval(key: string, interval: number) {
    if (this.intervals.has(key)) {
      window.clearInterval(this.intervals.get(key));
    }
    
    const id = window.setInterval(() => {
      this.revalidate(key);
    }, interval);
    
    this.intervals.set(key, id);
  }

  private async revalidate(key: string) {
    const callback = this.revalidationCallbacks.get(key);
    if (callback) {
      try {
        await callback();
      } catch (error) {
        console.error(`Revalidation failed for ${key}:`, error);
      }
    }
  }

  private async revalidateAll(trigger: 'focus' | 'reconnect') {
    for (const [key, config] of this.configs.entries()) {
      if (
        (trigger === 'focus' && config.revalidateOnFocus) ||
        (trigger === 'reconnect' && config.revalidateOnReconnect)
      ) {
        await this.revalidate(key);
      }
    }
  }

  unregister(key: string) {
    this.configs.delete(key);
    this.revalidationCallbacks.delete(key);
    
    if (this.intervals.has(key)) {
      window.clearInterval(this.intervals.get(key));
      this.intervals.delete(key);
    }
  }
}

export const revalidationManager = RevalidationManager.getInstance();