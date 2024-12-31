interface QueuedRequest {
  id: string;
  operation: 'create' | 'update' | 'delete';
  priority: QueuePriority;
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
}

class RequestQueueManager {
  private static instance: RequestQueueManager;
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxRetries = 3;
  private readonly QUEUE_KEY = 'bolt_request_queue';

  private constructor() {
    this.loadQueue();
    this.setupEventListeners();
  }

  static getInstance(): RequestQueueManager {
    if (!RequestQueueManager.instance) {
      RequestQueueManager.instance = new RequestQueueManager();
    }
    return RequestQueueManager.instance;
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load request queue:', error);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save request queue:', error);
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }

  enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0
    };

    this.queue.push(queuedRequest);
    this.saveQueue();

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Sort by priority and age
      this.queue.sort((a, b) => {
        const scoreA = queuePriority.calculateScore(a.priority, Date.now() - a.timestamp);
        const scoreB = queuePriority.calculateScore(b.priority, Date.now() - b.timestamp);
        return scoreB - scoreA;
      });

      const request = this.queue[0];

      try {
        await this.processRequest(request);
        this.queue.shift(); // Remove successful request
        this.saveQueue();
      } catch (error) {
        console.error('Failed to process request:', error);
        
        if (request.retries < this.maxRetries) {
          request.retries++;
          this.saveQueue();
        } else {
          // Remove failed request after max retries
          this.queue.shift();
          this.saveQueue();
        }

        // Stop processing on error
        break;
      }
    }

    this.processing = false;
  }

  private async processRequest(request: QueuedRequest): Promise<void> {
    // Implementation would depend on your API client
    // This is a placeholder for the actual implementation
    console.log('Processing request:', request);
    return Promise.resolve();
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const requestQueue = RequestQueueManager.getInstance();