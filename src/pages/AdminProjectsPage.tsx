import React, { useEffect, useState } from 'react';
import { FolderGit2, AlertCircle, Flag, CheckCircle, MessageSquare } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { projectStorage } from '../services/project-storage';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDataLoader } from '../hooks/useDataLoader';
import { ProjectStatusChange } from '../components/admin/ProjectStatusChange';
import type { Project, ProjectStatus } from '../types/project';

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

export function AdminProjectsPage() {
  useScrollToTop();
  const { user } = useAuth();
  const { data, loading, error, reload } = useDataLoader({
    loadData: projectStorage.getAllProjects,
    requireAuth: true,
    loadingMessage: 'Loading projects...',
    cacheKey: 'admin_projects'
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 text-gray-400">
            Loading projects...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 text-red-400">
            Error loading projects: {error}
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus, notes?: string) => {
    try {
      await projectStorage.updateProjectStatus(projectId, newStatus, notes);
      reload(); // Reload all projects after status update
    } catch (error) {
      console.error('Failed to update project status:', error);
      throw error; // Propagate error to component for proper error handling
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <FolderGit2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Project Management</h1>
          </div>

          <div className="space-y-6">
            {data?.map((project) => (
              <div
                key={project.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-white">
                      <Link to={`/admin/projects/${project.id}`} className="hover:text-purple-400">
                        {project.title}
                      </Link>
                    </h3>
                    <p className="text-gray-400">{project.shortDescription}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 text-sm ${STATUS_BADGES[project.status].className}`}>
                      {STATUS_BADGES[project.status].icon}
                      <span>{STATUS_BADGES[project.status].label}</span>
                    </div>
                    <ProjectStatusChange
                      currentStatus={project.status}
                      onStatusChange={(status, notes) => handleStatusChange(project.id, status, notes)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Submitted {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                {project.adminNotes && (
                  <div className="mt-4 p-3 bg-gray-900/50 border border-white/10 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-orange-300 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Admin Notes</span>
                    </div>
                    <p className="text-sm text-gray-300">{project.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}

            {(!data || data.length === 0) && (
              <div className="text-center py-12 text-gray-400">
                No projects found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}