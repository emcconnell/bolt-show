interface BatchConfig {
  maxSize: number;
  maxDelay: number;
  minSize: number;
}

class BatchProcessor {
  private static instance: BatchProcessor;
  private batches: Map<string, any[]> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private configs: Map<string, BatchConfig> = new Map();

  private constructor() {
    this.setupDefaultConfigs();
  }

  static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor();
    }
    return BatchProcessor.instance;
  }

  private setupDefaultConfigs() {
    this.configs.set('default', {
      maxSize: 50,
      maxDelay: 1000,
      minSize: 10
    });
  }

  setConfig(key: string, config: Partial<BatchConfig>) {
    const currentConfig = this.configs.get('default')!;
    this.configs.set(key, { ...currentConfig, ...config });
  }

  add<T>(key: string, item: T, processor: (items: T[]) => Promise<void>) {
    if (!this.batches.has(key)) {
      this.batches.set(key, []);
    }

    const batch = this.batches.get(key)!;
    batch.push(item);

    const config = this.configs.get(key) || this.configs.get('default')!;

    // Process immediately if batch is full
    if (batch.length >= config.maxSize) {
      this.processBatch(key, processor);
      return;
    }

    // Set/reset timeout for delayed processing
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    this.timeouts.set(key, setTimeout(() => {
      if (batch.length >= config.minSize) {
        this.processBatch(key, processor);
      }
    }, config.maxDelay));
  }

  private async processBatch<T>(key: string, processor: (items: T[]) => Promise<void>) {
    const batch = this.batches.get(key) || [];
    if (batch.length === 0) return;

    this.batches.set(key, []);
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }

    try {
      await processor(batch);
    } catch (error) {
      console.error(`Failed to process batch ${key}:`, error);
      // Requeue failed items
      const currentBatch = this.batches.get(key) || [];
      this.batches.set(key, [...batch, ...currentBatch]);
    }
  }

  flush(key: string) {
    this.batches.delete(key);
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }
}

export const batchProcessor = BatchProcessor.getInstance();