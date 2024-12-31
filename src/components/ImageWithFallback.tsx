import React from 'react';
import { useImageFallback } from '../hooks/useImageFallback';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc: string;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  maxRetries = 1,
  onError,
  alt,
  className,
  ...props
}: ImageWithFallbackProps) {
  const { imageSrc, handleError } = useImageFallback({
    src,
    fallbackSrc,
    maxRetries,
    onError
  });

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.preventDefault();
        handleError(new Error(`Failed to load image: ${src}`));
      }}
      {...props}
    />
  );
}