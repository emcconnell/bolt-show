interface ConflictResolution<T> {
  localData: T;
  remoteData: T;
  resolved: T;
  strategy: 'local' | 'remote' | 'merge';
}

class ConflictManager {
  private static instance: ConflictManager;
  private resolutionStrategies: Map<string, (local: any, remote: any) => any> = new Map();

  private constructor() {
    this.setupDefaultStrategies();
  }

  static getInstance(): ConflictManager {
    if (!ConflictManager.instance) {
      ConflictManager.instance = new ConflictManager();
    }
    return ConflictManager.instance;
  }

  private setupDefaultStrategies() {
    // Default timestamp-based strategy
    this.registerStrategy('timestamp', (local, remote) => {
      return local.updatedAt > remote.updatedAt ? local : remote;
    });

    // Default merge strategy for arrays
    this.registerStrategy('array-merge', (local, remote) => {
      return [...new Set([...local, ...remote])];
    });

    // Default object merge strategy
    this.registerStrategy('object-merge', (local, remote) => {
      return {
        ...remote,
        ...local,
        updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0)
      };
    });
  }

  registerStrategy<T>(name: string, resolver: (local: T, remote: T) => T) {
    this.resolutionStrategies.set(name, resolver);
  }

  async resolveConflict<T>(
    entityType: string,
    local: T,
    remote: T,
    strategy = 'timestamp'
  ): Promise<ConflictResolution<T>> {
    const resolver = this.resolutionStrategies.get(strategy);
    
    if (!resolver) {
      throw new Error(`No resolution strategy found for: ${strategy}`);
    }

    const resolved = resolver(local, remote);

    return {
      localData: local,
      remoteData: remote,
      resolved,
      strategy
    };
  }

  getStrategy(name: string) {
    return this.resolutionStrategies.get(name);
  }
}

export const conflictManager = ConflictManager.getInstance();