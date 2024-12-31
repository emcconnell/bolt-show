import React, { useState, KeyboardEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { tagStorage } from '../../services/tag-storage';
import type { Tag } from '../../types/tag';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({ tags, onTagsChange, placeholder = 'Add tags...', maxTags = 2 }: TagInputProps) {
  const [input, setInput] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadTags = async () => {
      const allTags = await tagStorage.getAllTags();
      setAvailableTags(allTags);
    };
    loadTags();
  }, []);

  const handleTagSelect = (tagName: string) => {
    if (tags.length < maxTags && !tags.includes(tagName)) {
      onTagsChange([...tags, tagName]);
    }
    setInput('');
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowDropdown(true);
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const filteredTags = availableTags
    .filter(tag => 
      tag.name.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(tag.name)
    );

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-2 bg-white/5 border border-white/10 rounded-lg min-h-[42px]">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => removeTag(index)}
                className="p-0.5 hover:bg-purple-500/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={tags.length < maxTags ? placeholder : `Maximum ${maxTags} tags`}
            disabled={tags.length >= maxTags}
            className="flex-1 min-w-[120px] bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
        
        {showDropdown && input && filteredTags.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-900/95 border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag.name)}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition-colors"
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400">
        Select up to {maxTags} tags from the available options.
      </p>
    </div>
  );
}