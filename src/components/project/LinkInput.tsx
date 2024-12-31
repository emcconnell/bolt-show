import React from 'react';
import { Link2, Github, Globe, Plus, X } from 'lucide-react';
import type { ProjectLink } from '../../types/project';

interface LinkInputProps {
  links: ProjectLink[];
  onLinksChange: (links: ProjectLink[]) => void;
  maxLinks?: number;
}

export function LinkInput({ links, onLinksChange, maxLinks = 5 }: LinkInputProps) {
  const addLink = () => {
    if (links.length < maxLinks) {
      onLinksChange([...links, { type: 'github', url: '' }]);
    }
  };

  const updateLink = (index: number, updates: Partial<ProjectLink>) => {
    const newLinks = links.map((link, i) => 
      i === index ? { ...link, ...updates } : link
    );
    onLinksChange(newLinks);
  };

  const removeLink = (index: number) => {
    onLinksChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {links.map((link, index) => (
        <div key={index} className="flex items-center gap-4">
          <select
            value={link.type}
            onChange={(e) => updateLink(index, { type: e.target.value as ProjectLink['type'] })}
            className="bg-gray-900/95 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="github" className="bg-gray-900">GitHub</option>
            <option value="demo" className="bg-gray-900">Live Demo</option>
            <option value="other" className="bg-gray-900">Other</option>
          </select>
          
          <div className="relative flex-1">
            {link.type === 'github' && <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
            {link.type === 'demo' && <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
            {link.type === 'other' && <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
            
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(index, { url: e.target.value })}
              placeholder={`Enter ${link.type} URL...`}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <button
            onClick={() => removeLink(index)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
      
      {links.length < maxLinks && (
        <button
          onClick={addLink}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Link</span>
        </button>
      )}
    </div>
  );
}