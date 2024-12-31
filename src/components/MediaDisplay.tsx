import React from 'react';
import { Loader2 } from 'lucide-react';
import { useMediaLoader } from '../hooks/useMediaLoader';

interface MediaDisplayProps {
  url: string;
  type: 'image' | 'video';
  fallbackSrc?: string;
  alt?: string;
  className?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1000';

export function MediaDisplay({ url, type, fallbackSrc, alt, className = '' }: MediaDisplayProps) {
  // If no URL provided, show fallback immediately
  if (!url && fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt || 'Media content'}
        className={className}
        loading="lazy"
      />
    );
  }

  const { loading, error, displayUrl, handleError, handleLoad } = useMediaLoader({
    url: url || '',
    fallbackUrl: fallbackSrc,
    type
  });

  // If URL is a blob and we have a fallback, use it immediately
  if (url?.startsWith('blob:')) {
    return (
      <img
        src={fallbackSrc || FALLBACK_IMAGE}
        alt={alt || 'Media content'}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <div className="relative">
      {type === 'image' ? (
        <img
          src={displayUrl}
          alt={alt || 'Media content'}
          className={`${className} ${error ? 'opacity-50' : ''}`}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
        />
      ) : (
        <video
          src={displayUrl}
          className={`${className} ${error ? 'opacity-50' : ''}`}
          onError={handleError}
          onLoadedData={handleLoad}
        />
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      )}
      
      {error && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
          <span className="text-sm text-red-300">Failed to load media</span>
        </div>
      )}
    </div>
  );
}