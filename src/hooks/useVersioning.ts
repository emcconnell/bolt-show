import { useState, useEffect } from 'react';
import { versionManager } from '../utils/versionManager';

interface VersioningOptions<T> {
  key: string;
  initialData: T;
}

export function useVersioning<T>({ key, initialData }: VersioningOptions<T>) {
  const [currentVersion, setCurrentVersion] = useState(() => 
    versionManager.track(key, initialData)
  );

  const [history, setHistory] = useState(() => 
    versionManager.getHistory(key)
  );

  useEffect(() => {
    // Update history when version changes
    setHistory(versionManager.getHistory(key));
  }, [key, currentVersion]);

  const update = (data: T) => {
    const newVersion = versionManager.track(key, data);
    setCurrentVersion(newVersion);
    return newVersion;
  };

  const rollback = (version: number) => {
    const rolledBackData = versionManager.rollback<T>(key, version);
    if (rolledBackData) {
      setCurrentVersion(version);
      return rolledBackData;
    }
    return null;
  };

  return {
    currentVersion,
    history,
    update,
    rollback
  };
}