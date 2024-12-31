import { useState, useEffect } from 'react';
import { healthCheck } from '../utils/healthCheck';

export function useHealthCheck() {
  const [status, setStatus] = useState(() => healthCheck.getStatus());

  useEffect(() => {
    return healthCheck.subscribe(newStatus => {
      setStatus(newStatus);
    });
  }, []);

  return status;
}