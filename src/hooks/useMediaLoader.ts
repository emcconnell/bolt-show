import { useState, useEffect } from 'react';
import { useCleanup } from './useCleanup';

interface MediaLoaderOptions {
  url: string;
  fallbackUrl?: string;
  type: 'image' | 'video';
}

export function useMediaLoader({ url, fallbackUrl, type }: MediaLoaderOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [displayUrl, setDisplayUrl] = useState(url);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setDisplayUrl(url);
  }, [url]);

  // Cleanup blob URLs
  useCleanup(() => {
    if (displayUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(displayUrl);
    }
  });

  const handleError = () => {
    setError(true);
    setLoading(false);
    if (fallbackUrl) {
      setDisplayUrl(fallbackUrl);
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  return {
    loading,
    error,
    displayUrl,
    handleError,
    handleLoad
  };
}