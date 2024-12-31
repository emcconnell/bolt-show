import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  label: string;
  maxSize?: number; // in MB
  accept?: string;
}

export function ImageUpload({
  currentImage,
  onImageSelect,
  onImageRemove,
  label,
  maxSize = 2,
  accept = "image/jpeg,image/png"
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    onImageSelect(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>

      {currentImage ? (
        <div className="space-y-4">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white">
            <img
              src={currentImage}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onImageRemove}
            className="w-32 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 border border-dashed border-white rounded-lg flex flex-col items-center justify-center space-y-2 hover:border-purple-400/50 transition-colors"
        >
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-sm text-gray-400">Click to upload</span>
          <span className="text-xs text-gray-500">Max {maxSize}MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}