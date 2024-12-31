import React from 'react';
import { useState } from 'react';
import { DEFAULT_PROFILE_IMAGES } from '../../services/default-images';
import { AlertCircle } from 'lucide-react';

interface DefaultAvatarPickerProps {
  onSelect: (imageUrl: string) => void;
  currentImage?: string;
}

interface ImageLoadState {
  [key: string]: boolean;
}

export function DefaultAvatarPicker({ onSelect, currentImage }: DefaultAvatarPickerProps) {
  const [loadErrors, setLoadErrors] = useState<ImageLoadState>({});

  const handleImageError = (imageId: string) => {
    setLoadErrors(prev => ({ ...prev, [imageId]: true }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300">Default Profile Pictures</h3>
      <div className="grid grid-cols-3 gap-4">
        {DEFAULT_PROFILE_IMAGES.map((image) => !loadErrors[image.id] && (
          <button
            key={image.id}
            onClick={() => onSelect(image.url)}
            className={`relative aspect-square rounded-lg overflow-hidden border border-white transition-all ${
              currentImage === image.url
                ? 'border-purple-500 ring-2 ring-purple-500/50'
                : 'border-white/10 hover:border-white/30'
            }`}
            title={image.description}
          >
            <img
              src={image.url}
              alt={image.description}
              onError={() => handleImageError(image.id)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
        {Object.keys(loadErrors).length === DEFAULT_PROFILE_IMAGES.length && (
          <div className="col-span-3 text-center text-red-400 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to load default avatars</span>
          </div>
        )}
      </div>
    </div>
  );
}