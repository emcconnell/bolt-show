interface IntegrityCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: number;
}

class IntegrityCheckManager {
  private static instance: IntegrityCheckManager;
  private checksums: Map<string, string> = new Map();
  private validationRules: Map<string, (data: any) => string[]> = new Map();

  private constructor() {
    this.setupDefaultRules();
  }

  static getInstance(): IntegrityCheckManager {
    if (!IntegrityCheckManager.instance) {
      IntegrityCheckManager.instance = new IntegrityCheckManager();
    }
    return IntegrityCheckManager.instance;
  }

  private setupDefaultRules() {
    // Profile validation
    this.validationRules.set('profile', (data) => {
      const errors: string[] = [];
      if (!data.userId) errors.push('Missing userId');
      if (!data.displayName) errors.push('Missing displayName');
      return errors;
    });

    // Project validation
    this.validationRules.set('project', (data) => {
      const errors: string[] = [];
      if (!data.title) errors.push('Missing title');
      if (!data.description) errors.push('Missing description');
      if (!Array.isArray(data.tags)) errors.push('Invalid tags');
      return errors;
    });
  }

  addValidationRule(type: string, rule: (data: any) => string[]) {
    this.validationRules.set(type, rule);
  }

  async validateData(type: string, data: any): Promise<IntegrityCheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Apply type-specific validation rules
    const rule = this.validationRules.get(type);
    if (rule) {
      errors.push(...rule(data));
    }

    // Check data structure
    if (typeof data !== 'object' || data === null) {
      errors.push('Invalid data structure');
    }

    // Check for required metadata
    if (data.id === undefined) {
      warnings.push('Missing id field');
    }
    if (data.createdAt === undefined) {
      warnings.push('Missing createdAt timestamp');
    }

    // Generate and verify checksum
    const newChecksum = await this.generateChecksum(data);
    const storedChecksum = this.checksums.get(type);
    
    if (storedChecksum && storedChecksum !== newChecksum) {
      warnings.push('Data integrity mismatch');
    }

    // Store new checksum
    this.checksums.set(type, newChecksum);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      timestamp: Date.now()
    };
  }

  private async generateChecksum(data: any): Promise<string> {
    const str = JSON.stringify(data);
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  clearChecksums() {
    this.checksums.clear();
  }
}

export const integrityCheck = IntegrityCheckManager.getInstance();