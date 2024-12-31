interface VersionedData<T> {
  data: T;
  version: number;
  timestamp: number;
}

class VersionManager {
  private static instance: VersionManager;
  private versions: Map<string, VersionedData<any>[]> = new Map();
  private maxVersions = 10;

  private constructor() {}

  static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  track<T>(key: string, data: T): number {
    if (!this.versions.has(key)) {
      this.versions.set(key, []);
    }

    const versions = this.versions.get(key)!;
    const newVersion = versions.length + 1;

    versions.push({
      data,
      version: newVersion,
      timestamp: Date.now()
    });

    // Keep only recent versions
    if (versions.length > this.maxVersions) {
      versions.shift();
    }

    return newVersion;
  }

  getVersion<T>(key: string, version: number): T | null {
    const versions = this.versions.get(key);
    if (!versions) return null;

    const versionData = versions.find(v => v.version === version);
    return versionData ? versionData.data : null;
  }

  getLatestVersion<T>(key: string): T | null {
    const versions = this.versions.get(key);
    if (!versions || versions.length === 0) return null;

    return versions[versions.length - 1].data;
  }

  rollback<T>(key: string, version: number): T | null {
    const targetVersion = this.getVersion<T>(key, version);
    if (targetVersion) {
      return this.track(key, targetVersion);
    }
    return null;
  }

  getHistory(key: string): VersionedData<any>[] {
    return this.versions.get(key) || [];
  }
}

export const versionManager = VersionManager.getInstance();