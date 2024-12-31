export type QueuePriority = 'high' | 'medium' | 'low';

interface PriorityConfig {
  weight: number;
  timeout: number;
  retries: number;
}

class QueuePriorityManager {
  private static instance: QueuePriorityManager;
  private priorities: Map<QueuePriority, PriorityConfig>;

  private constructor() {
    this.priorities = new Map([
      ['high', { weight: 3, timeout: 5000, retries: 5 }],
      ['medium', { weight: 2, timeout: 10000, retries: 3 }],
      ['low', { weight: 1, timeout: 15000, retries: 2 }]
    ]);
  }

  static getInstance(): QueuePriorityManager {
    if (!QueuePriorityManager.instance) {
      QueuePriorityManager.instance = new QueuePriorityManager();
    }
    return QueuePriorityManager.instance;
  }

  getPriorityConfig(priority: QueuePriority): PriorityConfig {
    return this.priorities.get(priority) || this.priorities.get('low')!;
  }

  calculateScore(priority: QueuePriority, age: number): number {
    const config = this.getPriorityConfig(priority);
    return config.weight * (1 + age / 1000); // Age boost factor
  }
}

export const queuePriority = QueuePriorityManager.getInstance();