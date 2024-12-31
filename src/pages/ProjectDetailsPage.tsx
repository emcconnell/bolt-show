import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Github, ChevronLeft, Heart, Pencil } from 'lucide-react';
import { projectStorage } from '../services/project-storage';
import { likeStorage } from '../services/like-storage';
import { useAuth } from '../hooks/useAuth';
import { ShareMenu } from '../components/ShareMenu';
import toast from 'react-hot-toast';
import type { Project } from '../types/project';

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = React.useState(id ? likeStorage.hasLiked(id) : false);
  const [currentLikes, setCurrentLikes] = React.useState(0);

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      setError(null);

      if (id) {
        try {
          const projectData = await projectStorage.getProjectById(id);
          if (!projectData) {
            setError('Project not found');
            return;
          }

          // Only show non-approved projects to admins and project owners
          if (projectData.status !== 'approved' && 
              (!user || (user.id !== projectData.userId && user.role !== 'admin'))) {
            setError('This project is not publicly available');
            return;
          }

          setProject(projectData);
          setCurrentLikes(projectData.likes);
        } catch (err) {
          setError('Failed to load project');
          console.error('Error loading project:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadProject();
  }, [id]);

  const handleLike = async () => {
    if (!id || hasLiked || !project) return;

    try {
      const success = await likeStorage.likeProject(id);
      if (success) {
        const updatedProject = await projectStorage.updateProject(id, { likes: currentLikes + 1 });
        setCurrentLikes(updatedProject.likes);
        setHasLiked(true);
        toast.success('Thanks for the love! 💜');
      }
    } catch (error) {
      console.error('Failed to like project:', error);
      toast.error('Failed to like project. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p className="text-gray-400">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">{error}</p>
          <Link 
            to="/explore" 
            className="inline-block mt-4 text-purple-400 hover:text-purple-300"
          >
            Browse other projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p className="text-gray-400">Project not found</p>
      </div>
    );
  }

  const githubLink = project.links.find(link => link.type === 'github')?.url;
  const demoLink = project.links.find(link => link.type === 'demo')?.url;
  const isOwner = user?.id === project.userId;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            to="/explore" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Projects
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={project.media[0]?.url || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1000'}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">{project.title}</h1>
              <div className="flex items-center space-x-4">
                {isOwner && (
                  <button
                    onClick={() => navigate(`/submit?edit=${project.id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                    <span>Edit Project</span>
                  </button>
                )}
                <button 
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    hasLiked 
                      ? 'bg-purple-500/20 text-purple-400 cursor-default' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-purple-400'
                  }`}
                >
                  {hasLiked ? (
                    <Heart className="w-5 h-5" fill="currentColor" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                  <span>{currentLikes}</span>
                </button>
                <ShareMenu
                  title={project.title}
                  description={project.shortDescription}
                  url={window.location.href}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm border border-white/20 text-white rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">{project.description}</p>
            </div>

            {project.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {project.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Technologies Used</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 text-sm text-gray-300 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {(githubLink || demoLink) && (
              <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                {githubLink && (
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span>View on GitHub</span>
                  </a>
                )}
                {demoLink && (
                  <a
                    href={demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Live Demo</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}