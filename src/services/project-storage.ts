import { supabase } from '../config/supabase';
import type { Project, ProjectFormData, ProjectStatus } from '../types/project';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1000';

function sanitizeMediaUrl(url: string): string {
  // Immediately replace blob URLs with fallback
  if (url.startsWith('blob:')) {
    return FALLBACK_IMAGE;
  }
  return url;
}

async function transformProjectData(data: any): Promise<Project> {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    shortDescription: data.short_description,
    features: data.features || [],
    techStack: data.tech_stack || [],
    media: data.project_media?.map((m: any) => ({
      type: m.type,
      url: sanitizeMediaUrl(m.url),
      title: m.title,
      thumbnail: m.thumbnail
    })) || [],
    links: data.project_links?.map((l: any) => ({
      type: l.type,
      url: l.url,
      title: l.title
    })) || [],
    tags: data.project_tags?.map((t: any) => t.tags.name) || [],
    status: data.status,
    adminNotes: data.admin_notes,
    likes: data.likes_count || 0,
    views: data.views_count || 0,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

class ProjectStorageService {
  private static instance: ProjectStorageService;

  private constructor() {
    // Initialize Supabase client in constructor if needed
  }

  private normalizeStatus(status: string | undefined): ProjectStatus {
    const validStatuses: ProjectStatus[] = ['waiting_approval', 'flagged', 'approved', 'changes_requested'];
    return validStatuses.includes(status as ProjectStatus) ? status as ProjectStatus : 'waiting_approval';
  }

  static getInstance(): ProjectStorageService {
    if (!ProjectStorageService.instance) {
      ProjectStorageService.instance = new ProjectStorageService();
    }
    return ProjectStorageService.instance;
  }

  async createProject(userId: string, data: ProjectFormData): Promise<Project> {
    // Start a transaction
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        short_description: data.shortDescription,
        features: data.features,
        tech_stack: data.techStack,
        status: 'waiting_approval'
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Insert media
    if (data.media.length > 0) {
      const { error: mediaError } = await supabase
        .from('project_media')
        .insert(
          data.media.map((m, index) => ({
            project_id: project.id,
            type: m.type,
            url: m.url,
            title: m.title,
            order: index
          }))
        );

      if (mediaError) throw mediaError;
    }

    // Insert links
    if (data.links.length > 0) {
      const { error: linksError } = await supabase
        .from('project_links')
        .insert(
          data.links.map(l => ({
            project_id: project.id,
            type: l.type,
            url: l.url
          }))
        );

      if (linksError) throw linksError;
    }

    // Insert tags
    if (data.tags.length > 0) {
      // Get tag IDs
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', data.tags);

      if (tagError) throw tagError;

      const { error: tagLinkError } = await supabase
        .from('project_tags')
        .insert(
          tagData.map(tag => ({
            project_id: project.id,
            tag_id: tag.id
          }))
        );

      if (tagLinkError) throw tagLinkError;
    }

    // Return the complete project
    return this.getProjectById(project.id) as Promise<Project>;
  }

  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_media (*),
        project_links (*),
        project_tags (
          tag_id,
          tags (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Promise.all(data.map(transformProjectData));
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_media (*),
        project_links (*),
        project_tags (
          tag_id,
          tags (name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Promise.all(data.map(transformProjectData));
  }

  async getPublicProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_media (*),
        project_links (*),
        project_tags (
          tag_id,
          tags (name)
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Promise.all(data.map(transformProjectData));
  }

  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_media (*),
        project_links (*),
        project_tags (
          tag_id,
          tags (name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return transformProjectData(data);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    // First update the main project data
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: updates.title,
        description: updates.description,
        short_description: updates.shortDescription,
        features: updates.features,
        tech_stack: updates.techStack,
        status: updates.status,
        admin_notes: updates.adminNotes,
        likes_count: updates.likes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If tags are provided, update them
    if (updates.tags) {
      // First get tag IDs for the new tags
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', updates.tags);

      if (tagError) throw tagError;

      // Remove existing tag associations
      const { error: deleteError } = await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', id);

      if (deleteError) throw deleteError;

      // Add new tag associations
      if (tagData.length > 0) {
        const { error: insertError } = await supabase
          .from('project_tags')
          .insert(
            tagData.map(tag => ({
              project_id: id,
              tag_id: tag.id
            }))
          );

        if (insertError) throw insertError;
      }
    }

    return this.getProjectById(data.id) as Promise<Project>;
  }

  async updateProjectStatus(id: string, status: ProjectStatus, adminNotes?: string): Promise<Project> {
    try {
      // Update and return the project in a single query
      const { data: project, error: updateError } = await supabase
        .from('projects')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          project_media (*),
          project_links (*),
          project_tags (
            tag_id,
            tags (name)
          )
        `)
        .single();

      if (updateError) throw updateError;
      if (!project) throw new Error('Failed to fetch updated project');

      return transformProjectData(project);

    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    return !error;
  }
}

export const projectStorage = ProjectStorageService.getInstance();