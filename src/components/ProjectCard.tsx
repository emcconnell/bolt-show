import React, { useState } from 'react';
import { ExternalLink, Github, Edit, Heart, AlertCircle, Flag, CheckCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { likeStorage } from '../services/like-storage';
import { projectStorage } from '../services/project-storage';
import { ShareMenu } from './ShareMenu';
import { MediaDisplay } from './MediaDisplay';
import toast from 'react-hot-toast';
import type { ProjectLink, ProjectStatus } from '../types/project';

const STATUS_BADGES: Record<ProjectStatus, { icon: React.ReactNode; label: string; className: string }> = {
  waiting_approval: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Waiting Approval',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  },
  flagged: {
    icon: <Flag className="w-4 h-4" />,
    label: 'Flagged',
    className: 'bg-red-500/20 text-red-300 border-red-500/30'
  },
  approved: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Approved',
    className: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  changes_requested: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: 'Changes Requested',
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  }
};

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  likes: number;
  tags: string[];
  links: ProjectLink[];
  status?: ProjectStatus;
  adminNotes?: string;
}

export function ProjectCard({ id, title, description, image, author, likes, tags, links, status, adminNotes }: ProjectCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const githubLink = links.find(link => link.type === 'github')?.url;
  const demoLink = links.find(link => link.type === 'demo')?.url;
  const isOwner = user?.id === author;
  const [hasLiked, setHasLiked] = React.useState(likeStorage.hasLiked(id));
  const [currentLikes, setCurrentLikes] = React.useState(likes);
  
  // Use fallback immediately for blob URLs
  const displayImage = image?.startsWith('blob:') 
    ? 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1000'
    : image;

  const handleEdit = () => {
    navigate(`/submit?edit=${id}`);
  };

  const handleLike = async () => {
    if (hasLiked) {
      return;
    }

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

  return (
    <div className="group relative bg-white/10 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-white/10">
      <div 
        className="aspect-video overflow-hidden cursor-pointer"
        onClick={() => navigate(`/project/${id}`)}
      >
        <MediaDisplay
          src={displayImage}
          type="image"
          fallbackSrc="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1000"
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 
            className="text-xl font-semibold text-white hover:text-purple-400 cursor-pointer transition-colors"
            onClick={() => navigate(`/project/${id}`)}
          >
            {title}
          </h3>
          {isOwner && status && status !== 'approved' && (
            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border text-sm ${STATUS_BADGES[status].className}`}>
              {STATUS_BADGES[status].icon}
              <span>{STATUS_BADGES[status].label}</span>
            </div>
          )}
          <p className="text-gray-300 line-clamp-2">{description}</p>
          {isOwner && adminNotes && (
            <div className="mt-2 p-3 bg-gray-900/50 border border-white/10 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-orange-300 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Admin Notes</span>
              </div>
              <p className="text-sm text-gray-300">{adminNotes}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1 text-sm border border-white/20 text-white rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center space-x-1 transition-colors ${
                hasLiked 
                  ? 'text-purple-400 cursor-default' 
                  : 'text-gray-400 hover:text-purple-400'
              }`}
            >
              {hasLiked ? (
                <Heart className="w-5 h-5" fill="currentColor" />
              ) : (
                <Heart className="w-5 h-5" />
              )}
              <span>{currentLikes}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <ShareMenu
                title={title}
                description={description}
                url={window.location.origin + '/project/' + id}
              />
              {isOwner && (
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-purple-400 transition-colors"
                  title="Edit project"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              {githubLink && (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-purple-400 transition-colors"
                  title="View on GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {demoLink && (
                <a
                  href={demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-purple-400 transition-colors"
                  title="View live demo"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}