import React, { useCallback, useState, useEffect } from 'react';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';
import type { ProjectMedia } from '../../types/project';
import { useCleanup } from '../../hooks/useCleanup';
import { MediaDisplay } from '../MediaDisplay';

interface MediaUploadProps {
  media: ProjectMedia[];
  onMediaAdd: (newMedia: ProjectMedia) => void;
  onMediaRemove: (index: number) => void;
  maxFiles?: number;
}

export function MediaUpload({ media, onMediaAdd, onMediaRemove, maxFiles = 10 }: MediaUploadProps) {
  const [loadingMedia, setLoadingMedia] = useState<{ [key: string]: boolean }>({});
  const [loadErrors, setLoadErrors] = useState<{ [key: string]: boolean }>({});

  // Use custom cleanup hook to handle blob URLs
  useCleanup(() => {
    media.forEach(item => {
      if (item.url?.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });
  });

  const handleMediaError = (index: number) => {
    setLoadErrors(prev => ({ ...prev, [index]: true }));
    setLoadingMedia(prev => ({ ...prev, [index]: false }));
  };

  const handleMediaLoad = (index: number) => {
    setLoadingMedia(prev => ({ ...prev, [index]: false }));
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    setLoadErrors({});
    
    for (const file of files) {
      if (media.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        break;
      }

      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        alert('Only image and video files are allowed');
        continue;
      }

      const url = URL.createObjectURL(file);
      const mediaItem = {
        type: isVideo ? 'video' : 'image',
        url,
        title: file.name
      };

      setLoadingMedia(prev => ({ ...prev, [media.length]: true }));
      onMediaAdd(mediaItem);
    }
  }, [media, maxFiles, onMediaAdd]);


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <div key={index} className="relative group aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10">
            <MediaDisplay
              url={item.url}
              type={item.type}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {loadingMedia[index] && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            )}
            {loadErrors[index] && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center text-red-300">
                Failed to load media
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => onMediaRemove(index)}
                className="p-2 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
              {item.type === 'image' ? (
                <Image className="w-4 h-4 text-white/70" />
              ) : (
                <Video className="w-4 h-4 text-white/70" />
              )}
            </div>
          </div>
        ))}
        
        {media.length < maxFiles && (
          <label className="aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400/50 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">Add Media</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-sm text-gray-400">
        Upload up to {maxFiles} images or videos. Supported formats: PNG, JPG, GIF, MP4, WebM
      </p>
    </div>
  );
}