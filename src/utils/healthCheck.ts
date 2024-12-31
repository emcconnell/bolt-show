interface HealthStatus {
  healthy: boolean;
  lastCheck: number;
  issues: string[];
  services: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'down';
      latency: number;
    };
  };
}

class HealthCheckManager {
  private static instance: HealthCheckManager;
  private status: HealthStatus = {
    healthy: true,
    lastCheck: Date.now(),
    issues: [],
    services: {}
  };
  private listeners: Set<(status: HealthStatus) => void> = new Set();
  private checkInterval?: number;

  private constructor() {
    this.startPeriodicChecks();
  }

  static getInstance(): HealthCheckManager {
    if (!HealthCheckManager.instance) {
      HealthCheckManager.instance = new HealthCheckManager();
    }
    return HealthCheckManager.instance;
  }

  private startPeriodicChecks() {
    this.checkInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  private async performHealthCheck() {
    const startTime = performance.now();
    const issues: string[] = [];
    const services: HealthStatus['services'] = {};

    // Check IndexedDB
    try {
      const request = indexedDB.open('health_check');
      await new Promise((resolve, reject) => {
        request.onerror = () => reject(new Error('IndexedDB unavailable'));
        request.onsuccess = () => {
          request.result.close();
          resolve(true);
        };
      });
      services.indexedDB = { status: 'healthy', latency: 0 };
    } catch (error) {
      issues.push('IndexedDB unavailable');
      services.indexedDB = { status: 'down', latency: 0 };
    }

    // Check localStorage
    try {
      localStorage.setItem('health_check', 'test');
      localStorage.removeItem('health_check');
      services.localStorage = { status: 'healthy', latency: 0 };
    } catch (error) {
      issues.push('localStorage unavailable');
      services.localStorage = { status: 'down', latency: 0 };
    }

    // Check network connectivity
    try {
      const networkStart = performance.now();
      const response = await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        cache: 'no-store'
      });
      const latency = performance.now() - networkStart;
      services.network = {
        status: latency > 1000 ? 'degraded' : 'healthy',
        latency
      };
    } catch (error) {
      issues.push('Network connectivity issues');
      services.network = { status: 'down', latency: 0 };
    }

    // Update status
    this.status = {
      healthy: issues.length === 0,
      lastCheck: Date.now(),
      issues,
      services
    };

    // Notify listeners
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.status));
  }

  subscribe(listener: (status: HealthStatus) => void) {
    this.listeners.add(listener);
    listener(this.status); // Initial status
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStatus(): HealthStatus {
    return { ...this.status };
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners.clear();
  }
}

export const healthCheck = HealthCheckManager.getInstance();