interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  timeout?: number;
}

class RetryManager {
  private static instance: RetryManager;
  private retryMap: Map<string, number> = new Map();
  private timeoutMap: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager();
    }
    return RetryManager.instance;
  }

  async withRetry<T>(
    key: string,
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      timeout = 30000
    } = options;

    const attempts = this.retryMap.get(key) || 0;
    
    if (attempts >= maxAttempts) {
      this.retryMap.delete(key);
      throw new Error(`Operation failed after ${maxAttempts} attempts`);
    }

    try {
      // Set timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Operation timed out'));
        }, timeout);
        this.timeoutMap.set(key, timeoutId);
      });

      // Race between operation and timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);

      // Clear timeout and retry count on success
      this.clearTimeout(key);
      this.retryMap.delete(key);
      
      return result;
    } catch (error) {
      this.clearTimeout(key);
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempts),
        maxDelay
      );

      this.retryMap.set(key, attempts + 1);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry recursively
      return this.withRetry(key, operation, options);
    }
  }

  private clearTimeout(key: string) {
    const timeoutId = this.timeoutMap.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutMap.delete(key);
    }
  }

  clearRetries(key: string) {
    this.retryMap.delete(key);
    this.clearTimeout(key);
  }
}

export const retryManager = RetryManager.getInstance();