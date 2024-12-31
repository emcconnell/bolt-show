import { useState, useCallback } from 'react';

interface ImageFallbackOptions {
  src: string;
  fallbackSrc: string;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

export function useImageFallback({
  src,
  fallbackSrc,
  maxRetries = 1,
  onError
}: ImageFallbackOptions) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback((error: Error) => {
    if (retryCount < maxRetries) {
      // Retry with original source
      setRetryCount(prev => prev + 1);
      setCurrentSrc(`${src}?retry=${retryCount + 1}`);
    } else {
      // Switch to fallback after max retries
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.(error);
    }
  }, [src, fallbackSrc, maxRetries, retryCount, onError]);

  return {
    imageSrc: currentSrc,
    hasError,
    handleError
  };
}