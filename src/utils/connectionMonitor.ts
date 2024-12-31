interface ConnectionState {
  online: boolean;
  lastChecked: number;
  latency: number;
}

class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private state: ConnectionState = {
    online: navigator.onLine,
    lastChecked: Date.now(),
    latency: 0
  };
  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private checkInterval?: number;
  private readonly PING_URL = 'https://www.google.com/favicon.ico';

  private constructor() {
    this.setupEventListeners();
    this.startPeriodicCheck();
  }

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  private setupEventListeners() {
    window.addEventListener('online', () => this.updateState(true));
    window.addEventListener('offline', () => this.updateState(false));
    
    // Check connection when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkConnection();
      }
    });
  }

  private startPeriodicCheck() {
    this.checkInterval = window.setInterval(() => {
      this.checkConnection();
    }, 30000); // Check every 30 seconds
  }

  private async checkConnection() {
    const startTime = performance.now();
    
    try {
      const response = await fetch(this.PING_URL, {
        mode: 'no-cors',
        cache: 'no-store'
      });
      
      const latency = performance.now() - startTime;
      this.updateState(true, latency);
    } catch (error) {
      this.updateState(false);
    }
  }

  private updateState(online: boolean, latency?: number) {
    this.state = {
      online,
      lastChecked: Date.now(),
      latency: latency || this.state.latency
    };
    
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: ConnectionState) => void) {
    this.listeners.add(listener);
    listener(this.state); // Initial state
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners.clear();
  }
}

export const connectionMonitor = ConnectionMonitor.getInstance();