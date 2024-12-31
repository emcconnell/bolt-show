import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { tagStorage } from '../../services/tag-storage';
import type { Tag } from '../../types/tag';

export function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const allTags = await tagStorage.getAllTags();
    setTags(allTags);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTag.trim()) {
      toast.error('Tag name cannot be empty');
      return;
    }

    try {
      await tagStorage.createTag(newTag.trim());
      await loadTags();
      setNewTag('');
      toast.success('Tag added successfully');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await tagStorage.deleteTag(tagId);
      await loadTags();
      toast.success('Tag deleted successfully');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddTag} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter new tag name..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Tag</span>
          </button>
        </div>

      </form>

      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
          >
            <span className="text-white">{tag.name}</span>
            <button
              onClick={() => handleDeleteTag(tag.id)}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}