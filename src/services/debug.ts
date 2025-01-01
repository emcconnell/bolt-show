type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'auth' | 'navigation' | 'session' | 'api';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  event: string;
  data?: any;
}

class DebugService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  constructor() {
    // Initialize with timestamp of service start
    this.log('debug', 'Debug Service Started', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log an event with associated data
   */
  log(category: LogCategory, event: string, data?: any, level: LogLevel = 'info') {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      event,
      data
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const style = this.getLogStyle(level);
      console.log(
        `%c[${entry.category.toUpperCase()}] ${entry.event}`,
        style,
        data || ''
      );
    }
  }

  /**
   * Get all logs for a category
   */
  getLogs(category?: LogCategory): LogEntry[] {
    if (category) {
      return this.logs.filter(log => log.category === category);
    }
    return this.logs;
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.log('debug', 'Logs Cleared');
  }

  /**
   * Get console style for log level
   */
  private getLogStyle(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return 'color: #666666';
      case 'info':
        return 'color: #0066cc';
      case 'warn':
        return 'color: #cc6600';
      case 'error':
        return 'color: #cc0000';
      default:
        return '';
    }
  }
}

export const debugService = new DebugService(); 