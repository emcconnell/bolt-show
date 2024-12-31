import { useState, useCallback } from 'react';
import { integrityCheck } from '../utils/integrityCheck';

interface IntegrityCheckHookResult {
  validateData: (type: string, data: any) => Promise<boolean>;
  errors: string[];
  warnings: string[];
  isValidating: boolean;
}

export function useIntegrityCheck(): IntegrityCheckHookResult {
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateData = useCallback(async (type: string, data: any) => {
    setIsValidating(true);
    try {
      const result = await integrityCheck.validateData(type, data);
      setErrors(result.errors);
      setWarnings(result.warnings);
      return result.valid;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    validateData,
    errors,
    warnings,
    isValidating
  };
}