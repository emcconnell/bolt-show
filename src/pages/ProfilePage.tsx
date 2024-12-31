import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { User as UserIcon, Mail, Building2, MapPin, Link as LinkIcon, Calendar, Github, Linkedin, Twitter, Instagram, Youtube, Send } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { projectStorage } from '../services/project-storage';
import { ProjectCard } from '../components/ProjectCard';
import type { Project } from '../types/project';

const SocialIcon = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  website: LinkIcon
};

export function ProfilePage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profileData, loading: profileLoading, error: profileError } = useSupabaseData({
    query: 'profiles',
    requireAuth: true,
    transform: (data) => {
      const profile = data?.find(p => p.user_id === user?.id);
      return profile ? {
        id: profile.id,
        userId: profile.user_id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url || '',
        bio: profile.bio || '',
        company: profile.company,
        location: profile.location,
        website: profile.website,
        companyLogo: profile.company_logo,
        socialLinks: profile.social_links,
        displayPreferences: profile.display_preferences,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at)
      } : null;
    },
    dependencies: [user?.id]
  });

  const { data: projectsData, loading: projectsLoading } = useSupabaseData({
    query: 'projects',
    requireAuth: true,
    transform: (data) => {
      return data
        ?.filter(p => p.user_id === user?.id)
        ?.map(p => ({
          id: p.id,
          userId: p.user_id,
          title: p.title,
          description: p.description,
          shortDescription: p.short_description,
          features: p.features || [],
          techStack: p.tech_stack || [],
          media: p.project_media || [],
          links: p.project_links || [],
          tags: p.project_tags?.map((t: any) => t.tags?.name) || [],
          status: p.status,
          adminNotes: p.admin_notes,
          likes: p.likes_count || 0,
          views: p.views_count || 0,
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at)
        }))
        .filter(p => !p.media?.[0]?.url?.startsWith('blob:'));
    },
    dependencies: [user?.id]
  });
  const [avatarError, setAvatarError] = useState(false);
  const fallbackAvatar = '/images/noun-wizard-4016879-FFFFFF.png';

  const loading = profileLoading || projectsLoading;
  const error = profileError;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p className="text-gray-400">Please log in to view your profile</p>
      </div>
    );
  }

  const handleSubmitClick = () => {
    navigate('/submit');
  };

  const shouldShowField = (field: string, profile: any) => {
    return profile?.displayPreferences?.[field] ?? true;
  };

  const getSocialLinks = (profile: any) => {
    if (!profile?.socialLinks) return [];
    
    return Object.entries(profile.socialLinks)
      .filter(([_, value]) => value && typeof value === 'string')
      .map(([key, value]) => ({
        name: key,
        url: value,
        icon: SocialIcon[key as keyof typeof SocialIcon]
      }));
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
        {profileData && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {shouldShowField('showProfilePicture', profileData) && (
                  <div className="md:col-span-1">
                    {profileData.avatarUrl ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white">
                        <ImageWithFallback
                          src={avatarError ? fallbackAvatar : profileData.avatarUrl}
                          fallbackSrc="/images/noun-wizard-4016879-FFFFFF.png"
                          alt={profileData.displayName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={() => setAvatarError(true)}
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-white/5 border border-white flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}

                <div className="md:col-span-2">
                  <h1 className="text-3xl font-bold text-white mb-2">{profileData.displayName}</h1>
                  {profileData.bio && (
                    <p className="text-gray-300 mb-6">{profileData.bio}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {shouldShowField('showContactInfo', profileData) && user.email && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Mail className="w-5 h-5 text-purple-400" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    
                    {shouldShowField('showCompanyName', profileData) && profileData.company && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Building2 className="w-5 h-5 text-purple-400" />
                        <span>{profileData.company}</span>
                      </div>
                    )}
                    
                    {shouldShowField('showContactInfo', profileData) && profileData.location && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPin className="w-5 h-5 text-purple-400" />
                        <span>{profileData.location}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {shouldShowField('showSocialLinks', profileData) && getSocialLinks(profileData).length > 0 && (
                    <div className="mt-6">
                      <h2 className="text-sm font-medium text-gray-400 mb-3">Connect with {profileData.displayName}</h2>
                      <div className="flex flex-wrap gap-3">
                        {getSocialLinks(profileData).map(({ name, url, icon: Icon }) => (
                          <a
                            key={name}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm capitalize">{name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmitClick}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-xl shadow-lg ring-2 ring-purple-400/20 flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Project</span>
              </button>
            </div>

            {/* User's Projects Section */}
            {projectsData?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-white mb-6">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projectsData.map(project => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.shortDescription}
                      image={project.media[0]?.url || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1000'}
                      author={user.id}
                      likes={project.likes}
                      tags={project.tags}
                      links={project.links}
                      status={project.status}
                      adminNotes={project.adminNotes}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}