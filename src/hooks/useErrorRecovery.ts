import { useState, useCallback } from 'react';
import { errorRecovery } from '../utils/errorRecovery';

interface ErrorRecoveryHookResult {
  attemptRecovery: (error: Error, context: any) => Promise<boolean>;
  isRecovering: boolean;
  recoveryAttempts: number;
}

export function useErrorRecovery(): ErrorRecoveryHookResult {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);

  const attemptRecovery = useCallback(async (error: Error, context: any) => {
    setIsRecovering(true);
    setRecoveryAttempts(prev => prev + 1);

    try {
      return await errorRecovery.attemptRecovery(error, context);
    } finally {
      setIsRecovering(false);
    }
  }, []);

  return {
    attemptRecovery,
    isRecovering,
    recoveryAttempts
  };
}