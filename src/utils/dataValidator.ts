interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: number;
  entityType: string;
}

class DataValidationManager {
  private static instance: DataValidationManager;
  private validationResults: Map<string, ValidationResult> = new Map();
  private validationInterval?: number;
  private listeners: Set<(results: ValidationResult[]) => void> = new Set();

  private constructor() {
    this.startPeriodicValidation();
  }

  static getInstance(): DataValidationManager {
    if (!DataValidationManager.instance) {
      DataValidationManager.instance = new DataValidationManager();
    }
    return DataValidationManager.instance;
  }

  private startPeriodicValidation() {
    // Run validation every 5 minutes
    this.validationInterval = window.setInterval(() => {
      this.validateAllData();
    }, 5 * 60 * 1000);
  }

  private async validateAllData() {
    const results: ValidationResult[] = [];

    // Validate cached data
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('page_cache_')) {
        try {
          const cached = JSON.parse(sessionStorage.getItem(key) || '');
          const result = await this.validateData(key.replace('page_cache_', ''), cached.data);
          results.push(result);
        } catch (error) {
          console.warn(`Failed to validate cached data for ${key}:`, error);
        }
      }
    }

    // Notify listeners
    this.notifyListeners(results);
  }

  private async validateData(entityType: string, data: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!data || typeof data !== 'object') {
      errors.push('Invalid data structure');
    }

    // Type-specific validation
    switch (entityType) {
      case 'profile':
        if (!data.userId) errors.push('Missing userId');
        if (!data.displayName) errors.push('Missing displayName');
        if (data.email && !this.isValidEmail(data.email)) {
          errors.push('Invalid email format');
        }
        break;

      case 'project':
        if (!data.title) errors.push('Missing title');
        if (!data.description) errors.push('Missing description');
        if (!Array.isArray(data.tags)) errors.push('Invalid tags structure');
        if (!Array.isArray(data.media)) errors.push('Invalid media structure');
        break;

      case 'settings':
        if (data.email && !this.isValidEmail(data.email)) {
          errors.push('Invalid email format');
        }
        break;
    }

    // Check for stale data
    const timestamp = data.updatedAt || data.createdAt;
    if (timestamp && Date.now() - new Date(timestamp).getTime() > 24 * 60 * 60 * 1000) {
      warnings.push('Data might be stale');
    }

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      timestamp: Date.now(),
      entityType
    };

    this.validationResults.set(entityType, result);
    return result;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private notifyListeners(results: ValidationResult[]) {
    this.listeners.forEach(listener => listener(results));
  }

  subscribe(listener: (results: ValidationResult[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getValidationResult(entityType: string): ValidationResult | null {
    return this.validationResults.get(entityType) || null;
  }

  clearValidationResults() {
    this.validationResults.clear();
  }

  destroy() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
    this.listeners.clear();
  }
}

export const dataValidator = DataValidationManager.getInstance();