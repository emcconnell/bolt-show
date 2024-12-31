import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, Globe, Lock, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MediaUpload } from '../components/project/MediaUpload';
import { TagInput } from '../components/project/TagInput';
import { LinkInput } from '../components/project/LinkInput';
import type { ProjectFormData, ProjectMedia, ProjectLink } from '../types/project';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { useAuth } from '../hooks/useAuth';
import { projectStorage } from '../services/project-storage';
import { useProjectFormValidation } from '../hooks/useProjectFormValidation';
import { FormField } from '../components/form/FormField';
import { tagStorage } from '../services/tag-storage';
import type { Tag } from '../types/tag';

const INITIAL_FORM_DATA: ProjectFormData = {
  title: '',
  description: '',
  shortDescription: '',
  media: [],
  tags: [],
  links: [],
  features: [],
  techStack: []
};

export function SubmitProjectPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editProjectId = searchParams.get('edit');
  
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [success, setSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<keyof ProjectFormData>>(new Set());
  const { errors: validationErrors, isValid } = useProjectFormValidation(formData);

  useEffect(() => {
    const loadTags = async () => {
      const tags = await tagStorage.getAllTags();
      setAvailableTags(tags);
    };
    loadTags();
  }, []);

  useEffect(() => {
    const loadProject = async () => {
      if (editProjectId) {
        const project = await projectStorage.getProjectById(editProjectId);
        if (project && project.userId === user?.id) {
          setFormData({
            title: project.title,
            description: project.description,
            shortDescription: project.shortDescription,
            media: project.media,
            tags: project.tags,
            links: project.links,
            features: project.features,
            techStack: project.techStack
          });
        } else {
          navigate('/profile');
        }
      }
    };
    loadProject();
  }, [editProjectId, user?.id, navigate]);

  const handleFieldChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !user) {
      // Mark all fields as touched to show errors
      setTouchedFields(new Set(Object.keys(formData) as Array<keyof ProjectFormData>));
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editProjectId) {
        await projectStorage.updateProject(editProjectId, {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Project updated successfully');
      } else {
        await projectStorage.createProject(user.id, formData);
        toast.success('Project submitted successfully');
      }
      navigate('/profile');
    } catch (error) {
      console.error('Failed to submit project:', error);
      toast.error('Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            {editProjectId ? (
              <Pencil className="w-8 h-8 text-purple-400" />
            ) : (
              <Upload className="w-8 h-8 text-purple-400" />
            )}
            <h1 className="text-2xl font-bold text-white">
              {editProjectId ? 'Edit Project' : 'Submit Your Project'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <FormField
                label="Project Title"
                error={validationErrors.title}
                touched={touchedFields.has('title')}
                required
              >
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter project title"
                />
              </FormField>

              <FormField
                label="Short Description"
                error={validationErrors.shortDescription}
                touched={touchedFields.has('shortDescription')}
                required
                description="Brief description for project cards (max 150 characters)"
              >
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description for project cards"
                  maxLength={150}
                />
              </FormField>

              <FormField
                label="Full Description"
                error={validationErrors.description}
                touched={touchedFields.has('description')}
                required
              >
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Detailed project description"
                  rows={6}
                />
              </FormField>

              <FormField
                label="Project Media"
                error={validationErrors.media}
                touched={touchedFields.has('media')}
                required
              >
                <MediaUpload
                  media={formData.media}
                  onMediaAdd={(media) => handleFieldChange('media', [...formData.media, media])}
                  onMediaRemove={(index) => setFormData(prev => ({
                    ...prev,
                    media: prev.media.filter((_, i) => i !== index)
                  }))}
                />
              </FormField>

              <FormField
                label="Project Links"
                error={validationErrors.links}
                touched={touchedFields.has('links')}
              >
                <LinkInput
                  links={formData.links}
                  onLinksChange={(links) => handleFieldChange('links', links)}
                />
              </FormField>

              <FormField
                label="Technologies Used"
                error={validationErrors.techStack}
                touched={touchedFields.has('techStack')}
                required
              >
                <textarea
                  value={formData.techStack.join('\n')}
                  onChange={(e) => handleFieldChange('techStack', e.target.value.split('\n').filter(Boolean))}
                  className="mt-1 w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="List the technologies used in your project"
                  rows={3}
                />
              </FormField>

              <FormField
                label="Project Tags"
                error={validationErrors.tags}
                touched={touchedFields.has('tags')}
                required
                description="Select 1-3 tags that best describe your project"
              >
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setFormData(prev => {
                          const newTags = prev.tags.includes(tag.name)
                            ? prev.tags.filter(t => t !== tag.name)
                            : prev.tags.length < 3
                              ? [...prev.tags, tag.name]
                              : prev.tags;
                          return { ...prev, tags: newTags };
                        });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.tags.includes(tag.name)
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                      disabled={!formData.tags.includes(tag.name) && formData.tags.length >= 3}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-xl shadow-lg ring-2 ring-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    <span>{editProjectId ? 'Updating...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    {editProjectId ? 'Update Project' : 'Submit Project'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}