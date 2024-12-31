import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { projectStorage } from '../services/project-storage';
import type { Project } from '../types/project';

export function TrendingProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      const publicProjects = await projectStorage.getPublicProjects();
      setProjects(publicProjects);
    };
    loadProjects();
  }, []);

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-900/20 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 mb-12">
          <Zap className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold text-white">Trending Projects</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
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
      </div>
    </section>
  );
}