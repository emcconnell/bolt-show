import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { useDataLoader } from '../hooks/useDataLoader';
import { LoadingState } from '../components/LoadingState';
import { projectStorage } from '../services/project-storage';
import { tagStorage } from '../services/tag-storage';
import { usePageCache } from '../utils/pageCache';
import { useProtectedNavigation } from '../hooks/useProtectedNavigation';
import type { Project } from '../types/project';
import type { Tag } from '../types/tag';


export function ExplorePage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("hearts");
  const [data, setData] = useState<{projects: Project[], tags: Tag[]}>({
    projects: [],
    tags: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, tagsData] = await Promise.all([
          projectStorage.getPublicProjects(),
          tagStorage.getAllTags()
        ]);
        setData({
          projects: projectsData.filter(p => !p.media?.[0]?.url?.startsWith('blob:')),
          tags: tagsData
        });
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data');
      }
    };
    loadData();
  }, []);

  const handleTagClick = (tagName: string) => {
    if (tagName === 'All') {
      setSelectedTags([]);
      return;
    }

    setSelectedTags(prev => {
      const newTags = prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName];
      return newTags;
    });
  };

  const filteredProjects = data.projects.filter(project => {
    const matchesTags = selectedTags.length === 0 || // Show all if no tags selected
      project.tags.some(tag => selectedTags.includes(tag));
    
    return matchesTags;
  });

  // Sort projects after filtering
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "hearts") {
      return b.likes - a.likes;
    }
    // For "newest", compare the actual Date objects
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSortBy('hearts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'hearts'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Most Hearts
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'newest'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Newest
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTagClick('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTags.length === 0
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {data.tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTags.includes(tag.name)
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(sortedProjects || []).map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.shortDescription}
                image={project.media[0]?.url || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1000'}
                author={project.userId}
                likes={project.likes}
                tags={project.tags}
                links={project.links}
              />
            ))}
          </div>

          {(!sortedProjects || sortedProjects.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}