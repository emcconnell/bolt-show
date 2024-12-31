interface ErrorRecoveryStrategy {
  canRecover: (error: Error) => boolean;
  recover: (error: Error, context: any) => Promise<void>;
}

class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private strategies: Map<string, ErrorRecoveryStrategy> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();
  private readonly MAX_ATTEMPTS = 3;

  private constructor() {
    this.setupDefaultStrategies();
  }

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  private setupDefaultStrategies() {
    // Network error recovery
    this.registerStrategy('network', {
      canRecover: (error) => error.name === 'NetworkError' || error.message.includes('network'),
      recover: async (error, context) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (context.retry) {
          await context.retry();
        }
      }
    });

    // Stale data recovery
    this.registerStrategy('stale-data', {
      canRecover: (error) => error.message.includes('stale') || error.message.includes('outdated'),
      recover: async (error, context) => {
        if (context.refresh) {
          await context.refresh();
        }
      }
    });

    // Authentication error recovery
    this.registerStrategy('auth', {
      canRecover: (error) => error.message.includes('unauthorized') || error.message.includes('unauthenticated'),
      recover: async (error, context) => {
        if (context.refreshAuth) {
          await context.refreshAuth();
        }
      }
    });
  }

  registerStrategy(name: string, strategy: ErrorRecoveryStrategy) {
    this.strategies.set(name, strategy);
  }

  async attemptRecovery(error: Error, context: any): Promise<boolean> {
    const errorKey = `${error.name}_${error.message}`;
    const attempts = this.recoveryAttempts.get(errorKey) || 0;

    if (attempts >= this.MAX_ATTEMPTS) {
      console.warn(`Max recovery attempts reached for error: ${errorKey}`);
      return false;
    }

    for (const [name, strategy] of this.strategies.entries()) {
      if (strategy.canRecover(error)) {
        try {
          await strategy.recover(error, context);
          this.recoveryAttempts.set(errorKey, attempts + 1);
          return true;
        } catch (recoveryError) {
          console.error(`Recovery strategy ${name} failed:`, recoveryError);
        }
      }
    }

    return false;
  }

  clearRecoveryAttempts() {
    this.recoveryAttempts.clear();
  }
}

export const errorRecovery = ErrorRecoveryManager.getInstance();