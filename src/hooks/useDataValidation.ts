import { useState, useEffect } from 'react';
import { dataValidator } from '../utils/dataValidator';

export function useDataValidation(entityType: string) {
  const [validationResult, setValidationResult] = useState(() => 
    dataValidator.getValidationResult(entityType)
  );

  useEffect(() => {
    return dataValidator.subscribe(results => {
      const result = results.find(r => r.entityType === entityType);
      if (result) {
        setValidationResult(result);
      }
    });
  }, [entityType]);

  return validationResult;
}